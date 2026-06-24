"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
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
const authController_1 = require("../authController");
describe('Auth Controller', () => {
    let mockRequest;
    let mockResponse;
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
            await (0, authController_1.register)(mockRequest, mockResponse);
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
            await (0, authController_1.register)(mockRequest, mockResponse);
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
            await (0, authController_1.register)(mockRequest, mockResponse);
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
            bcryptjs_1.default.hash.mockResolvedValue('hashedPassword');
            jsonwebtoken_1.default.sign.mockReturnValue('token123');
            await (0, authController_1.register)(mockRequest, mockResponse);
            expect(mockPrismaUser.create).toHaveBeenCalled();
            expect(mockResponse.cookie).toHaveBeenCalledWith('authToken', 'token123', expect.any(Object));
            expect(mockResponse.status).toHaveBeenCalledWith(201);
        });
    });
    describe('login', () => {
        it('should return 400 if email is missing', async () => {
            mockRequest.body = { password: 'password123' };
            await (0, authController_1.login)(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                error: 'Email och lösenord krävs',
            });
        });
        it('should return 401 if user not found', async () => {
            mockRequest.body = { email: 'notfound@test.com', password: 'password123' };
            mockPrismaUser.findUnique.mockResolvedValue(null);
            await (0, authController_1.login)(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith({
                error: 'Ogiltiga uppgifter',
            });
        });
        it('should return 401 if password is incorrect', async () => {
            mockRequest.body = { email: 'test@test.com', password: 'wrongpassword' };
            const mockUser = { id: 1, email: 'test@test.com', password: 'hashedPassword', role: 'user' };
            mockPrismaUser.findUnique.mockResolvedValue(mockUser);
            bcryptjs_1.default.compare.mockResolvedValue(false);
            await (0, authController_1.login)(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith({
                error: 'Ogiltiga uppgifter',
            });
        });
        it('should set cookie and return user on successful login', async () => {
            mockRequest.body = { email: 'test@test.com', password: 'password123' };
            const mockUser = { id: 1, email: 'test@test.com', password: 'hashedPassword', role: 'user' };
            mockPrismaUser.findUnique.mockResolvedValue(mockUser);
            bcryptjs_1.default.compare.mockResolvedValue(true);
            jsonwebtoken_1.default.sign.mockReturnValue('token123');
            await (0, authController_1.login)(mockRequest, mockResponse);
            expect(mockResponse.cookie).toHaveBeenCalledWith('authToken', 'token123', expect.any(Object));
            expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
                message: 'Inloggad',
                user: expect.objectContaining({
                    id: 1,
                    email: 'test@test.com',
                }),
            }));
        });
    });
    describe('logout', () => {
        it('should clear cookie on logout', async () => {
            await (0, authController_1.logout)(mockRequest, mockResponse);
            expect(mockResponse.clearCookie).toHaveBeenCalledWith('authToken', { path: '/' });
            expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Utloggad' });
        });
    });
});
