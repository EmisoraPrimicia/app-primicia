// @ts-nocheck — archivo migrado de Sakai (JS sin tipos)
import React from 'react';
import AppMenuitem from './AppMenuitem';
import { MenuProvider } from './context/menucontext';

const AppMenu = () => {
    const model = [
        {
            label: 'Principal',
            items: [
                { label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/admin' },
            ]
        },
        {
            label: 'Contenido',
            items: [
                { label: 'Programas', icon: 'pi pi-fw pi-calendar', to: '/admin/programas' },
                { label: 'Locutores', icon: 'pi pi-fw pi-microphone', to: '/admin/locutores' },
            ]
        },
        {
            label: 'Comercial',
            items: [
                { label: 'Campañas', icon: 'pi pi-fw pi-bullhorn', to: '/admin/campanas' },
                { label: 'Clientes', icon: 'pi pi-fw pi-users', to: '/admin/clientes' },
            ]
        },
        {
            label: 'Operaciones',
            items: [
                { label: 'Agenda', icon: 'pi pi-fw pi-clock', to: '/admin/agenda' },
            ]
        },
        {
            label: 'Sistema',
            items: [
                { label: 'Configuración', icon: 'pi pi-fw pi-cog', to: '/admin/configuracion' },
            ]
        }
    ];

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