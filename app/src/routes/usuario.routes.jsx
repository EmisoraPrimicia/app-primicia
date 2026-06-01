import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import Layout from '../layout/layout';
import { LayoutProvider } from '../layout/context/layoutcontext';
import { useAuth } from '../context/AuthContext';

const GuardUsuario = () => {
    const { usuario, rol, cargando } = useAuth();

    if (cargando) return null;
    if (!usuario && !localStorage.getItem('token')) return <Navigate to="/login" replace />;
    if (rol !== 'Usuario' && rol !== 'Locutor' && rol !== 'SuperAdministrador') return <Navigate to="/sin-acceso" replace />;

    return <Outlet />;
};

const UsuarioShell = () => (
    <LayoutProvider>
        <Layout />
    </LayoutProvider>
);

export const rutasUsuario = [
    {
        element: <GuardUsuario />,
        children: [
            {
                element: <UsuarioShell />,
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
        ],
    },
];
