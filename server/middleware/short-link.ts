import connectDB from '../utils/mongodb';
import Link from '../models/Link';
import { sendRedirect, parseCookies, setCookie } from 'h3';

export default defineEventHandler(async (event) => {
  // Проверяем, что это не API запрос и не известная страница
  const url = getRequestURL(event);
  const path = url.pathname;

  // Пропускаем API запросы и известные страницы
  if (path.startsWith('/api/') || path.startsWith('/_nuxt/') || path === '/' || path.startsWith('/favicon')) {
    return;
  }

  // Если это потенциально короткая ссылка (не содержит точек и слешей, кроме первого)
  const shortCode = path.slice(1); // убираем ведущий слэш

  // Проверяем, что это похоже на короткую ссылку (короткая строка без слешей)
  if (shortCode && !shortCode.includes('/') && shortCode.length > 0 && shortCode.length <= 20) {
    try {
      await connectDB();

      // Находим ссылку по короткому коду
      const link = await Link.findOne({ short: shortCode });

      if (link) {
        // Проверяем куку - был ли уже клик по этой ссылке в последний час
        const cookies = parseCookies(event);
        const cookieName = `click_${shortCode}`;
        const hasClicked = cookies[cookieName];

        // Если куки нет - это первый клик, увеличиваем счетчик
        if (!hasClicked) {
          // Увеличиваем счетчик кликов атомарно
          await Link.findByIdAndUpdate(link._id, { 
            $inc: { clicks: 1 } 
          });

          // Устанавливаем куку на 1 час (3600 секунд)
          setCookie(event, cookieName, '1', {
            maxAge: 60 * 60, // 1 час
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            path: '/',
          });
        }

        // Проверяем, что URL имеет протокол
        let redirectUrl = link.full.trim();
        if (!redirectUrl.match(/^https?:\/\//i)) {
          redirectUrl = 'https://' + redirectUrl;
        }

        // Делаем редирект на полный URL с кодом 302
        await sendRedirect(event, redirectUrl, 302);
        return;
      }
      // Если ссылка не найдена, продолжаем обработку (покажем 404)
    } catch (error: any) {
      // Если ошибка, продолжаем обработку запроса
      console.error('Short link middleware error:', error);
      // Не выбрасываем ошибку, чтобы показать нормальную 404 страницу
    }
  }
  // Если это не короткая ссылка или ошибка, продолжаем обычную обработку
});

