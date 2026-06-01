import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import Layout from '../layout/layout';
import { LayoutProvider } from '../layout/context/layoutcontext';
import { useAuth } from '../context/AuthContext';

const GuardSuperAdmin = () => {
    const { usuario, rol, cargando } = useAuth();

    if (cargando) return null;
    if (!usuario && !localStorage.getItem('token')) return <Navigate to="/login" replace />;
    if (rol !== 'SuperAdministrador') return <Navigate to="/sin-acceso" replace />;

    return <Outlet />;
};

const AdminShell = () => (
    <LayoutProvider>
        <Layout />
    </LayoutProvider>
);

export const rutasSuperAdmin = [
    {
        element: <GuardSuperAdmin />,
        children: [
            {
                element: <AdminShell />,
                children: [
                    {
                        path: '/admin',
                        lazy: () => import('../features/dashboard/pages/Dashboard').then((m) => ({ Component: m.default })),
                    },
                    {
                        path: '/admin/programas',
                        lazy: () => import('../features/programas/pages/Programas').then((m) => ({ Component: m.default })),
                    },
                    {
                        path: '/admin/locutores',
                        lazy: () => import('../features/locutores/pages/Locutores').then((m) => ({ Component: m.default })),
                    },
                    {
                        path: '/admin/noticias',
                        lazy: () => import('../features/noticias/pages/Noticias').then((m) => ({ Component: m.default })),
                    },
                    {
                        path: '/admin/agenda',
                        lazy: () => import('../features/agenda/pages/Agenda').then((m) => ({ Component: m.default })),
                    },
                    {
                        path: '/admin/configuracion',
                        lazy: () => import('../features/configuracion/pages/Configuracion').then((m) => ({ Component: m.default })),
                    },
                ],
            },
        ],
    },
];
