import apiClient from '@/lib/apiClient';

const BASE_URL = `${import.meta.env.VITE_API_URL ?? 'http://localhost:8000'}/api/v1`;

async function subirPdf(titulo, descripcion, file) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('titulo', titulo);
    if (descripcion) formData.append('descripcion', descripcion);

    const token = localStorage.getItem('token');
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${BASE_URL}/documentos`, {
        method: 'POST',
        headers,
        body: formData,
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        const detail = data?.detail;
        throw new Error(Array.isArray(detail) ? detail.map((e) => e.msg).join(', ') : (detail ?? `Error ${res.status}`));
    }
    return data;
}

const documentosService = {
    listar: (pagina = 1, tamano = 20) =>
        apiClient.get(`/documentos?pagina=${pagina}&tamano=${tamano}`),

    listarAdmin: (pagina = 1, tamano = 20) =>
        apiClient.get(`/documentos/admin?pagina=${pagina}&tamano=${tamano}`),

    subir: subirPdf,

    eliminar: (id) => apiClient.delete(`/documentos/${id}`),
};

export default documentosService;
