const request = require('supertest');
const app = require('../../src/app');

describe('404 Handler', () => {
  it('returns a 404 status code for incorrect routes', async () => {
    const response = await request(app).get('/non-existent-route');
    expect(response.status).toBe(404);
  });
});
