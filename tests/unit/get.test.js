// tests/unit/get.test.js

const request = require('supertest');
const hash = require('../../src/hash');
const app = require('../../src/app');
const { Fragment } = require('../../src/model/fragment')

describe('GET /v1/fragments', () => {
  // If the request is missing the Authorization header, it should be forbidden
  test('unauthenticated requests are denied', () => request(app).get('/v1/fragments').expect(401));

  // If the wrong username/password pair are used (no such user), it should be forbidden
  test('incorrect credentials are denied', () =>
    request(app).get('/v1/fragments').auth('invalid@email.com', 'incorrect_password').expect(401));

  // Using a valid username/password pair should give a success result with a .fragments array
  test('authenticated users get a fragments array', async () => {
    const res = await request(app).get('/v1/fragments').auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(Array.isArray(res.body.fragments)).toBe(true);
  });

  test('authenticated user gets their fragment ids', async () => {
    const userEmail = 'user1@email.com';
    const userId = hash(userEmail);

    const fragment1 = new Fragment({ id: '100', ownerId: userId, type: 'text/plain' });
    const fragment2 = new Fragment({ id: '101', ownerId: userId, type: 'text/plain' });
    await fragment1.save();
    await fragment2.save();

    const res = await request(app).get('/v1/fragments').auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.fragments).toEqual(['100', '101']);
  });

  test('returns an empty array if user has no fragments', async () => {
    const res = await request(app).get('/v1/fragments').auth('user2@email.com', 'password2');

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.fragments)).toBe(true);
    expect(res.body.fragments.length).toBe(0);
  });

  test('authenticated user gets their expanded fragment metadata with expand=1', async () => {
    const userEmail = 'user1@email.com';
    const userId = hash(userEmail);

    const fragment1 = new Fragment({ id: '100', ownerId: userId, type: 'text/plain', size: 5 });
    const fragment2 = new Fragment({ id: '101', ownerId: userId, type: 'text/plain', size: 10 });
    await fragment1.save();
    await fragment2.save();

    const res = await request(app)
      .get('/v1/fragments?expand=1')
      .auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(Array.isArray(res.body.fragments)).toBe(true);
    expect(res.body.fragments).toEqual([
      {
        id: '100',
        ownerId: userId,
        type: 'text/plain',
        size: 5,
        created: fragment1.created,
        updated: fragment1.updated,
      },
      {
        id: '101',
        ownerId: userId,
        type: 'text/plain',
        size: 10,
        created: fragment2.created,
        updated: fragment2.updated,
      },
    ]);
  });
});
