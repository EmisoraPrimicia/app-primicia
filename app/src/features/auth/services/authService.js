import apiClient from '@/lib/apiClient';

const authService = {
    login: (credentials) =>
        apiClient.post('/auth/login', credentials),

    solicitarReset: (email) =>
        apiClient.post('/auth/solicitar-reset', { email }),

    confirmarReset: (token, nueva_password) =>
        apiClient.post('/auth/confirmar-reset', { token, nueva_password }),

    me: () =>
        apiClient.get('/auth/me'),
};

export default authService;
