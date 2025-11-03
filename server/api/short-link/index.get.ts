import connectDB from '../../utils/mongodb';
import Link from '../../models/Link';
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
        const search = query.q as string | undefined;

        // Параметры пагинации
        const page = parseInt(query.page as string) || 1;
        const limit = parseInt(query.limit as string) || 20;
        const skip = (page - 1) * limit;

        let filter: any = {};

        if (search && search.trim()) {
            filter = {
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { full: { $regex: search, $options: 'i' } },
                    { short: { $regex: search, $options: 'i' } },
                ],
            };
        }

        // Получаем общее количество записей
        const total = await Link.countDocuments(filter);

        // Получаем ссылки с пагинацией
        const links = await Link.find(filter)
            .sort({ created_at: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        // Вычисляем количество страниц
        const totalPages = Math.ceil(total / limit);

        return {
            data: links.map((link: any) => ({
                id: link._id,
                name: link.name,
                short: link.short,
                full: link.full,
                project: link.project,
                created_at: link.created_at,
                clicks: link.clicks || 0,
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

