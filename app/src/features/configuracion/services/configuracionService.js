import apiClient from '@/lib/apiClient';

const configuracionService = {
    streaming: {
        estado: () =>
            apiClient.get('/streaming/estado'),

        obtenerConfig: () =>
            apiClient.get('/streaming/configuracion'),

        crear: (data) =>
            apiClient.post('/streaming/configuracion', data),

        actualizar: (id, data) =>
            apiClient.patch(`/streaming/configuracion/${id}`, data),

        buttConfig: () =>
            apiClient.get('/streaming/butt-config'),
    },
};

export default configuracionService;
