import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import authService from '@/features/auth/services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [usuario, setUsuario] = useState(null);
    const [cargando, setCargando] = useState(true);

    // Al montar, verificamos si hay sesión activa validando el token con /me
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) { setCargando(false); return; }

        authService.me()
            .then((data) => setUsuario(data))
            .catch(() => {
                localStorage.removeItem('token');
                localStorage.removeItem('rol');
                localStorage.removeItem('usuario');
            })
            .finally(() => setCargando(false));
    }, []);

    // Sincronización entre pestañas: reacciona cuando otra pestaña hace login o logout
    useEffect(() => {
        const handleStorage = (e) => {
            if (e.key !== 'token') return;
            if (!e.newValue) {
                setUsuario(null);
                localStorage.removeItem('rol');
                localStorage.removeItem('usuario');
            } else {
                authService.me()
                    .then((data) => {
                        setUsuario(data);
                        localStorage.setItem('usuario', JSON.stringify(data));
                        localStorage.setItem('rol', data.role_code);
                    })
                    .catch(() => setUsuario(null));
            }
        };
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    const login = useCallback(async (credentials) => {
        const data = await authService.login(credentials);
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('rol', data.usuario.role_code);
        localStorage.setItem('usuario', JSON.stringify(data.usuario));
        setUsuario(data.usuario);
        return data;
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('rol');
        localStorage.removeItem('usuario');
        setUsuario(null);
    }, []);

    const recargarUsuario = useCallback(async () => {
        try {
            const data = await authService.me();
            setUsuario(data);
            localStorage.setItem('usuario', JSON.stringify(data));
            return data;
        } catch { /* ignorar */ }
    }, []);

    const rol = usuario?.role_code ?? localStorage.getItem('rol');

    return (
        <AuthContext.Provider value={{ usuario, rol, cargando, login, logout, recargarUsuario }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
    return ctx;
}
