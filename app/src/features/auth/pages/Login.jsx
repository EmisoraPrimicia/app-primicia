import React, { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Checkbox } from 'primereact/checkbox';
import { Toast } from 'primereact/toast';
import { classNames } from 'primereact/utils';

const VERDE   = '#3a7d1e';
const AMARILLO = '#f5c518';

const Login = () => {
    const navigate = useNavigate();
    const toast    = useRef(null);

    const [email,    setEmail]    = useState('');
    const [password, setPassword] = useState('');
    const [recordar, setRecordar] = useState(false);
    const [cargando, setCargando] = useState(false);
    const [errores,  setErrores]  = useState({});

    const validar = () => {
        const e = {};
        if (!email.trim())               e.email    = 'El correo es requerido';
        else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Correo no válido';
        if (!password)                   e.password = 'La contraseña es requerida';
        setErrores(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validar()) return;

        setCargando(true);
        try {
            // TODO: reemplazar con llamada real al API
            // const { token, rol, usuario } = await authService.login({ email, password });
            // Simulación temporal - CREDENCIALES DE PRUEBA:
            // admin@emisora.com -> SuperAdministrador
            // usuario@emisora.com -> Usuario
            await new Promise((r) => setTimeout(r, 900));
            
            let rolSimulado = 'Usuario';
            let nombreUsuario = 'Usuario Demo';
            
            if (email.toLowerCase() === 'admin@emisora.com') {
                rolSimulado = 'SuperAdministrador';
                nombreUsuario = 'Admin Emisora';
            } else if (email.toLowerCase() === 'usuario@emisora.com') {
                rolSimulado = 'Usuario';
                nombreUsuario = 'Usuario Emisora';
            } else if (email.includes('admin')) {
                // Fallback: cualquier email con "admin" es SuperAdmin
                rolSimulado = 'SuperAdministrador';
                nombreUsuario = 'Admin Demo';
            }

            localStorage.setItem('token', 'token-simulado-' + Date.now());
            localStorage.setItem('rol', rolSimulado);
            localStorage.setItem('usuario', JSON.stringify({ email, nombre: nombreUsuario }));

            if (rolSimulado === 'SuperAdministrador') navigate('/admin');
            else navigate('/app/dashboard');
        } catch {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Credenciales incorrectas. Inténtalo de nuevo.', life: 4000 });
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="min-h-screen flex"
            style={{ background: 'linear-gradient(135deg, #0d1f06 0%, #1a3a0a 50%, #0f2908 100%)' }}>
            <Toast ref={toast} />

            {/* Panel izquierdo — branding */}
            <div className="hidden lg:flex flex-column align-items-center justify-content-center"
                style={{ width: '45%', padding: '3rem' }}>
                <img src="/emisora.png" alt="Emisora Digital Primicia Comunal del Cesar" style={{ width: 220, objectFit: 'contain', marginBottom: '2rem' }} />
                <h2 className="text-white font-bold text-center m-0" style={{ fontSize: '1.8rem', lineHeight: 1.3 }}>
                    Emisora Digital Primicia Comunal <br />
                    <span style={{ color: AMARILLO }}>del Cesar</span>
                </h2>
                <p className="text-center mt-3" style={{ color: '#7aaa66', maxWidth: 340, lineHeight: 1.8 }}>
                    Comunales del Cesar conectados en la esfera de las comunicaciones.
                </p>
                <div className="flex align-items-center gap-2 mt-5 border-round-lg px-4 py-2"
                    style={{ background: 'rgba(245,197,24,0.12)', border: `1px solid ${AMARILLO}44` }}>
                    <i className="pi pi-shield" style={{ color: AMARILLO }} />
                    <span className="text-sm" style={{ color: AMARILLO }}>Acceso seguro y protegido</span>
                </div>
            </div>

            {/* Panel derecho — formulario */}
            <div className="flex flex-1 align-items-center justify-content-center p-4 lg:p-8">
                <div className="surface-card border-round-2xl shadow-4 p-5 lg:p-7 w-full" style={{ maxWidth: 460 }}>

                    {/* Logo mobile */}
                    <div className="flex justify-content-center mb-4 lg:hidden">
                        <img src="/emisora.png" alt="Emisora Digital Primicia Comunal del Cesar" style={{ height: 70, objectFit: 'contain' }} />
                    </div>

                    <div className="mb-5">
                        <h3 className="text-900 font-bold m-0 mb-1" style={{ fontSize: '1.5rem' }}>Bienvenido</h3>
                        <p className="text-500 m-0 text-sm">Ingresa tus credenciales para continuar</p>
                        
                        {/* Credenciales de prueba */}
                        <div className="mt-3 p-3 border-round" style={{ background: `${VERDE}15`, border: `1px solid ${VERDE}40` }}>
                            <p className="m-0 text-xs font-semibold mb-2" style={{ color: VERDE }}>
                                <i className="pi pi-info-circle mr-1" />
                                Credenciales de prueba:
                            </p>
                            <p className="m-0 text-xs text-700">
                                <strong>SuperAdmin:</strong> admin@emisora.com / cualquier contraseña<br/>
                                <strong>Usuario:</strong> usuario@emisora.com / cualquier contraseña
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-column gap-4" noValidate>
                        {/* Correo */}
                        <div className="flex flex-column gap-2">
                            <label htmlFor="email" className="text-900 font-medium text-sm">
                                Correo electrónico
                            </label>
                            <IconField iconPosition="left" className="w-full">
                                <InputIcon className="pi pi-envelope" />
                                <InputText
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="correo@ejemplo.com"
                                    className={classNames('w-full', { 'p-invalid': errores.email })}
                                    autoComplete="email"
                                />
                            </IconField>
                            {errores.email && <small className="p-error">{errores.email}</small>}
                        </div>

                        {/* Contraseña */}
                        <div className="flex flex-column gap-2">
                            <label htmlFor="password" className="text-900 font-medium text-sm">
                                Contraseña
                            </label>
                            <Password
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                feedback={false}
                                toggleMask
                                className={classNames('w-full', { 'p-invalid': errores.password })}
                                inputClassName="w-full"
                                autoComplete="current-password"
                            />
                            {errores.password && <small className="p-error">{errores.password}</small>}
                        </div>

                        {/* Recordar + Olvidé */}
                        <div className="flex align-items-center justify-content-between">
                            <div className="flex align-items-center gap-2">
                                <Checkbox
                                    inputId="recordar"
                                    checked={recordar}
                                    onChange={(e) => setRecordar(e.checked)}
                                />
                                <label htmlFor="recordar" className="text-600 text-sm cursor-pointer">
                                    Recordarme
                                </label>
                            </div>
                            <Link to="/reset-password" className="text-sm font-medium no-underline" style={{ color: VERDE }}>
                                ¿Olvidaste tu contraseña?
                            </Link>
                        </div>

                        {/* Botón */}
                        <Button
                            type="submit"
                            label={cargando ? 'Ingresando...' : 'Ingresar'}
                            icon={cargando ? 'pi pi-spin pi-spinner' : 'pi pi-sign-in'}
                            loading={cargando}
                            className="w-full"
                            style={{ background: VERDE, border: 'none', padding: '0.85rem' }}
                        />
                    </form>

                    <div className="text-center mt-5">
                        <Link to="/" className="text-sm no-underline" style={{ color: '#aaa' }}>
                            <i className="pi pi-arrow-left mr-1" />
                            Volver al inicio
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;

