const request = require('supertest');
const mongoose = require('mongoose');
const { app, httpServer, io } = require('../server'); // Import the app and server
const User = require('../models/user.model');

describe('Auth Endpoints', () => {
  // Connect to a test database before all tests
  beforeAll(async () => {
    const url = `mongodb://127.0.0.1/test_db`;
    await mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
  });

  // Clear the User collection before each test
  beforeEach(async () => {
    await User.deleteMany();
  });

  // Disconnect from the database and close the server after all tests
  afterAll(async () => {
    await mongoose.connection.close();
    httpServer.close();
    io.close();
  });

  // Test user registration
  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
        });
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('token');
    });

    it('should fail to register a user with an existing email', async () => {
      // First, create a user
      await request(app).post('/api/auth/register').send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      });

      // Then, try to register again with the same email
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'anotheruser',
          email: 'test@example.com',
          password: 'password456',
        });
      expect(res.statusCode).toEqual(400);
      expect(res.body.error).toBe('Email already exists');
    });
  });

  // Test user login
  describe('POST /api/auth/login', () => {
    it('should log in an existing user successfully', async () => {
      await request(app).post('/api/auth/register').send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      });

      const res = await request(app).post('/api/auth/login').send({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('token');
    });

    it('should fail to log in with incorrect credentials', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'nouser@example.com',
        password: 'wrongpassword',
      });
      expect(res.statusCode).toEqual(401);
      expect(res.body.error).toBe('Invalid credentials');
    });
  });
});