const BASE_URL = `${import.meta.env.VITE_API_URL ?? 'http://localhost:8000'}/api/v1`;

function getToken() {
    return localStorage.getItem('token');
}

async function request(method, path, body) {
    const headers = { 'Content-Type': 'application/json' };
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const config = { method, headers };
    if (body !== undefined) config.body = JSON.stringify(body);

    const res = await fetch(`${BASE_URL}${path}`, config);

    if (res.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('rol');
        localStorage.removeItem('usuario');
        window.location.href = '/login';
        return;
    }

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
        const mensaje = data?.detail ?? `Error ${res.status}`;
        throw new Error(Array.isArray(mensaje) ? mensaje.map((e) => e.msg).join(', ') : mensaje);
    }

    return data;
}

const apiClient = {
    get:    (path)         => request('GET',    path),
    post:   (path, body)   => request('POST',   path, body),
    patch:  (path, body)   => request('PATCH',  path, body),
    delete: (path)         => request('DELETE', path),
};

export default apiClient;
