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

        await connectDB();

        const query = getQuery(event);
        const search = (query.q as string | undefined)?.trim();

        const page = parseInt(query.page as string, 10) || 1;
        const limit = parseInt(query.limit as string, 10) || 20;
        const skip = (page - 1) * limit;

        const filter: Record<string, any> = {};

        if (search) {
            filter.login = { $regex: search, $options: 'i' };
        }

        const total = await User.countDocuments(filter);

        const users = await User.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const totalPages = Math.ceil(total / limit) || 1;

        return {
            data: users.map((user: any) => ({
                id: user._id,
                login: user.login,
                role: user.role,
                createdAt: user.createdAt,
            })),
            meta: {
                total,
                page,
                limit,
                totalPages,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
            },
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


