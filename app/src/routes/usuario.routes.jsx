import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

// Guard de rol para Usuario
const GuardUsuario = () => {
    const token = localStorage.getItem('token');
    const rol = localStorage.getItem('rol');

    if (!token) return <Navigate to="/login" replace />;
    if (rol !== 'Usuario' && rol !== 'SuperAdministrador') return <Navigate to="/sin-acceso" replace />;

    return <Outlet />;
};

export const rutasUsuario = [
    {
        element: <GuardUsuario />,
        children: [
            {
                path: '/app',
                lazy: () => import('../features/dashboard/pages/Dashboard').then((m) => ({ Component: m.default })),
            },
            {
                path: '/app/programas',
                lazy: () => import('../features/programas/pages/Programas').then((m) => ({ Component: m.default })),
            },
            {
                path: '/app/agenda',
                lazy: () => import('../features/agenda/pages/Agenda').then((m) => ({ Component: m.default })),
            },
            {
                path: '/app/perfil',
                lazy: () => import('../features/shared/pages/MiPerfil').then((m) => ({ Component: m.default ?? m })),
            },
        ],
    },
];
