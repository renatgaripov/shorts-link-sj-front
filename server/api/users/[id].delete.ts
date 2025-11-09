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

        await connectDB();

        const deletedUser = await User.findByIdAndDelete(id);

        if (!deletedUser) {
            throw createError({
                statusCode: 404,
                message: 'User not found',
            });
        }

        return {
            id: deletedUser._id,
            login: deletedUser.login,
            role: deletedUser.role,
            createdAt: deletedUser.createdAt,
        };
    } catch (error: any) {
        if (error.statusCode) {
            throw error;
        }
        throw createError({
            statusCode: 500,
            message: error.message || 'Internal server error',
        });
    }
});


