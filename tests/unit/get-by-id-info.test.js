const request = require('supertest');
const hash = require('../../src/hash');
const app = require('../../src/app');
const { Fragment } = require('../../src/model/fragment');

describe('GET /v1/fragments/:id/info', () => {
  
  test('unauthenticated requests are denied', () => {
    return request(app).get('/v1/fragments/1/info').expect(401);
  });

  test('incorrect credentials are denied', () => {
    return request(app)
      .get('/v1/fragments/1/info')
      .auth('invalid@email.com', 'incorrect_password')
      .expect(401);
  });

  // Using a valid username/password pair should give a success result with the fragment metadata
  test('authenticated users can retrieve their fragment metadata by id', async () => {
    const userEmail = 'user1@email.com';
    const userId = hash(userEmail);
    const fragmentId = '592';

    const fragment = new Fragment({ id: fragmentId, ownerId: userId, type: 'text/plain' });
    await fragment.save();

    const res = await request(app)
      .get(`/v1/fragments/${fragmentId}/info`)
      .auth(userEmail, 'password1');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.fragment.id).toBe(fragmentId);
    expect(res.body.fragment.ownerId).toBe(userId);
  });

  // Test for non-existing fragment
  test('returns 404 if fragment is not found', async () => {
    const res = await request(app)
      .get('/v1/fragments/nonexistent/info')
      .auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(404);
    expect(res.body.status).toBe('error');
    expect(res.body.error.message).toBe('Fragment not found');
  });
});

