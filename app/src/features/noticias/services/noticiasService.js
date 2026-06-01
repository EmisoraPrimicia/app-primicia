import apiClient from '@/lib/apiClient';

const noticiasService = {
    listar: (pagina = 1, tamano = 20, publicada) => {
        const params = new URLSearchParams({ pagina, tamano });
        if (publicada !== undefined) params.append('publicada', publicada);
        return apiClient.get(`/noticias?${params}`);
    },

    obtener: (id) =>
        apiClient.get(`/noticias/${id}`),

    crear: (data) =>
        apiClient.post('/noticias', data),

    actualizar: (id, data) =>
        apiClient.patch(`/noticias/${id}`, data),

    publicar: (id) =>
        apiClient.patch(`/noticias/${id}/publicar`),

    eliminar: (id) =>
        apiClient.delete(`/noticias/${id}`),
};

export default noticiasService;
