import connectDB from '../../utils/mongodb';
import Link from '../../models/Link';
import { getAuthToken, verifyToken } from '../../utils/auth';

export default defineEventHandler(async (event) => {
    if (event.node.req.method !== 'DELETE') {
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

        await connectDB();

        const id = getRouterParam(event, 'id');

        if (!id) {
            throw createError({
                statusCode: 400,
                message: 'Link ID is required',
            });
        }

        const deletedLink = await Link.findByIdAndDelete(id);

        if (!deletedLink) {
            throw createError({
                statusCode: 404,
                message: 'Link not found',
            });
        }

        return { success: true };
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

