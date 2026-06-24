"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
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
const authMiddleware_1 = require("../authMiddleware");
describe('Auth Middleware', () => {
    let mockRequest;
    let mockResponse;
    let mockNext;
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
        await (0, authMiddleware_1.authenticate)(mockRequest, mockResponse, mockNext);
        expect(mockResponse.status).toHaveBeenCalledWith(401);
        expect(mockResponse.json).toHaveBeenCalledWith({
            error: 'Autentisering krävs',
        });
        expect(mockNext).not.toHaveBeenCalled();
    });
    it('should return 401 if token is invalid', async () => {
        mockRequest.cookies = { authToken: 'invalid-token' };
        jsonwebtoken_1.default.verify.mockImplementation(() => {
            throw new Error('Invalid token');
        });
        await (0, authMiddleware_1.authenticate)(mockRequest, mockResponse, mockNext);
        expect(mockResponse.status).toHaveBeenCalledWith(401);
        expect(mockResponse.json).toHaveBeenCalledWith({
            error: 'Ogiltig autentisering',
        });
    });
    it('should clear cookie and return 401 if token is expired', async () => {
        mockRequest.cookies = { authToken: 'expired-token' };
        const tokenExpiredError = new jsonwebtoken_1.default.TokenExpiredError('Token expired', new Date());
        jsonwebtoken_1.default.verify.mockImplementation(() => {
            throw tokenExpiredError;
        });
        await (0, authMiddleware_1.authenticate)(mockRequest, mockResponse, mockNext);
        expect(mockResponse.clearCookie).toHaveBeenCalledWith('authToken', { path: '/' });
        expect(mockResponse.status).toHaveBeenCalledWith(401);
        expect(mockResponse.json).toHaveBeenCalledWith({
            error: 'Session utgången',
        });
    });
    it('should return 403 if user not found', async () => {
        mockRequest.cookies = { authToken: 'valid-token' };
        jsonwebtoken_1.default.verify.mockReturnValue({ userId: 1 });
        mockPrismaUser.findUnique.mockResolvedValue(null);
        await (0, authMiddleware_1.authenticate)(mockRequest, mockResponse, mockNext);
        expect(mockResponse.status).toHaveBeenCalledWith(403);
        expect(mockResponse.json).toHaveBeenCalledWith({
            error: 'Användare hittades inte',
        });
    });
    it('should call next and set userId if token is valid', async () => {
        mockRequest.cookies = { authToken: 'valid-token' };
        const mockUser = { id: 1, email: 'test@test.com', role: 'user' };
        jsonwebtoken_1.default.verify.mockReturnValue({ userId: 1 });
        mockPrismaUser.findUnique.mockResolvedValue(mockUser);
        await (0, authMiddleware_1.authenticate)(mockRequest, mockResponse, mockNext);
        expect(mockRequest.userId).toBe(1);
        expect(mockNext).toHaveBeenCalled();
        expect(mockResponse.status).not.toHaveBeenCalled();
    });
});
