import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Divider } from 'primereact/divider';
import { Skeleton } from 'primereact/skeleton';

const VERDE       = '#3a7d1e';
const VERDE_CLARO = '#4e9e28';
const AMARILLO    = '#f5c518';
const BASE_URL    = `${import.meta.env.VITE_API_URL ?? 'http://localhost:8000'}/api/v1`;

async function apiFetch(path) {
    const res = await fetch(`${BASE_URL}${path}`, {
        headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
}

const formatFecha = (iso) =>
    new Date(iso).toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' });

export default function DocumentosPublico() {
    const navigate = useNavigate();
    const [documentos, setDocumentos] = useState([]);
    const [cargando,   setCargando]   = useState(true);
    const [anio]                      = useState(new Date().getFullYear());

    const cargar = useCallback(async () => {
        setCargando(true);
        try {
            const res = await apiFetch('/documentos?tamano=50');
            setDocumentos(res.data ?? []);
        } catch { setDocumentos([]); } finally { setCargando(false); }
    }, []);

    useEffect(() => { cargar(); }, [cargar]);

    return (
        <div className="min-h-screen surface-0">
            {/* ── Navbar ── */}
            <header style={{
                position: 'sticky', top: 0, zIndex: 100,
                background: '#fff',
                boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
            }}>
                <div className="flex align-items-center justify-content-between px-4 lg:px-8 py-3">
                    <div className="flex align-items-center gap-3">
                        <Button icon="pi pi-arrow-left" text rounded size="small"
                            style={{ color: VERDE }}
                            onClick={() => navigate('/')} />
                        <img src="/emisora.png" alt="Emisora"
                            style={{ height: 44, width: 'auto', objectFit: 'contain' }} />
                    </div>
                    <Button label="Ingresar" icon="pi pi-sign-in" rounded size="small"
                        style={{ background: VERDE, border: 'none' }}
                        onClick={() => navigate('/login')} />
                </div>
            </header>

            {/* ── Hero ── */}
            <div style={{ background: `linear-gradient(135deg, ${VERDE} 0%, ${VERDE_CLARO} 100%)`, padding: '3rem 2rem' }}>
                <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
                    <i className="pi pi-file-pdf text-white mb-3 block" style={{ fontSize: '3rem' }} />
                    <h1 className="text-white font-bold m-0 mb-2" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)' }}>
                        Documentos
                    </h1>
                    <p className="m-0" style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.1rem' }}>
                        Documentos oficiales de la Emisora Digital Comunal del Cesar
                    </p>
                </div>
            </div>

            {/* ── Contenido ── */}
            <div className="px-4 lg:px-8 py-6" style={{ maxWidth: 900, margin: '0 auto' }}>
                <Divider className="mt-0 mb-5" />

                {cargando ? (
                    <div className="flex flex-column gap-3">
                        {[1,2,3,4].map(i => <Skeleton key={i} height="80px" borderRadius="10px" />)}
                    </div>
                ) : documentos.length === 0 ? (
                    <div className="text-center py-8">
                        <i className="pi pi-inbox text-5xl mb-4 block" style={{ color: `${VERDE}55` }} />
                        <h3 className="text-700 m-0 mb-2">Sin documentos disponibles</h3>
                        <p className="text-500 m-0">El administrador no ha publicado documentos aún.</p>
                    </div>
                ) : (
                    <div className="flex flex-column gap-3">
                        {documentos.map((doc) => (
                            <div key={doc.id}
                                className="border-round-xl p-4 flex align-items-center justify-content-between gap-4 flex-wrap"
                                style={{
                                    background: '#fff',
                                    border: '1.5px solid #e2e8f0',
                                    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                                    transition: 'box-shadow .25s',
                                }}
                                onMouseEnter={e => e.currentTarget.style.boxShadow = `0 4px 16px rgba(58,125,30,0.12)`}
                                onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)'}>

                                <div className="flex align-items-center gap-4 flex-1 min-w-0">
                                    <div className="border-circle flex align-items-center justify-content-center flex-shrink-0"
                                        style={{ width: 52, height: 52, background: `${VERDE}15` }}>
                                        <i className="pi pi-file-pdf" style={{ fontSize: '1.5rem', color: VERDE }} />
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="text-900 font-semibold m-0 mb-1 white-space-nowrap overflow-hidden text-overflow-ellipsis"
                                            style={{ fontSize: '1rem' }}>
                                            {doc.titulo}
                                        </h4>
                                        {doc.descripcion && (
                                            <p className="text-500 text-sm m-0 mb-1 line-clamp-2">{doc.descripcion}</p>
                                        )}
                                        <div className="flex align-items-center gap-3">
                                            <span className="text-400 text-xs">
                                                <i className="pi pi-calendar mr-1" />
                                                {formatFecha(doc.creado_en)}
                                            </span>
                                            {doc.nombre_archivo && (
                                                <span className="text-400 text-xs">
                                                    <i className="pi pi-paperclip mr-1" />
                                                    {doc.nombre_archivo}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    label="Ver PDF"
                                    icon="pi pi-external-link"
                                    outlined
                                    rounded
                                    size="small"
                                    style={{ borderColor: VERDE, color: VERDE, flexShrink: 0 }}
                                    onClick={() => window.open(doc.archivo_url, '_blank')}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ── Footer ── */}
            <footer style={{ background: '#0d1f06', padding: '24px 32px', marginTop: 'auto' }}>
                <div className="text-center">
                    <span className="text-sm" style={{ color: '#4a7a38' }}>
                        © {anio} Emisora Digital Comunal Primicia Comunal del Cesar
                    </span>
                </div>
            </footer>
        </div>
    );
}
