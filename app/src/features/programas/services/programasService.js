import apiClient from '@/lib/apiClient';

const programasService = {
    listar: (pagina = 1, tamano = 20) =>
        apiClient.get(`/programas?pagina=${pagina}&tamano=${tamano}`),

    parrilla: (fecha = null) => {
        const qs = fecha ? `?fecha=${fecha}` : '';
        return apiClient.get(`/programas/parrilla-semanal${qs}`);
    },

    obtener: (id) =>
        apiClient.get(`/programas/${id}`),

    crear: (data) =>
        apiClient.post('/programas', data),

    actualizar: (id, data) =>
        apiClient.patch(`/programas/${id}`, data),

    eliminar: (id) =>
        apiClient.delete(`/programas/${id}`),
};

export default programasService;
