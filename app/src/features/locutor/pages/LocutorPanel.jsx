import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Divider } from 'primereact/divider';
import { useAuth } from '@/context/AuthContext';

const VERDE       = '#3a7d1e';
const VERDE_CLARO = '#4e9e28';
const AMARILLO    = '#f5c518';

export default function LocutorPanel() {
    const navigate        = useNavigate();
    const { usuario }     = useAuth();
    const nombre          = usuario?.nombre ?? 'Locutor';

    const accesos = [
        {
            titulo:    'Mis Programas',
            icono:     'pi pi-th-large',
            descripcion: 'Crea y edita tu programación semanal. Asigna horarios, días al aire y género musical.',
            color:     VERDE,
            ruta:      '/locutor/programas',
            boton:     'Gestionar programas',
        },
        {
            titulo:    'Eventos',
            icono:     'pi pi-calendar',
            descripcion: 'Registra transmisiones especiales, entrevistas y eventos de la emisora.',
            color:     '#3b82f6',
            ruta:      '/locutor/eventos',
            boton:     'Gestionar eventos',
        },
    ];

    return (
        <div className="p-4">
            {/* Encabezado */}
            <div className="mb-5">
                <div className="flex align-items-center gap-3 mb-2">
                    <div className="border-circle flex align-items-center justify-content-center"
                        style={{ width: 52, height: 52, background: `linear-gradient(135deg, ${VERDE}, ${VERDE_CLARO})` }}>
                        <i className="pi pi-microphone text-white text-xl" />
                    </div>
                    <div>
                        <h1 className="text-900 font-bold m-0" style={{ fontSize: '1.75rem' }}>
                            Hola, {nombre}
                        </h1>
                        <p className="text-500 m-0 text-sm">Panel de Locutor — Emisora Digital del Cesar</p>
                    </div>
                </div>
                <Divider className="mt-3 mb-0" />
            </div>

            {/* Tarjetas de acceso */}
            <div className="grid">
                {accesos.map((item) => (
                    <div key={item.ruta} className="col-12 md:col-6 p-3">
                        <div className="border-round-2xl p-5 h-full flex flex-column"
                            style={{
                                background: '#fff',
                                border: '1.5px solid #e2e8f0',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                                transition: 'box-shadow .25s, transform .25s',
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.boxShadow = `0 8px 24px rgba(58,125,30,0.14)`;
                                e.currentTarget.style.transform = 'translateY(-3px)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
                                e.currentTarget.style.transform = '';
                            }}>

                            <div className="border-circle flex align-items-center justify-content-center mb-4"
                                style={{ width: 64, height: 64, background: `${item.color}18` }}>
                                <i className={`${item.icono} text-2xl`} style={{ color: item.color }} />
                            </div>

                            <h2 className="text-900 font-bold m-0 mb-2" style={{ fontSize: '1.3rem' }}>
                                {item.titulo}
                            </h2>
                            <p className="text-600 text-sm m-0 mb-4 flex-1" style={{ lineHeight: 1.6 }}>
                                {item.descripcion}
                            </p>

                            <Button
                                label={item.boton}
                                icon="pi pi-arrow-right"
                                iconPos="right"
                                rounded
                                style={{ background: item.color, border: 'none' }}
                                onClick={() => navigate(item.ruta)}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* Nota informativa */}
            <div className="mt-4 p-3 border-round-lg flex align-items-center gap-3"
                style={{ background: `${AMARILLO}18`, border: `1px solid ${AMARILLO}44` }}>
                <i className="pi pi-info-circle" style={{ color: '#b8860b', fontSize: '1.1rem' }} />
                <p className="text-sm m-0" style={{ color: '#7a5c00' }}>
                    Como locutor solo puedes gestionar programas y eventos. Para otras funciones comunícate con el administrador.
                </p>
            </div>
        </div>
    );
}
