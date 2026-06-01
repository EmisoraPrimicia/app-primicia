import apiClient from '@/lib/apiClient';

const locutoresService = {
    listar: (pagina = 1, tamano = 20) =>
        apiClient.get(`/locutores?pagina=${pagina}&tamano=${tamano}`),

    obtener: (id) =>
        apiClient.get(`/locutores/${id}`),

    crear: (data) =>
        apiClient.post('/locutores', data),

    actualizar: (id, data) =>
        apiClient.patch(`/locutores/${id}`, data),

    toggleActivo: (id) =>
        apiClient.patch(`/locutores/${id}/activar-desactivar`),

    eliminar: (id) =>
        apiClient.delete(`/locutores/${id}`),
};

export default locutoresService;
