import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { classNames } from 'primereact/utils';

const VERDE    = '#3a7d1e';
const AMARILLO = '#f5c518';

const ResetPassword = () => {
    const toast = useRef(null);

    const [email,    setEmail]    = useState('');
    const [enviado,  setEnviado]  = useState(false);
    const [cargando, setCargando] = useState(false);
    const [error,    setError]    = useState('');

    const validar = () => {
        if (!email.trim()) { setError('El correo es requerido'); return false; }
        if (!/\S+@\S+\.\S+/.test(email)) { setError('Correo no válido'); return false; }
        setError('');
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validar()) return;

        setCargando(true);
        try {
            // TODO: reemplazar con llamada real al API
            // await authService.solicitarReset({ email });
            await new Promise((r) => setTimeout(r, 1000));
            setEnviado(true);
        } catch {
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'No se pudo enviar el correo. Inténtalo de nuevo.',
                life: 4000,
            });
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="min-h-screen flex align-items-center justify-content-center"
            style={{ background: 'linear-gradient(135deg, #0d1f06 0%, #1a3a0a 50%, #0f2908 100%)' }}>
            <Toast ref={toast} />

            <div className="surface-card border-round-2xl shadow-4 p-5 lg:p-7 w-full" style={{ maxWidth: 440 }}>
                <div className="flex justify-content-center mb-5">
                    <img src="/emisora.png" alt="Emisora Comunal del Cesar" style={{ height: 70, objectFit: 'contain' }} />
                </div>

                {!enviado ? (
                    <>
                        <div className="mb-5 text-center">
                            <div className="flex align-items-center justify-content-center mb-3">
                                <div className="border-circle flex align-items-center justify-content-center"
                                    style={{ width: 56, height: 56, background: `${VERDE}1a` }}>
                                    <i className="pi pi-lock text-2xl" style={{ color: VERDE }} />
                                </div>
                            </div>
                            <h3 className="text-900 font-bold m-0 mb-2" style={{ fontSize: '1.4rem' }}>
                                Recuperar contraseña
                            </h3>
                            <p className="text-500 m-0 text-sm">
                                Ingresa tu correo y te enviaremos las instrucciones para restablecer tu contraseña.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-column gap-4" noValidate>
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
                                        onChange={(e) => { setEmail(e.target.value); setError(''); }}
                                        placeholder="correo@ejemplo.com"
                                        className={classNames('w-full', { 'p-invalid': !!error })}
                                        autoComplete="email"
                                    />
                                </IconField>
                                {error && <small className="p-error">{error}</small>}
                            </div>

                            <Button
                                type="submit"
                                label={cargando ? 'Enviando...' : 'Enviar instrucciones'}
                                icon={cargando ? 'pi pi-spin pi-spinner' : 'pi pi-send'}
                                loading={cargando}
                                className="w-full"
                                style={{ background: VERDE, border: 'none', padding: '0.85rem' }}
                            />
                        </form>
                    </>
                ) : (
                    <div className="text-center">
                        <div className="flex align-items-center justify-content-center mb-4">
                            <div className="border-circle flex align-items-center justify-content-center"
                                style={{ width: 72, height: 72, background: `${VERDE}1a` }}>
                                <i className="pi pi-check-circle text-4xl" style={{ color: VERDE }} />
                            </div>
                        </div>
                        <h3 className="text-900 font-bold m-0 mb-2">¡Correo enviado!</h3>
                        <p className="text-500 text-sm m-0 mb-4">
                            Revisa tu bandeja de entrada en <strong className="text-900">{email}</strong>.
                            Si no lo ves, revisa la carpeta de spam.
                        </p>
                        <div className="border-round-lg p-3 mb-4"
                            style={{ background: `${AMARILLO}18`, border: `1px solid ${AMARILLO}55` }}>
                            <p className="m-0 text-sm" style={{ color: '#7a5800' }}>
                                <i className="pi pi-clock mr-2" />
                                El enlace expira en <strong>30 minutos</strong>.
                            </p>
                        </div>
                    </div>
                )}

                <div className="text-center mt-4">
                    <Link to="/login" className="text-sm font-medium no-underline" style={{ color: VERDE }}>
                        <i className="pi pi-arrow-left mr-1" />
                        Volver a iniciar sesión
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
