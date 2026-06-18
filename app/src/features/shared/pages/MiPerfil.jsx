import React, { useRef, useState } from 'react';
import { Avatar } from 'primereact/avatar';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Divider } from 'primereact/divider';
import { InputText } from 'primereact/inputtext';
import { Message } from 'primereact/message';
import { Password } from 'primereact/password';
import { Toast } from 'primereact/toast';
import authService from '@/features/auth/services/authService';
import { useAuth } from '@/context/AuthContext';

const VERDE = '#3a7d1e';

export default function MiPerfil() {
    const toast               = useRef(null);
    const { usuario, recargarUsuario } = useAuth();

    const [nombre,        setNombre]        = useState(usuario?.nombre ?? '');
    const [email,         setEmail]         = useState(usuario?.email ?? '');
    const [guardandoDatos, setGuardandoDatos] = useState(false);
    const [errDatos,      setErrDatos]      = useState('');

    const [pwdActual,   setPwdActual]   = useState('');
    const [pwdNueva,    setPwdNueva]    = useState('');
    const [pwdConfirm,  setPwdConfirm]  = useState('');
    const [guardandoPwd, setGuardandoPwd] = useState(false);
    const [errPwd,      setErrPwd]      = useState('');

    const ok  = (d) => toast.current?.show({ severity: 'success', summary: 'Listo',  detail: d, life: 4000 });
    const err = (e) => toast.current?.show({ severity: 'error',   summary: 'Error',  detail: e, life: 4000 });

    const iniciales = (usuario?.nombre ?? 'U')
        .split(' ')
        .slice(0, 2)
        .map((p) => p[0])
        .join('')
        .toUpperCase();

    const guardarDatos = async () => {
        setErrDatos('');
        if (!nombre.trim()) { setErrDatos('El nombre es obligatorio.'); return; }
        if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) { setErrDatos('Ingresa un correo válido.'); return; }

        setGuardandoDatos(true);
        try {
            await authService.actualizarPerfil(nombre.trim(), email.trim());
            await recargarUsuario();
            ok('Datos actualizados correctamente.');
        } catch (e) {
            setErrDatos(e.message ?? 'No se pudo actualizar el perfil.');
        } finally {
            setGuardandoDatos(false);
        }
    };

    const cambiarPassword = async () => {
        setErrPwd('');
        if (!pwdActual || !pwdNueva || !pwdConfirm) { setErrPwd('Completa todos los campos.'); return; }
        if (pwdNueva !== pwdConfirm) { setErrPwd('Las contraseñas nuevas no coinciden.'); return; }
        if (pwdNueva.length < 8) { setErrPwd('La nueva contraseña debe tener al menos 8 caracteres.'); return; }

        setGuardandoPwd(true);
        try {
            await authService.cambiarPassword(pwdActual, pwdNueva);
            ok('Contraseña cambiada correctamente.');
            setPwdActual(''); setPwdNueva(''); setPwdConfirm('');
        } catch (e) {
            setErrPwd(e.message ?? 'No se pudo cambiar la contraseña.');
        } finally {
            setGuardandoPwd(false);
        }
    };

    return (
        <div className="p-4">
            <Toast ref={toast} />

            <div className="mb-4">
                <h1 className="text-900 font-bold m-0 mb-1" style={{ fontSize: '1.75rem' }}>Mi Perfil</h1>
                <p className="text-500 m-0 text-sm">Actualiza tus datos personales y contraseña</p>
            </div>

            <div className="grid">
                {/* ── Datos personales ── */}
                <div className="col-12 lg:col-7">
                    <Card className="shadow-1 border-round-xl h-full">
                        <div className="flex align-items-center gap-3 mb-1">
                            <Avatar
                                label={iniciales}
                                shape="circle"
                                className="font-bold text-white flex-shrink-0"
                                style={{ width: '3rem', height: '3rem', fontSize: '1rem', background: VERDE }}
                            />
                            <div>
                                <span className="text-lg font-bold text-900 block">Datos personales</span>
                                <span className="text-xs text-500">{usuario?.role_code}</span>
                            </div>
                        </div>
                        <Divider className="mt-2 mb-4" />

                        <div className="flex flex-column gap-4">
                            <div className="flex flex-column gap-2">
                                <label className="text-sm font-semibold text-700">Nombre completo</label>
                                <InputText
                                    value={nombre}
                                    onChange={(e) => setNombre(e.target.value)}
                                    placeholder="Tu nombre"
                                    className="w-full"
                                />
                            </div>
                            <div className="flex flex-column gap-2">
                                <label className="text-sm font-semibold text-700">Correo electrónico</label>
                                <InputText
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="correo@ejemplo.com"
                                    keyfilter="email"
                                    className="w-full"
                                />
                            </div>

                            {errDatos && (
                                <Message severity="error" text={errDatos} className="w-full" />
                            )}

                            <div className="flex justify-content-end">
                                <Button
                                    label="Guardar cambios"
                                    icon="pi pi-check"
                                    loading={guardandoDatos}
                                    style={{ background: VERDE, border: 'none' }}
                                    onClick={guardarDatos}
                                />
                            </div>
                        </div>
                    </Card>
                </div>

                {/* ── Cambiar contraseña ── */}
                <div className="col-12 lg:col-5">
                    <Card className="shadow-1 border-round-xl h-full">
                        <div className="flex align-items-center gap-2 mb-1">
                            <i className="pi pi-lock text-xl" style={{ color: VERDE }} />
                            <span className="text-lg font-bold text-900">Cambiar contraseña</span>
                        </div>
                        <Divider className="mt-2 mb-4" />

                        <div className="flex flex-column gap-4">
                            <div className="flex flex-column gap-2">
                                <label className="text-sm font-semibold text-700">Contraseña actual</label>
                                <Password
                                    value={pwdActual}
                                    onChange={(e) => setPwdActual(e.target.value)}
                                    feedback={false}
                                    toggleMask
                                    placeholder="Contraseña actual"
                                    inputClassName="w-full"
                                    className="w-full"
                                />
                            </div>
                            <div className="flex flex-column gap-2">
                                <label className="text-sm font-semibold text-700">Nueva contraseña</label>
                                <Password
                                    value={pwdNueva}
                                    onChange={(e) => setPwdNueva(e.target.value)}
                                    toggleMask
                                    placeholder="Mínimo 8 caracteres"
                                    inputClassName="w-full"
                                    className="w-full"
                                />
                            </div>
                            <div className="flex flex-column gap-2">
                                <label className="text-sm font-semibold text-700">Confirmar nueva contraseña</label>
                                <Password
                                    value={pwdConfirm}
                                    onChange={(e) => setPwdConfirm(e.target.value)}
                                    feedback={false}
                                    toggleMask
                                    placeholder="Repite la nueva contraseña"
                                    inputClassName="w-full"
                                    className="w-full"
                                />
                            </div>

                            {errPwd && (
                                <Message severity="error" text={errPwd} className="w-full" />
                            )}

                            <div className="flex justify-content-end">
                                <Button
                                    label="Cambiar contraseña"
                                    icon="pi pi-lock"
                                    loading={guardandoPwd}
                                    style={{ background: VERDE, border: 'none' }}
                                    onClick={cambiarPassword}
                                />
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
