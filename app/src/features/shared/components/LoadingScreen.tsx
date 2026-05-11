import React from 'react';
import { ProgressSpinner } from 'primereact/progressspinner';

const LoadingScreen: React.FC<{ mensaje?: string }> = ({ mensaje = 'Verificando sesión...' }) => {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-white z-[9999]">
            <div className="flex flex-col items-center gap-6 animate-fade-in">
                {/* Contenedor del Logo con Efecto de Pulsación */}
                <div className="relative">
                    <div className="absolute inset-0 bg-green-100 rounded-full blur-xl animate-pulse opacity-60"></div>
                    <img 
                        src="/logo.png" 
                        alt="Logo MIBOT" 
                        className="relative w-48 h-auto object-contain animate-float"
                        style={{ filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.05))' }}
                    />
                </div>

                {/* Spinner Minimalista */}
                <div className="flex flex-col items-center gap-4">
                    <ProgressSpinner 
                        style={{ width: '40px', height: '40px' }} 
                        strokeWidth="4" 
                        fill="transparent" 
                        animationDuration=".8s"
                    />
                    
                    <div className="flex flex-col items-center">
                        <span className="text-lg font-medium text-gray-700 tracking-wide uppercase text-[12px]">
                            {mensaje}
                        </span>
                        <div className="h-1 w-12 bg-green-500 rounded-full mt-2 animate-expand"></div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                @keyframes expand {
                    0%, 100% { width: 10px; opacity: 0.5; }
                    50% { width: 40px; opacity: 1; }
                }
                @keyframes fade-in {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-float { animation: float 3s ease-in-out infinite; }
                .animate-expand { animation: expand 2s ease-in-out infinite; }
                .animate-fade-in { animation: fade-in 0.6s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default LoadingScreen;
