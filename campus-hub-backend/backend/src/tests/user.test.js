const request = require('supertest');
const { app, server } = require('../server');

describe('User routes', () => {
  afterAll(() => {
    server.close();
  });

  test('GET /api/users/profile requires auth', async () => {
    const res = await request(app).get('/api/users/profile');
    expect(res.statusCode).toBe(401);
  });
});
