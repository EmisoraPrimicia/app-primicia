import apiClient from '@/lib/apiClient';

const agendaService = {
    listar: (pagina = 1, tamano = 20) =>
        apiClient.get(`/eventos?pagina=${pagina}&tamano=${tamano}`),

    proximos: (limite = 10) =>
        apiClient.get(`/eventos/proximos?limite=${limite}`),

    obtener: (id) =>
        apiClient.get(`/eventos/${id}`),

    crear: (data) =>
        apiClient.post('/eventos', data),

    actualizar: (id, data) =>
        apiClient.patch(`/eventos/${id}`, data),

    eliminar: (id) =>
        apiClient.delete(`/eventos/${id}`),
};

export default agendaService;
