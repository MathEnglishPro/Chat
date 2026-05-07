const CHAT_USER_KEY = 'chat_user';

export function getChatUser() {
  const stored = localStorage.getItem(CHAT_USER_KEY);
  if (!stored) return null;
  return JSON.parse(stored);
}

export function setChatUser(user) {
  localStorage.setItem(CHAT_USER_KEY, JSON.stringify(user));
}

export function clearChatUser() {
  localStorage.removeItem(CHAT_USER_KEY);
}

export function isAdmin(user) {
  return user?.username === 'Gregory.D';
}

export function generateAccessCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
}
