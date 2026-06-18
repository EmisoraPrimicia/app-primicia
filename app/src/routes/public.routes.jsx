import React from 'react';
import Landing from '../pages/Landing';
import NotFound from '../pages/NotFound';

export const rutasPublicas = [
    {
        path: '/',
        element: <Landing />,
    },
    {
        path: '/documentos',
        lazy: () => import('../features/documentos/pages/DocumentosPublico').then((m) => ({ Component: m.default })),
    },
    {
        path: '/login',
        lazy: () => import('../features/auth/pages/Login').then((m) => ({ Component: m.default })),
    },
    {
        path: '/reset-password',
        lazy: () => import('../features/auth/pages/ResetPassword').then((m) => ({ Component: m.default })),
    },
    {
        path: '*',
        element: <NotFound />,
    },
];
