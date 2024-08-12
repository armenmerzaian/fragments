const request = require('supertest');
const hash = require('../../src/hash');
const app = require('../../src/app');
const { Fragment } = require('../../src/model/fragment');

describe('PUT /v1/fragments/:id', () => {
  // If the request is missing the Authorization header, it should be forbidden
  test('unauthenticated requests are denied', () => {
    return request(app).put('/v1/fragments/1').expect(401);
  });

  // If the wrong username/password pair are used (no such user), it should be forbidden
  test('incorrect credentials are denied', () => {
    return request(app)
      .put('/v1/fragments/1')
      .auth('invalid@email.com', 'incorrect_password')
      .expect(401);
  });

  // Using a valid username/password pair should allow updating the fragment
  test('authenticated users can update their fragment by id', async () => {
    const userEmail = 'user1@email.com';
    const userId = hash(userEmail);
    const fragmentId = '103';

    const fragment = new Fragment({ id: fragmentId, ownerId: userId, type: 'text/plain' });
    await fragment.save();
    await fragment.setData(Buffer.from('This is a fragment'));

    const res = await request(app)
      .put(`/v1/fragments/${fragmentId}`)
      .auth(userEmail, 'password1')
      .set('Content-Type', 'text/plain')
      .send('This is an updated fragment');

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.fragment.id).toBe(fragmentId);

    const updatedFragment = await Fragment.byId(userId, fragmentId);
    const updatedData = await updatedFragment.getData();
    expect(updatedData.toString()).toBe('This is an updated fragment');
  });

  // Test for non-existing fragment
  test('returns 404 if fragment is not found', async () => {
    const res = await request(app)
      .put('/v1/fragments/999')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send('This is an updated fragment');

    expect(res.statusCode).toBe(404);
    expect(res.body.status).toBe('error');
    expect(res.body.error.message).toBe('Fragment not found');
  });

  // Test for Content-Type mismatch
  test('returns 400 if Content-Type does not match fragment type', async () => {
    const userEmail = 'user1@email.com';
    const userId = hash(userEmail);
    const fragmentId = '104';

    const fragment = new Fragment({ id: fragmentId, ownerId: userId, type: 'text/plain' });
    await fragment.save();
    await fragment.setData(Buffer.from('This is a fragment'));

    const res = await request(app)
      .put(`/v1/fragments/${fragmentId}`)
      .auth(userEmail, 'password1')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify({ message: 'This is an updated fragment' }));

    expect(res.statusCode).toBe(400);
    expect(res.body.status).toBe('error');
    expect(res.body.error.message).toBe(
      `Content-Type mismatch: expected text/plain, got application/json`
    );
  });

  // Test for empty body
  test('returns 200 if body is empty, because we are updating the fragment', async () => {
    const userEmail = 'user1@email.com';
    const userId = hash(userEmail);
    const fragmentId = '105';

    const fragment = new Fragment({ id: fragmentId, ownerId: userId, type: 'text/plain' });
    await fragment.save();
    await fragment.setData(Buffer.from('This is a fragment'));

    const res = await request(app)
      .put(`/v1/fragments/${fragmentId}`)
      .auth(userEmail, 'password1')
      .set('Content-Type', 'text/plain')
      .send();

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.fragment.id).toBe(fragmentId);
  });
});
