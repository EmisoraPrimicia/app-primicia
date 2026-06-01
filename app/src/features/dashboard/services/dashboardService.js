import apiClient from '@/lib/apiClient';

const dashboardService = {
    resumen: () =>
        Promise.all([
            apiClient.get('/locutores?tamano=1'),
            apiClient.get('/programas?tamano=1'),
            apiClient.get('/noticias?tamano=1&publicada=true'),
            apiClient.get('/eventos?tamano=1'),
            apiClient.get('/streaming/estado'),
        ]).then(([locutores, programas, noticias, eventos, streaming]) => ({
            totalLocutores:  locutores.total,
            totalProgramas:  programas.total,
            totalNoticias:   noticias.total,
            totalEventos:    eventos.total,
            streaming,
        })),

    proximosEventos: (limite = 5) =>
        apiClient.get(`/eventos/proximos?limite=${limite}`),
};

export default dashboardService;
