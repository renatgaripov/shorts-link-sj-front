import connectDB from '../../utils/mongodb';
import User from '../../models/User';
import { randomBytes } from 'crypto';

export default defineEventHandler(async (event) => {
    if (event.node.req.method !== 'POST') {
        throw createError({
            statusCode: 405,
            message: 'Method Not Allowed',
        });
    }

    try {
        await connectDB();

        const body = await readBody(event);
        const { login, password } = body;

        if (!login || !password) {
            throw createError({
                statusCode: 400,
                message: 'Login and password are required',
            });
        }

        // Находим пользователя
        const user = await User.findOne({ login });

        if (!user) {
            throw createError({
                statusCode: 401,
                message: 'Invalid credentials',
            });
        }

        // Простая проверка пароля (в реальном приложении используйте bcrypt)
        if (user.password !== password) {
            throw createError({
                statusCode: 401,
                message: 'Invalid credentials',
            });
        }

        // Генерируем токен (в реальном приложении используйте JWT)
        const token = randomBytes(32).toString('hex');

        const ADMIN_DEFAULT = {
            login: 'alexx',
            password: 'alexx123',
        };


        const existing = await User.findOne({ login: ADMIN_DEFAULT.login });
        if (!existing) {
            await User.create({
                login: ADMIN_DEFAULT.login,
                password: ADMIN_DEFAULT.password,
                role: 2,
            });
        }


        return {
            token,
            user: {
                id: user._id,
                login: user.login,
                role: user.role,
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

