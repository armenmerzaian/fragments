// tests/unit/post.test.js

const request = require('supertest');
const app = require('../../src/app');
const hash = require('../../src/hash');
require('dotenv').config();

describe('POST /v1/fragments', () => {
  // Authentication tests
  describe('Authentication test', () => {
    test('unauthenticated requests should be denied', async () => {
      const res = await request(app).post('/v1/fragments');
      expect(res.statusCode).toBe(401);
    });

    test('incorrect credentials should be denied', async () => {
      const res = await request(app)
        .post('/v1/fragments')
        .auth('invalid@email.com', 'incorrect_password');
      expect(res.statusCode).toBe(401);
    });

    // Valid requests
    test('authenticated users can create a plain text fragment', async () => {
      const res = await request(app)
        .post('/v1/fragments')
        .auth('user1@email.com', 'password1')
        .set('Content-Type', 'text/plain')
        .send('This is a fragment');

      expect(res.statusCode).toBe(201);
    });

    test('authenticated users can create a plain text fragment with charset=utf-8', async () => {
      const res = await request(app)
        .post('/v1/fragments')
        .auth('user1@email.com', 'password1')
        .set('Content-Type', 'text/plain; charset=utf-8')
        .send('This is a fragment with charset');

      expect(res.statusCode).toBe(201);
      expect(res.body.fragment.type).toBe('text/plain; charset=utf-8');
    });

    test('authenticated users can create a JSON fragment', async () => {
      const res = await request(app)
        .post('/v1/fragments')
        .auth('user1@email.com', 'password1')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify({ message: 'This is a JSON fragment' }));
  
      expect(res.statusCode).toBe(201);
    });
  
    test('authenticated users can create a Markdown fragment', async () => {
      const res = await request(app)
        .post('/v1/fragments')
        .auth('user1@email.com', 'password1')
        .set('Content-Type', 'text/markdown')
        .send('# This is a markdown fragment');
  
      expect(res.statusCode).toBe(201);
    });
  
    test('authenticated users can create an HTML fragment', async () => {
      const res = await request(app)
        .post('/v1/fragments')
        .auth('user1@email.com', 'password1')
        .set('Content-Type', 'text/html')
        .send('<p>This is a HTML fragment</p>');
  
      expect(res.statusCode).toBe(201);
    });
  
    test('authenticated users can create a CSV fragment', async () => {
      const res = await request(app)
        .post('/v1/fragments')
        .auth('user1@email.com', 'password1')
        .set('Content-Type', 'text/csv')
        .send('firstname,lastname\narmen,merzaian\nsanta,claus');
  
      expect(res.statusCode).toBe(201);
    });
  });


  describe('Content-Type tests', () => {
    // Invalid requests
    test('requests with missing Content-Type should return error', async () => {
      const res = await request(app)
        .post('/v1/fragments')
        .auth('user1@email.com', 'password1')
        .send('This is a fragment');

      expect(res.statusCode).toBe(415);
    });

    test('requests with invalid Content-Type should return an error', async () => {
      const res = await request(app)
        .post('/v1/fragments')
        .auth('user1@email.com', 'password1')
        .set('Content-Type', 'invalid')
        .send('This is a fragment');

      expect(res.statusCode).toBe(500);
      expect(res.body.status).toBe('error');
    });

    test('unsupported media type returns proper error response', async () => {
      const res = await request(app)
        .post('/v1/fragments')
        .auth('user1@email.com', 'password1')
        .set('Content-Type', 'application/msword')
        .send('This is a fragment');

      expect(res.statusCode).toBe(415);
      expect(res.body.status).toBe('error');
      expect(res.body.error.message).toBe('Unsupported media type: application/msword');
    });
  });

  describe('Body tests', () => {
    test('requests with empty body returns is successful', async () => {
      const res = await request(app)
        .post('/v1/fragments')
        .auth('user1@email.com', 'password1')
        .set('Content-Type', 'text/plain')
        .send();
  
      expect(res.statusCode).toBe(201);
    });
  });

  describe('Successful Response tests', () => {
    // Successful responses
    test('A successful response should include status and a fragment object', async () => {
      const res = await request(app)
        .post('/v1/fragments')
        .auth('user1@email.com', 'password1')
        .set('Content-Type', 'text/plain')
        .send('This is a fragment');

      expect(res.body.status).toBe('ok');
      expect(res.body.fragment).toBeDefined();
    });

    test('A successful response fragment object should include all necessary properties', async () => {
      const res = await request(app)
        .post('/v1/fragments')
        .auth('user1@email.com', 'password1')
        .set('Content-Type', 'text/plain')
        .send('This is a fragment');

      expect(res.body.fragment.ownerId).toBe(hash('user1@email.com'));
      expect(res.body.fragment.created).toBeDefined();
      expect(res.body.fragment.updated).toBeDefined();
      expect(res.body.fragment.size).toEqual('This is a fragment'.length);
      expect(res.body.fragment.type).toBe('text/plain');
      expect(res.body.fragment.id).toMatch(
        /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/
      );

      // Ensure the response looks like the specified structure
      expect(res.body).toEqual({
        status: 'ok',
        fragment: {
          id: res.body.fragment.id,
          created: res.body.fragment.created,
          updated: res.body.fragment.updated,
          ownerId: hash('user1@email.com'),
          type: 'text/plain',
          size: 'This is a fragment'.length,
        },
      });
    });

    test('response header should have the right properties', async () => {
      const res = await request(app)
        .post('/v1/fragments')
        .auth('user1@email.com', 'password1')
        .set('Content-Type', 'text/plain')
        .send('This is a fragment');

      expect(res.statusCode).toBe(201);
      expect(res.get('Content-Type')).toBe('application/json; charset=utf-8');
      expect(res.get('Content-Length')).toBeDefined();
      expect(res.get('Location')).toBe(
        `${res.request.host || process.env.API_URL}/v1/fragments/${res.body.fragment.id}`
      );
    });
  });

});
