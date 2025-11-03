export function getAuthToken(event: any): string | null {
  const authHeader = event.node?.req?.headers?.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
}

export function verifyToken(token: string): boolean {
  // Простая проверка токена (можно заменить на JWT)
  // В реальном приложении здесь должна быть проверка JWT
  return token && token.length > 0;
}

