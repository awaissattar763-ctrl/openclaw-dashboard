export function getGroqApiKey() {
  if (typeof window !== 'undefined') {
    const userKey = localStorage.getItem('openclaw:apiKey');
    if (userKey && userKey.startsWith('gsk_') && userKey.length > 20) {
      return userKey;
    }
  }
  const envKey = import.meta.env.VITE_GROQ_API_KEY;
  if (envKey && envKey.startsWith('gsk_')) {
    return envKey;
  }
  return null;
}

export function isUsingDemoKey() {
  if (typeof window === 'undefined') return false;
  const userKey = localStorage.getItem('openclaw:apiKey');
  const envKey = import.meta.env.VITE_GROQ_API_KEY;
  return !userKey && !!envKey;
}

export function hasAnyKey() {
  return !!getGroqApiKey();
}
