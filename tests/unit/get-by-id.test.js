const request = require('supertest');
const hash = require('../../src/hash');
const app = require('../../src/app');
const { Fragment } = require('../../src/model/fragment');

describe('GET /v1/fragments/:id', () => {
  // If the request is missing the Authorization header, it should be forbidden
  test('unauthenticated requests are denied', () => {
    return request(app).get('/v1/fragments/1').expect(401);
  });

  // If the wrong username/password pair are used (no such user), it should be forbidden
  test('incorrect credentials are denied', () => {
    return request(app)
      .get('/v1/fragments/1')
      .auth('invalid@email.com', 'incorrect_password')
      .expect(401);
  });

  // Using a valid username/password pair should give a success result with the fragment data
  test('authenticated users can retrieve their fragment by id', async () => {
    const userEmail = 'user1@email.com';
    const userId = hash(userEmail);
    const fragmentId = '102';

    const fragment = new Fragment({ id: fragmentId, ownerId: userId, type: 'text/plain' });
    await fragment.save();
    await fragment.setData(Buffer.from('This is a fragment'));

    const res = await request(app).get(`/v1/fragments/${fragmentId}`).auth(userEmail, 'password1');
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toBe('text/plain');
    expect(res.text).toBe('This is a fragment');
  });

  const supportedTypes = [
    { type: 'text/plain', data: 'This is plain text' },
    { type: 'text/plain; charset=utf-8', data: 'This is plain text with charset' },
    { type: 'text/markdown', data: '# This is markdown' },
    { type: 'text/html', data: '<p>This is HTML</p>' },
    { type: 'text/csv', data: 'name,age\nJohn,30\nDoe,25' },
    { type: 'application/json', data: JSON.stringify({ key: 'value' }) },
    { type: 'application/yaml', data: 'key: value' },
  ];

  supportedTypes.forEach(({ type, data }) => {
    test(`authenticated users can retrieve their fragment of type ${type}`, async () => {
      const userEmail = 'user1@email.com';
      const userId = hash(userEmail);
      const fragmentId = `fragment-${type.replace('/', '-')}`;

      const fragment = new Fragment({ id: fragmentId, ownerId: userId, type });
      await fragment.save();
      await fragment.setData(Buffer.from(data));

      const res = await request(app)
        .get(`/v1/fragments/${fragmentId}`)
        .auth(userEmail, 'password1');
      expect(res.statusCode).toBe(200);
      expect(res.headers['content-type']).toBe(type);
      expect(res.text).toBe(data);
    });
  });

  // Test for non-existing fragment
  test('returns 404 if fragment is not found', async () => {
    const res = await request(app).get('/v1/fragments/999').auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(404);
    expect(res.body.status).toBe('error');
    expect(res.body.error.message).toBe('Fragment not found');
  });

  // Test for unsupported conversion type
  test('returns 415 if conversion type is unsupported', async () => {
    const userEmail = 'user1@email.com';
    const userId = hash(userEmail);
    const fragmentId = '1204';

    const fragment = new Fragment({ id: fragmentId, ownerId: userId, type: 'text/markdown' });
    await fragment.save();
    await fragment.setData(Buffer.from('# This is a fragment'));

    const res = await request(app)
      .get(`/v1/fragments/${fragmentId}.png`)
      .auth(userEmail, 'password1');
    expect(res.statusCode).toBe(415);
    expect(res.body.status).toBe('error');
    expect(res.body.error.message).toBe('Unsupported conversion type');
  });

  // Test for converting Markdown fragment to HTML
  test('authenticated users can convert Markdown fragment to HTML', async () => {
    const userEmail = 'user1@email.com';
    const userId = hash(userEmail);
    const fragmentId = '568';

    const fragment = new Fragment({ id: fragmentId, ownerId: userId, type: 'text/markdown' });
    await fragment.save();
    await fragment.setData(Buffer.from('# This is a fragment'));

    const res = await request(app)
      .get(`/v1/fragments/${fragmentId}.html`)
      .auth(userEmail, 'password1');
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toBe('text/html');
    expect(res.text).toBe('<h1>This is a fragment</h1>');
  });

});
