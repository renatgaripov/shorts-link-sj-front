import connectDB from '../../utils/mongodb';
import User from '../../models/User';
import { getAuthToken, verifyToken } from '../../utils/auth';
import { parseCookies } from 'h3';

export default defineEventHandler(async (event) => {
    if (event.node.req.method !== 'POST') {
        throw createError({
            statusCode: 405,
            message: 'Method Not Allowed',
        });
    }

    try {
        const token = getAuthToken(event);

        if (!token || !verifyToken(token)) {
            throw createError({
                statusCode: 401,
                message: 'Unauthorized',
            });
        }

        const body = await readBody(event);
        const { login, password } = body || {};

        if (!login || typeof login !== 'string' || !login.trim()) {
            throw createError({
                statusCode: 400,
                message: 'Login is required',
            });
        }

        if (!password || typeof password !== 'string' || !password.trim()) {
            throw createError({
                statusCode: 400,
                message: 'Password is required',
            });
        }

        await connectDB();

        const cookies = parseCookies(event);
        const currentUserId = cookies['userId4clk'];

        if (!currentUserId) {
            throw createError({
                statusCode: 403,
                message: 'Forbidden',
            });
        }

        const currentUser = await User.findById(currentUserId);

        if (!currentUser || currentUser.role !== 2) {
            throw createError({
                statusCode: 403,
                message: 'Insufficient permissions',
            });
        }

        const existingUser = await User.findOne({ login: login.trim() });

        if (existingUser) {
            throw createError({
                statusCode: 409,
                message: 'Login already in use',
            });
        }

        const user = await User.create({
            login: login.trim(),
            password,
            role: 1,
        });

        return {
            id: user._id,
            login: user.login,
            role: user.role,
            createdAt: user.createdAt,
        };
    } catch (error: any) {
        if (error.statusCode) {
            throw error;
        }

        if (error.code === 11000) {
            throw createError({
                statusCode: 409,
                message: 'Login already in use',
            });
        }

        throw createError({
            statusCode: 500,
            message: error.message || 'Internal server error',
        });
    }
});


