export default defineEventHandler((event) => {
  // CORS headers для всех запросов
  const origin = event.node.req.headers.origin;

  // Разрешенные источники (настройте под ваши домены)
  const allowedOrigins = [
    'https://4clk.me',
    'http://localhost:3000',
    'http://localhost:3001',
  ];

  // Для development разрешаем все источники, для production - только разрешенные
  const isAllowedOrigin = !origin || 
    allowedOrigins.includes(origin) || 
    process.env.NODE_ENV === 'development';

  if (isAllowedOrigin && origin) {
    setHeader(event, 'Access-Control-Allow-Origin', origin);
  }

  setHeader(event, 'Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  setHeader(event, 'Access-Control-Allow-Headers', 'Authorization, Content-Type, Accept, Origin, X-Requested-With');
  setHeader(event, 'Access-Control-Allow-Credentials', 'true');
  setHeader(event, 'Access-Control-Max-Age', '3600');

  // Обработка preflight запросов
  if (event.node.req.method === 'OPTIONS') {
    setResponseStatus(event, 204);
    return '';
  }
});

