// @ts-nocheck — archivo migrado de Sakai (JS sin tipos)
import { classNames } from 'primereact/utils';
import React, { forwardRef, useContext, useImperativeHandle, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LayoutContext } from './context/layoutcontext';
import { useAuth } from '../context/AuthContext';

const AppTopbar = forwardRef((props, ref) => {
    const { layoutState, onMenuToggle, showProfileSidebar } = useContext(LayoutContext);
    const { logout, usuario } = useAuth();
    const menubuttonRef = useRef(null);
    const topbarmenuRef = useRef(null);
    const topbarmenubuttonRef = useRef(null);
    const navigate = useNavigate();

    useImperativeHandle(ref, () => ({
        menubutton: menubuttonRef.current,
        topbarmenu: topbarmenuRef.current,
        topbarmenubutton: topbarmenubuttonRef.current
    }));

    const cerrarSesion = () => {
        logout();
        navigate('/login');
    };

    const irAPerfil = () => {
        const rol = usuario?.role_code ?? localStorage.getItem('rol');
        if (rol === 'SuperAdministrador') navigate('/admin/perfil');
        else if (rol === 'Locutor')       navigate('/locutor/perfil');
        else                              navigate('/app/perfil');
    };

    const logoDestino = (() => {
        const rol = usuario?.role_code ?? localStorage.getItem('rol');
        if (rol === 'SuperAdministrador') return '/admin';
        if (rol === 'Locutor')            return '/locutor';
        return '/app';
    })();

    return (
        <div className="layout-topbar">
            <Link to={logoDestino} className="layout-topbar-logo">
                <img src="/emisora.png" alt="Emisora Comunal del Cesar" style={{ height: 44, width: 'auto', objectFit: 'contain' }} />
            </Link>

            <button ref={menubuttonRef} type="button" className="p-link layout-menu-button layout-topbar-button" onClick={onMenuToggle}>
                <i className="pi pi-bars" />
            </button>

            <button ref={topbarmenubuttonRef} type="button" className="p-link layout-topbar-menu-button layout-topbar-button" onClick={showProfileSidebar}>
                <i className="pi pi-ellipsis-v" />
            </button>

            <div ref={topbarmenuRef} className={classNames('layout-topbar-menu', { 'layout-topbar-menu-mobile-active': layoutState.profileSidebarVisible })}>
                <button type="button" className="p-link layout-topbar-button" onClick={irAPerfil}>
                    <i className="pi pi-user"></i>
                    <span>Perfil</span>
                </button>
                <button type="button" className="p-link layout-topbar-button" onClick={cerrarSesion}>
                    <i className="pi pi-sign-out"></i>
                    <span>Salir</span>
                </button>
            </div>
        </div>
    );
});

AppTopbar.displayName = 'AppTopbar';

export default AppTopbar;
