import connectDB from '../../utils/mongodb';
import Link from '../../models/Link';
import { getAuthToken, verifyToken } from '../../utils/auth';
import { randomBytes } from 'crypto';

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

        await connectDB();

        const body = await readBody(event);
        const { name, full, short } = body;

        if (!name || !full) {
            throw createError({
                statusCode: 400,
                message: 'Name and full URL are required',
            });
        }

        // Генерируем короткую ссылку, если не указана
        let shortLink = short;
        if (!shortLink || shortLink.trim() === '') {
            // Генерируем случайную короткую ссылку
            shortLink = randomBytes(4).toString('hex');
        } else {
            // Убираем ведущий слэш, если есть
            shortLink = shortLink.replace(/^\//, '');
        }

        // Проверяем, не существует ли уже такая короткая ссылка
        const existingLink = await Link.findOne({ short: shortLink });
        if (existingLink) {
            if (short && short.trim() !== '') {
                // Пользователь хотел задать свой адрес, но он занят
                throw createError({
                    statusCode: 409,
                    message: 'Short link already exists',
                });
            } else {
                // Генерируем новый, если случайно совпал
                shortLink = randomBytes(4).toString('hex');
            }
        }

        const newLink = new Link({
            name: name.trim(),
            full: full.trim(),
            short: shortLink,
            clicks: 0,
            created_at: new Date(),
        });

        await newLink.save();

        return {
            id: newLink._id,
            name: newLink.name,
            short: newLink.short,
            full: newLink.full,
            project: newLink.project,
            created_at: newLink.created_at,
            clicks: newLink.clicks,
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

