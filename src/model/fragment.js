//Professor + Armen Merzaian

// Use crypto.randomUUID() to create unique IDs, see:
// https://nodejs.org/api/crypto.html#cryptorandomuuidoptions
const { randomUUID } = require('crypto');
// Use https://www.npmjs.com/package/content-type to create/parse Content-Type headers
const contentType = require('content-type');

const MarkdownIt = require('markdown-it');
const sharp = require('sharp');
const yaml = require('yaml');

// Functions for working with fragment metadata/data using our DB
const {
  readFragment,
  writeFragment,
  readFragmentData,
  writeFragmentData,
  listFragments,
  deleteFragment,
} = require('./data');

const supportedTypes = [
  'text/plain',
  'text/plain; charset=utf-8',
  'text/markdown',
  'text/html',
  'text/csv',
  'application/json',
  'application/yaml',
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
  'image/avif'
]

class Fragment {

  constructor({ id, ownerId, created, updated, type, size = 0 }) {

    if (!ownerId || !type) {
      throw new Error('ownerId and type are required');
    }

    if (typeof size !== 'number') {
      throw new Error('size must be a number');
    }

    if (size < 0) {
      throw new Error('size cannot be negative');
    }

    if (Fragment.isSupportedType(type) == false) {
      throw new Error(`Unsupported type: ${type}`);
    }

    this.id = id || randomUUID();
    this.ownerId = ownerId;
    this.type = type;
    this.size = size;
    this.created = created || new Date().toISOString();
    this.updated = updated || new Date().toISOString();

  }

  /**
   * Get all fragments (id or full) for the given user
   * @param {string} ownerId user's hashed email
   * @param {boolean} expand whether to expand ids to full fragments
   * @returns Promise<Array<Fragment>>
   */
  static async byUser(ownerId, expand = false) {
    return await listFragments(ownerId, expand);
  }

  /**
   * Gets a fragment for the user by the given id.
   * @param {string} ownerId user's hashed email
   * @param {string} id fragment's id
   * @returns Promise<Fragment>
   */
  static async byId(ownerId, id) {
    const fragmentData = await readFragment(ownerId, id);
    if (!fragmentData) {
      throw new Error(`Fragment not found: ${id}`);
    }
    return new Fragment(fragmentData);
  }

  /**
   * Delete the user's fragment data and metadata for the given id
   * @param {string} ownerId user's hashed email
   * @param {string} id fragment's id
   * @returns Promise<void>
   */
  static async delete(ownerId, id) {
    await deleteFragment(ownerId, id);
  }

  /**
   * Saves the current fragment to the database
   * @returns Promise<void>
   */
  async save() {
    this.updated = new Date().toISOString();
    await writeFragment(this);
  }

  /**
   * Gets the fragment's data from the database
   * @returns Promise<Buffer>
   */
  async getData() {
    return Buffer.from(await readFragmentData(this.ownerId, this.id));
  }

  /**
   * Set's the fragment's data in the database
   * @param {Buffer} data
   * @returns Promise<void>
   */
  async setData(data) {
    if (!Buffer.isBuffer(data)) {
      throw new Error('Data must be a buffer');
    }
    this.size = data.length;
    this.updated = new Date().toISOString();
    await this.save();
    await writeFragmentData(this.ownerId, this.id, data);
  }

  /**
   * Returns the mime type (e.g., without encoding) for the fragment's type:
   * "text/html; charset=utf-8" -> "text/html"
   * @returns {string} fragment's mime type (without encoding)
   */
  get mimeType() {
    const { type } = contentType.parse(this.type);
    return type;
  }

  /**
   * Returns true if this fragment is a text/* mime type
   * @returns {boolean} true if fragment's type is text/*
   */
  get isText() {
    return this.type.startsWith('text/');
  }

  /**
   * Returns the formats into which this fragment type can be converted
   * @returns {Array<string>} list of supported mime types
   */
  get formats() {
    if (this.isText) {
      if (this.type === 'text/plain' || this.type === 'text/plain; charset=utf-8') {
        return ['text/plain'];
      } else if (this.type === 'text/markdown') {
        return ['text/markdown', 'text/html', 'text/plain'];
      } else if (this.type === 'text/html') {
        return ['text/html', 'text/plain'];
      } else if (this.type === 'text/csv') {
        return ['text/csv', 'text/plain', 'application/json'];
      }
    } else if (this.type === 'application/json') {
      return ['application/json', 'application/yaml', 'text/plain'];
    } else if (this.type === 'application/yaml') {
      return ['application/yaml', 'text/plain'];
    } else if (this.type.startsWith('image/')) {
      return ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/avif'];
    }
    return [];
  }

  /**
   * Returns true if we know how to work with this content type
   * @param {string} value a Content-Type value (e.g., 'text/plain' or 'text/plain: charset=utf-8')
   * @returns {boolean} true if we support this Content-Type (i.e., type/subtype)
   */
  static isSupportedType(value) {
    const { type } = contentType.parse(value);
    return supportedTypes.includes(type); //true if yes, false if no
  }

  /**
   * Converts fragment data to a supported format based on the extension.
   * @param {Buffer} data - The fragment data.
   * @param {string} ext - The target extension for conversion (e.g., .html).
   * @returns {Object} - An object containing the converted data and content type.
   */
  async convertTo(data, ext) {
    let convertedData;
    let convertedType;

    switch (this.mimeType) {
      case 'text/plain':
        if (ext === '.txt') {
          convertedData = data;
          convertedType = 'text/plain';
        } else {
          throw new Error('Unsupported conversion');
        }
        break;

      case 'text/markdown':
        if (ext === '.md') {
          convertedData = data;
          convertedType = 'text/markdown';
        } else if (ext === '.txt') {
          convertedData = Buffer.from(data.toString());
          convertedType = 'text/plain';
        } else if (ext === '.html') {
          const md = new MarkdownIt();
          convertedData = Buffer.from(md.render(data.toString()).trim());
          convertedType = 'text/html';
        } else {
          throw new Error('Unsupported conversion');
        }
        break;

      case 'text/html':
        if (ext === '.html') {
          convertedData = data;
          convertedType = 'text/html';
        } else if (ext === '.txt') {
          convertedData = Buffer.from(data.toString());
          convertedType = 'text/plain';
        } else {
          throw new Error('Unsupported conversion');
        }
        break;

      case 'text/csv':
        if (ext === '.csv') {
          convertedData = data;
          convertedType = 'text/csv';
        } else if (ext === '.txt') {
          convertedData = Buffer.from(data.toString());
          convertedType = 'text/plain';
        } else if (ext === '.json') {
          const csvString = data.toString();
          const [header, ...rows] = csvString.split('\n').map((row) => row.split(','));
          const jsonArray = rows.map((row) => {
            return header.reduce((obj, key, i) => ({ ...obj, [key]: row[i] }), {});
          });
          convertedData = Buffer.from(JSON.stringify(jsonArray, null, 2));
          convertedType = 'application/json';
        } else {
          throw new Error('Unsupported conversion');
        }
        break;

      case 'application/json':
        if (ext === '.json') {
          convertedData = data;
          convertedType = 'application/json';
        } else if (ext === '.yaml' || ext === '.yml') {
          const jsonData = JSON.parse(data.toString());
          convertedData = Buffer.from(yaml.stringify(jsonData));
          convertedType = 'application/yaml';
        } else if (ext === '.txt') {
          convertedData = Buffer.from(data.toString());
          convertedType = 'text/plain';
        } else {
          throw new Error('Unsupported conversion');
        }
        break;

      case 'application/yaml':
        if (ext === '.yaml' || ext === '.yml') {
          convertedData = data;
          convertedType = 'application/yaml';
        } else if (ext === '.txt') {
          convertedData = Buffer.from(data.toString());
          convertedType = 'text/plain';
        } else {
          throw new Error('Unsupported conversion');
        }
        break;

      case 'image/png':
      case 'image/jpeg':
      case 'image/webp':
      case 'image/gif':
      case 'image/avif':
        if (['.png', '.jpg', '.webp', '.gif', '.avif'].includes(ext)) {
          const format = ext.substring(1);
          convertedData = await sharp(data).toFormat(format).toBuffer();
          convertedType = format === 'jpg' ? 'image/jpeg' : `image/${format}`;
        } else {
          throw new Error('Unsupported conversion');
        }
        break;

      default:
        throw new Error('Unsupported conversion');
    }

    return { data: convertedData, type: convertedType };
  }
}

module.exports.Fragment = Fragment;
