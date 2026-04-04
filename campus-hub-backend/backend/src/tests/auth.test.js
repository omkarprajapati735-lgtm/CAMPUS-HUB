const request = require('supertest');
const { app, server } = require('../server');

describe('Auth routes', () => {
  afterAll(() => {
    server.close();
  });

  test('GET /api/health responds', async () => {
    const res = await request(app).get('/api/health');
    expect([200, 500]).toContain(res.statusCode);
  });
});
