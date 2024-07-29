const request = require('supertest');
const app = require('../../src/app');

describe('DELETE /v1/fragments/:id', () => {
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

  test('authenticated users can delete the fragment based on given id', async () => {
    const userEmail = 'user1@email.com';

    // Create a new fragment using the POST /fragments route
    const createRes = await request(app)
      .post('/v1/fragments')
      .auth(userEmail, 'password1')
      .set('Content-Type', 'text/plain')
      .send('This is a test fragment');

    expect(createRes.statusCode).toBe(201);
    const fragmentId = createRes.body.fragment.id;

    // Verify the fragment was created
    const getRes = await request(app)
      .get(`/v1/fragments/${fragmentId}`)
      .auth(userEmail, 'password1');

    expect(getRes.statusCode).toBe(200);
    expect(getRes.text).toBe('This is a test fragment');

    // Attempt to delete the fragment
    const delRes = await request(app)
      .delete(`/v1/fragments/${fragmentId}`)
      .auth(userEmail, 'password1');

    expect(delRes.statusCode).toBe(200);
    expect(delRes.body.status).toBe('ok');

    // Verify the fragment no longer exists
    const verifyDeleteRes = await request(app)
      .get(`/v1/fragments/${fragmentId}`)
      .auth(userEmail, 'password1');

    expect(verifyDeleteRes.statusCode).toBe(404);
  });


  test('returns 404 if requesting invalid fragment id', async () => {
    const delRes = await request(app)
      .delete('/v1/fragments/invalidId')
      .auth('user1@email.com', 'password1');
    expect(delRes.statusCode).toBe(404);
  });
});
