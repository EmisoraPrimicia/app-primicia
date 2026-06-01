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

    const rol = usuario?.role_code ?? localStorage.getItem('rol');

    return (
        <AuthContext.Provider value={{ usuario, rol, cargando, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
    return ctx;
}
