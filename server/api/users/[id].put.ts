import connectDB from '../../utils/mongodb';
import User from '../../models/User';
import { getAuthToken, verifyToken } from '../../utils/auth';

export default defineEventHandler(async (event) => {
    try {
        const token = getAuthToken(event);

        if (!token || !verifyToken(token)) {
            throw createError({
                statusCode: 401,
                message: 'Unauthorized',
            });
        }

        const params = event.context.params as { id?: string };
        const id = params?.id;

        if (!id) {
            throw createError({
                statusCode: 400,
                message: 'User id is required',
            });
        }

        const body = await readBody(event);
        const { login, password, role } = body || {};

        if (
            login !== undefined &&
            (typeof login !== 'string' || !login.trim())
        ) {
            throw createError({
                statusCode: 400,
                message: 'Login must be a non-empty string',
            });
        }

        if (
            password !== undefined &&
            (typeof password !== 'string' || !password.trim())
        ) {
            throw createError({
                statusCode: 400,
                message: 'Password must be a non-empty string',
            });
        }

        if (role !== undefined && role !== 1 && role !== 2) {
            throw createError({
                statusCode: 400,
                message: 'Role must be 1 or 2',
            });
        }

        await connectDB();

        const user = await User.findById(id);

        if (!user) {
            throw createError({
                statusCode: 404,
                message: 'User not found',
            });
        }

        if (login !== undefined) {
            user.login = login.trim();
        }

        if (password !== undefined) {
            user.password = password;
        }

        if (role !== undefined) {
            user.role = role;
        }

        await user.save();

        return {
            id: user._id,
            login: user.login,
            role: user.role,
            createdAt: user.createdAt,
        };
    } catch (error: any) {
        if (error.code === 11000) {
            throw createError({
                statusCode: 409,
                message: 'Login already in use',
            });
        }

        if (error.statusCode) {
            throw error;
        }

        throw createError({
            statusCode: 500,
            message: error.message || 'Internal server error',
        });
    }
});


