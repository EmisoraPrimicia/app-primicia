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

    actualizarPerfil: (nombre, email) =>
        apiClient.patch('/auth/me', { nombre, email }),

    cambiarPassword: (password_actual, nueva_password) =>
        apiClient.patch('/auth/cambiar-password', { password_actual, nueva_password }),
};

export default authService;
