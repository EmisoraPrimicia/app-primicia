import { createBrowserRouter } from 'react-router-dom';
import { rutasPublicas } from './public.routes';
import { rutasSuperAdmin } from './superadmin.routes';
import { rutasUsuario } from './usuario.routes';
import { rutasLocutor } from './locutor.routes';

export const router = createBrowserRouter([
    ...rutasPublicas,
    ...rutasSuperAdmin,
    ...rutasLocutor,
    ...rutasUsuario,
]);
