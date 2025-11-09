import connectDB from '../../utils/mongodb';
import Link from '../../models/Link';
import LinkStat from '../../models/LinkStat';
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
        const rawSearch = (query.q as string | undefined)?.trim();
        let search = rawSearch;

        // Параметры пагинации
        const page = parseInt(query.page as string) || 1;
        const limit = parseInt(query.limit as string) || 20;
        const skip = (page - 1) * limit;

        let filter: any = {};
        const orFilters: any[] = [];

        let userIdsByLogin: string[] = [];

        if (rawSearch) {
            const matchedUsers = (await User.find({
                login: { $regex: rawSearch, $options: 'i' },
            })
                .select('_id')
                .lean()) as Array<{ _id: string }>;

            userIdsByLogin = matchedUsers.map((user) => user._id.toString());
        }

        if (search) {
            // Если поисковый запрос содержит полную ссылку типа https://4clk.me/xxx
            // извлекаем короткий код после последнего слеша
            if (search.includes('4clk.me/')) {
                // Извлекаем все что после 4clk.me/
                const match = search.match(/4clk\.me\/([^\/\s?#]+)/i);
                if (match && match[1]) {
                    search = match[1];
                } else {
                    // Если не нашли, берем часть после последнего слеша
                    const parts = search.split('/');
                    search = parts[parts.length - 1] || search;
                }
            } else if (search.includes('/')) {
                // Если есть слеш, но не 4clk.me - берем часть после последнего слеша
                const parts = search.split('/');
                search = parts[parts.length - 1] || search;
            }

            // Очищаем от пробелов, параметров и якорей
            search = search.trim().split('?')[0].split('#')[0];

            orFilters.push(
                { name: { $regex: search, $options: 'i' } },
                { full: { $regex: search, $options: 'i' } },
                { short: { $regex: search, $options: 'i' } },
            );
        }

        if (userIdsByLogin.length > 0) {
            orFilters.push({
                userId: { $in: userIdsByLogin },
            });
        }

        if (orFilters.length > 0) {
            filter = {
                $or: orFilters,
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

        // console.log('links', links);

        const linkIds = links.map((link) => link._id);
        const stats = await LinkStat.find({ linkId: { $in: linkIds } })
            .sort({ date: -1 })
            .lean();

        const userIds = Array.from(
            new Set(
                links
                    .map((link) => link.userId)
                    .filter((id): id is string => Boolean(id))
            )
        );

        const userMap = new Map<string, string>();
        if (userIds.length) {
            const rawUsers = await User.find({ _id: { $in: userIds } })
                .select('_id login')
                .lean();

            for (const user of rawUsers as Array<{ _id: any; login?: string }>) {
                if (!user.login) continue;
                const id =
                    typeof user._id === 'string'
                        ? user._id
                        : user._id?.toString?.();
                if (!id) continue;
                userMap.set(id, user.login);
            }
        }

        const statsMap = new Map<string, Array<{ date: string; clicks: number }>>();
        for (const stat of stats) {
            const key = stat.linkId.toString();
            if (!statsMap.has(key)) {
                statsMap.set(key, []);
            }
            statsMap.get(key)!.push({
                date: stat.date.toISOString(),
                clicks: stat.clicks || 0,
            });
        }

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
                stats: statsMap.get(link._id.toString()) || [],
                userId: link.userId,
                userLogin: link.userId ? userMap.get(link.userId.toString()) || null : null,
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

