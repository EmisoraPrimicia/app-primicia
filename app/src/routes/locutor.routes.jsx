import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import Layout from '../layout/layout';
import { LayoutProvider } from '../layout/context/layoutcontext';
import { useAuth } from '../context/AuthContext';

const GuardLocutor = () => {
    const { usuario, rol, cargando } = useAuth();

    if (cargando) return null;
    if (!usuario && !localStorage.getItem('token')) return <Navigate to="/login" replace />;
    if (rol !== 'Locutor') return <Navigate to="/sin-acceso" replace />;

    return <Outlet />;
};

const LocutorShell = () => (
    <LayoutProvider>
        <Layout />
    </LayoutProvider>
);

export const rutasLocutor = [
    {
        element: <GuardLocutor />,
        children: [
            {
                element: <LocutorShell />,
                children: [
                    {
                        path: '/locutor',
                        lazy: () => import('../features/locutor/pages/LocutorPanel').then((m) => ({ Component: m.default })),
                    },
                    {
                        path: '/locutor/programas',
                        lazy: () => import('../features/programas/pages/Programas').then((m) => ({ Component: m.default })),
                    },
                    {
                        path: '/locutor/eventos',
                        lazy: () => import('../features/agenda/pages/Agenda').then((m) => ({ Component: m.default })),
                    },
                    {
                        path: '/locutor/perfil',
                        lazy: () => import('../features/shared/pages/MiPerfil').then((m) => ({ Component: m.default })),
                    },
                ],
            },
        ],
    },
];
