/**
 * Auth Controller Unit Tests
 * Testar registrering, inloggning och validering
 */
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Mock dependencies innan vi importerar controllern
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

// Mock PrismaClient innan import
const mockPrismaUser = {
  create: jest.fn(),
  findUnique: jest.fn(),
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => ({
    user: mockPrismaUser,
  })),
}));

// Import after mocks are set up
import { register, login, logout } from '../authController';

describe('Auth Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockRequest = {
      body: {},
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      cookie: jest.fn().mockReturnThis(),
      clearCookie: jest.fn().mockReturnThis(),
    };

    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should return 400 if email is missing', async () => {
      mockRequest.body = { password: 'password123', confirmPassword: 'password123' };

      await register(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Alla fält krävs',
      });
    });

    it('should return 400 if password is less than 8 characters', async () => {
      mockRequest.body = {
        email: 'test@test.com',
        password: 'short',
        confirmPassword: 'short',
      };

      await register(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Lösenord måste vara minst 8 tecken långt',
      });
    });

    it('should return 400 if passwords do not match', async () => {
      mockRequest.body = {
        email: 'test@test.com',
        password: 'password123',
        confirmPassword: 'password456',
      };

      await register(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Lösenorden matchar inte',
      });
    });

    it('should create user and set cookie on successful registration', async () => {
      mockRequest.body = {
        email: 'test@test.com',
        password: 'password123',
        confirmPassword: 'password123',
      };

      const mockUser = { id: 1, email: 'test@test.com', role: 'user' };
      mockPrismaUser.create.mockResolvedValue(mockUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      (jwt.sign as jest.Mock).mockReturnValue('token123');

      await register(mockRequest as Request, mockResponse as Response);

      expect(mockPrismaUser.create).toHaveBeenCalled();
      expect(mockResponse.cookie).toHaveBeenCalledWith('authToken', 'token123', expect.any(Object));
      expect(mockResponse.status).toHaveBeenCalledWith(201);
    });
  });

  describe('login', () => {
    it('should return 400 if email is missing', async () => {
      mockRequest.body = { password: 'password123' };

      await login(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Email och lösenord krävs',
      });
    });

    it('should return 401 if user not found', async () => {
      mockRequest.body = { email: 'notfound@test.com', password: 'password123' };

      mockPrismaUser.findUnique.mockResolvedValue(null);

      await login(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Ogiltiga uppgifter',
      });
    });

    it('should return 401 if password is incorrect', async () => {
      mockRequest.body = { email: 'test@test.com', password: 'wrongpassword' };

      const mockUser = { id: 1, email: 'test@test.com', password: 'hashedPassword', role: 'user' };
      mockPrismaUser.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await login(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Ogiltiga uppgifter',
      });
    });

    it('should set cookie and return user on successful login', async () => {
      mockRequest.body = { email: 'test@test.com', password: 'password123' };

      const mockUser = { id: 1, email: 'test@test.com', password: 'hashedPassword', role: 'user' };
      mockPrismaUser.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('token123');

      await login(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.cookie).toHaveBeenCalledWith('authToken', 'token123', expect.any(Object));
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Inloggad',
          user: expect.objectContaining({
            id: 1,
            email: 'test@test.com',
          }),
        })
      );
    });
  });

  describe('logout', () => {
    it('should clear cookie on logout', async () => {
      await logout(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.clearCookie).toHaveBeenCalledWith('authToken', { path: '/' });
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Utloggad' });
    });
  });
});
