/**
 * Auth Middleware Unit Tests
 * Testar JWT-verifikation och autentisering
 */
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Mock dependencies innan import
jest.mock('jsonwebtoken');

// Mock PrismaClient innan import
const mockPrismaUser = {
  findUnique: jest.fn(),
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => ({
    user: mockPrismaUser,
  })),
}));

// Import after mocks are set up
import { authenticate } from '../authMiddleware';

describe('Auth Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      cookies: {},
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      clearCookie: jest.fn().mockReturnThis(),
    };

    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  it('should return 401 if no token is present', async () => {
    mockRequest.cookies = {};

    await authenticate(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Autentisering krävs',
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 401 if token is invalid', async () => {
    mockRequest.cookies = { authToken: 'invalid-token' };
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error('Invalid token');
    });

    await authenticate(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Ogiltig autentisering',
    });
  });

  it('should clear cookie and return 401 if token is expired', async () => {
    mockRequest.cookies = { authToken: 'expired-token' };
    const tokenExpiredError = new jwt.TokenExpiredError('Token expired', new Date());
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw tokenExpiredError;
    });

    await authenticate(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.clearCookie).toHaveBeenCalledWith('authToken', { path: '/' });
    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Session utgången',
    });
  });

  it('should return 403 if user not found', async () => {
    mockRequest.cookies = { authToken: 'valid-token' };
    (jwt.verify as jest.Mock).mockReturnValue({ userId: 1 });
    mockPrismaUser.findUnique.mockResolvedValue(null);

    await authenticate(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Användare hittades inte',
    });
  });

  it('should call next and set userId if token is valid', async () => {
    mockRequest.cookies = { authToken: 'valid-token' };
    const mockUser = { id: 1, email: 'test@test.com', role: 'user' };
    
    (jwt.verify as jest.Mock).mockReturnValue({ userId: 1 });
    mockPrismaUser.findUnique.mockResolvedValue(mockUser);

    await authenticate(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockRequest.userId).toBe(1);
    expect(mockNext).toHaveBeenCalled();
    expect(mockResponse.status).not.toHaveBeenCalled();
  });
});
