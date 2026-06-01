// @ts-nocheck — archivo migrado de Sakai (JS sin tipos)
import React from 'react';
import { useNavigate } from 'react-router-dom';
import AppMenuitem from './AppMenuitem';
import { MenuProvider } from './context/menucontext';
import { useAuth } from '../context/AuthContext';

const AppMenu = () => {
    const { rol, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const menuAdmin = [
        {
            label: 'Principal',
            items: [
                { label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/admin' },
            ],
        },
        {
            label: 'Contenido',
            items: [
                { label: 'Programas',  icon: 'pi pi-fw pi-th-large',  to: '/admin/programas' },
                { label: 'Locutores',  icon: 'pi pi-fw pi-microphone', to: '/admin/locutores' },
                { label: 'Noticias',   icon: 'pi pi-fw pi-file-edit',  to: '/admin/noticias'  },
            ],
        },
        {
            label: 'Operaciones',
            items: [
                { label: 'Agenda', icon: 'pi pi-fw pi-calendar', to: '/admin/agenda' },
            ],
        },
        {
            label: 'Sistema',
            items: [
                { label: 'Configuración',  icon: 'pi pi-fw pi-cog',      to: '/admin/configuracion' },
                { label: 'Cerrar Sesión',  icon: 'pi pi-fw pi-sign-out', command: handleLogout },
            ],
        },
    ];

    const menuUsuario = [
        {
            label: 'Principal',
            items: [
                { label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/app' },
            ],
        },
        {
            label: 'Contenido',
            items: [
                { label: 'Programas', icon: 'pi pi-fw pi-th-large', to: '/app/programas' },
            ],
        },
        {
            label: 'Operaciones',
            items: [
                { label: 'Agenda', icon: 'pi pi-fw pi-calendar', to: '/app/agenda' },
            ],
        },
        {
            label: 'Sesión',
            items: [
                { label: 'Cerrar Sesión', icon: 'pi pi-fw pi-sign-out', command: handleLogout },
            ],
        },
    ];

    const model = rol === 'SuperAdministrador' ? menuAdmin : menuUsuario;

    return (
        <MenuProvider>
            <ul className="layout-menu">
                {model.map((item, i) =>
                    !item.seperator
                        ? <AppMenuitem item={item} root={true} index={i} key={item.label} />
                        : <li className="menu-separator" key={i}></li>
                )}
            </ul>
        </MenuProvider>
    );
};

export default AppMenu;
