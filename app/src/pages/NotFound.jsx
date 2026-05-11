import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div
            className="min-h-screen flex align-items-center justify-content-center flex-column gap-5 px-4"
            style={{ background: 'linear-gradient(135deg, #0d0d0d 0%, #1a0505 50%, #0d0d0d 100%)' }}
        >
            {/* Indicador de señal perdida */}
            <div className="relative flex align-items-center justify-content-center">
                <div
                    className="border-circle flex align-items-center justify-content-center"
                    style={{ width: 140, height: 140, background: 'rgba(231,76,60,0.1)', border: '2px solid rgba(231,76,60,0.3)' }}
                >
                    <i className="pi pi-wifi text-red-400" style={{ fontSize: '4rem' }} />
                </div>
                <div
                    className="border-circle absolute"
                    style={{ width: 180, height: 180, border: '1px solid rgba(231,76,60,0.15)' }}
                />
                <div
                    className="border-circle absolute"
                    style={{ width: 220, height: 220, border: '1px solid rgba(231,76,60,0.08)' }}
                />
            </div>

            <div className="text-center">
                <h1 className="m-0 font-bold" style={{ fontSize: '6rem', color: '#e74c3c', lineHeight: 1 }}>404</h1>
                <h2 className="mt-2 mb-1 text-3xl font-bold" style={{ color: '#ffffff' }}>Señal no encontrada</h2>
                <p className="text-500 text-lg m-0" style={{ maxWidth: 420 }}>
                    La página que buscas está fuera del aire. Quizás la frecuencia cambió o la dirección es incorrecta.
                </p>
            </div>

            <div className="flex gap-3 flex-wrap justify-content-center">
                <Button
                    label="Volver al inicio"
                    icon="pi pi-home"
                    severity="danger"
                    rounded
                    onClick={() => navigate('/')}
                />
                <Button
                    label="Ir atrás"
                    icon="pi pi-arrow-left"
                    outlined
                    rounded
                    style={{ borderColor: 'rgba(255,255,255,0.3)', color: '#ffffff' }}
                    onClick={() => navigate(-1)}
                />
            </div>

            <div className="flex align-items-center gap-2 mt-2">
                <div className="border-circle" style={{ width: 8, height: 8, background: '#e74c3c' }} />
                <span className="text-500 text-sm">Emisora Primicia Comunal del Cesar</span>
            </div>
        </div>
    );
};

export default NotFound;
