import React from 'react';
import { ProgressSpinner } from 'primereact/progressspinner';

const LoadingScreen = () => {
    return (
        <div
            className="min-h-screen flex flex-column align-items-center justify-content-center gap-4"
            style={{ background: 'linear-gradient(135deg, #0d0d0d 0%, #1a0505 50%, #0d0d0d 100%)' }}
        >
            {/* Logo animado */}
            <div className="relative flex align-items-center justify-content-center">
                {[1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className="border-circle absolute"
                        style={{
                            width: 80 + i * 40,
                            height: 80 + i * 40,
                            border: `1px solid rgba(231,76,60,${0.4 - i * 0.1})`,
                            animation: `pulseRing ${1 + i * 0.4}s ease-out infinite`,
                            animationDelay: `${i * 0.2}s`,
                        }}
                    />
                ))}
                <div
                    className="border-circle flex align-items-center justify-content-center"
                    style={{ width: 80, height: 80, background: 'linear-gradient(135deg, #c0392b, #e74c3c)', position: 'relative', zIndex: 1 }}
                >
                    <i className="pi pi-microphone text-white" style={{ fontSize: '2rem' }} />
                </div>
            </div>

            <ProgressSpinner
                style={{ width: 40, height: 40 }}
                strokeWidth="4"
                animationDuration=".8s"
                pt={{ circle: { style: { stroke: '#e74c3c' } } }}
            />

            <div className="text-center">
                <p className="text-300 text-sm m-0 font-medium tracking-widest uppercase">Cargando</p>
                <p className="text-500 text-xs m-0 mt-1">Emisora Primicia Comunal del Cesar</p>
            </div>

            <style>{`
                @keyframes pulseRing {
                    0% { transform: scale(1); opacity: 1; }
                    100% { transform: scale(1.3); opacity: 0; }
                }
            `}</style>
        </div>
    );
};

export default LoadingScreen;
