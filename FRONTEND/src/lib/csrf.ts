export async function getCsrfToken(apiRoot: string) {
  try {
    const res = await fetch(`${apiRoot}/api/auth/csrf-token`, { credentials: 'include' });
    if (!res.ok) return null;
    const data = await res.json();
    return data.csrfToken || null;
  } catch (err) {
    return null;
  }
}

export default getCsrfToken;
