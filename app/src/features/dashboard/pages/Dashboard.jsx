import React, { useCallback, useEffect, useState } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Skeleton } from 'primereact/skeleton';
import { Tag } from 'primereact/tag';
import { useAuth } from '@/context/AuthContext';
import dashboardService from '../services/dashboardService';

const VERDE    = '#3a7d1e';
const AMARILLO = '#f5c518';

/* ── Tarjeta KPI ──────────────────────────────────────────────── */
function KpiCard({ titulo, valor, icono, color, bg, cargando }) {
    return (
        <Card className="shadow-1 h-full" style={{ borderTop: `4px solid ${color}`, borderRadius: 12 }}>
            <div className="flex align-items-center justify-content-between mb-3">
                <span className="text-500 text-sm font-semibold uppercase">{titulo}</span>
                <span className="flex align-items-center justify-content-center border-round-lg"
                    style={{ width: 40, height: 40, background: bg }}>
                    <i className={`pi ${icono}`} style={{ color, fontSize: '1.1rem' }} />
                </span>
            </div>
            {cargando
                ? <Skeleton height="2rem" className="mb-1" />
                : <div className="text-900 font-bold" style={{ fontSize: '2rem', lineHeight: 1 }}>{valor}</div>}
        </Card>
    );
}

/* ── Tarjeta Streaming ────────────────────────────────────────── */
function StreamingCard({ estado, cargando }) {
    const enVivo = estado?.en_vivo;

    return (
        <Card className="shadow-1 h-full" style={{ borderTop: `4px solid ${enVivo ? VERDE : '#94a3b8'}`, borderRadius: 12 }}>
            <div className="flex align-items-center justify-content-between mb-4">
                <span className="text-500 text-sm font-semibold uppercase">Transmisión en vivo</span>
                {!cargando && (
                    <Tag
                        value={enVivo ? 'AL AIRE' : 'FUERA DEL AIRE'}
                        style={{
                            background: enVivo ? VERDE : '#64748b',
                            fontSize: '0.7rem',
                            letterSpacing: '0.05em',
                        }}
                    />
                )}
            </div>

            {cargando ? (
                <Skeleton height="5rem" />
            ) : (
                <div className="flex flex-column align-items-center gap-3 py-3">
                    <div className="border-circle flex align-items-center justify-content-center"
                        style={{
                            width: 72, height: 72,
                            background: enVivo ? `${VERDE}18` : '#f1f5f9',
                            border: `3px solid ${enVivo ? VERDE : '#cbd5e1'}`,
                        }}>
                        <i className={`pi ${enVivo ? 'pi-volume-up' : 'pi-volume-off'}`}
                            style={{ fontSize: '1.8rem', color: enVivo ? VERDE : '#94a3b8' }} />
                    </div>

                    <div className="text-center">
                        <p className="text-900 font-semibold m-0 mb-1">
                            {enVivo ? estado.nombre_servidor : 'Sin transmisión activa'}
                        </p>
                        {enVivo && (
                            <a href={estado.stream_url} target="_blank" rel="noreferrer"
                                className="text-sm no-underline" style={{ color: VERDE }}>
                                <i className="pi pi-external-link mr-1" />
                                {estado.stream_url}
                            </a>
                        )}
                    </div>

                    {enVivo && (
                        <div className="flex align-items-center gap-2">
                            <span className="border-circle" style={{ width: 8, height: 8, background: VERDE, animation: 'pulse 1.5s infinite' }} />
                            <span className="text-xs font-semibold" style={{ color: VERDE }}>Transmitiendo</span>
                        </div>
                    )}
                </div>
            )}
        </Card>
    );
}

/* ── Lista próximos eventos ───────────────────────────────────── */
function ProximosEventos({ eventos, cargando }) {
    const formatFecha = (iso) => {
        const d = new Date(iso);
        return d.toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    };

    const tipoColor = {
        'Evento':               { bg: '#eff6ff', color: '#3b82f6' },
        'Transmisión Especial': { bg: `${VERDE}15`, color: VERDE },
        'Entrevista':           { bg: '#fdf4ff', color: '#a855f7' },
    };

    return (
        <Card className="shadow-1 h-full" style={{ borderTop: `4px solid ${AMARILLO}`, borderRadius: 12 }}>
            <div className="flex align-items-center justify-content-between mb-4">
                <span className="text-500 text-sm font-semibold uppercase">Próximos eventos</span>
                <i className="pi pi-calendar" style={{ color: AMARILLO }} />
            </div>

            {cargando ? (
                <div className="flex flex-column gap-3">
                    {[1, 2, 3].map((i) => <Skeleton key={i} height="3.5rem" borderRadius="8px" />)}
                </div>
            ) : eventos.length === 0 ? (
                <div className="flex flex-column align-items-center justify-content-center py-5 gap-2">
                    <i className="pi pi-calendar-times text-4xl text-300" />
                    <p className="text-500 text-sm m-0">Sin eventos próximos</p>
                </div>
            ) : (
                <div className="flex flex-column gap-2">
                    {eventos.map((ev) => {
                        const c = tipoColor[ev.tipo] ?? tipoColor.Otro;
                        return (
                            <div key={ev.id} className="flex align-items-start gap-3 p-3 border-round-lg"
                                style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                                <div className="flex align-items-center justify-content-center border-round-lg flex-shrink-0"
                                    style={{ width: 36, height: 36, background: c.bg }}>
                                    <i className="pi pi-calendar-plus text-sm" style={{ color: c.color }} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-900 font-semibold m-0 mb-1 text-sm white-space-nowrap overflow-hidden text-overflow-ellipsis">
                                        {ev.titulo}
                                    </p>
                                    <div className="flex align-items-center gap-2 flex-wrap">
                                        <span className="text-xs text-500">
                                            <i className="pi pi-clock mr-1" />{formatFecha(ev.fecha_inicio)}
                                        </span>
                                        {ev.lugar && (
                                            <span className="text-xs text-500">
                                                <i className="pi pi-map-marker mr-1" />{ev.lugar}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <Tag value={ev.tipo} style={{ background: c.bg, color: c.color, fontSize: '0.65rem' }} />
                            </div>
                        );
                    })}
                </div>
            )}
        </Card>
    );
}

/* ── Página principal ─────────────────────────────────────────── */
const Dashboard = () => {
    const { usuario } = useAuth();
    const [resumen,  setResumen]  = useState(null);
    const [eventos,  setEventos]  = useState([]);
    const [cargando, setCargando] = useState(true);

    const cargar = useCallback(async () => {
        setCargando(true);
        try {
            const [res, evs] = await Promise.all([
                dashboardService.resumen(),
                dashboardService.proximosEventos(5),
            ]);
            setResumen(res);
            setEventos(evs);
        } catch (err) {
            console.error('Error cargando dashboard:', err);
        } finally {
            setCargando(false);
        }
    }, []);

    useEffect(() => { cargar(); }, [cargar]);

    const nombre = usuario?.nombre ?? 'Administrador';

    return (
        <div className="p-4">
            {/* Encabezado */}
            <div className="flex align-items-center justify-content-between mb-5 flex-wrap gap-3">
                <div>
                    <h1 className="text-900 font-bold m-0 mb-1" style={{ fontSize: '1.75rem' }}>
                        Panel de Control
                    </h1>
                    <p className="text-500 m-0 text-sm">
                        Bienvenido de nuevo, <strong className="text-900">{nombre}</strong>
                    </p>
                </div>
                <Button
                    icon="pi pi-refresh"
                    label="Actualizar"
                    outlined
                    size="small"
                    loading={cargando}
                    onClick={cargar}
                    style={{ color: VERDE, borderColor: VERDE }}
                />
            </div>

            {/* KPIs */}
            <div className="grid mb-4">
                <div className="col-12 sm:col-6 lg:col-3">
                    <KpiCard
                        titulo="Locutores"
                        valor={resumen?.totalLocutores ?? '—'}
                        icono="pi-microphone"
                        color={VERDE}
                        bg={`${VERDE}18`}
                        cargando={cargando}
                    />
                </div>
                <div className="col-12 sm:col-6 lg:col-3">
                    <KpiCard
                        titulo="Programas"
                        valor={resumen?.totalProgramas ?? '—'}
                        icono="pi-th-large"
                        color="#6366f1"
                        bg="#eef2ff"
                        cargando={cargando}
                    />
                </div>
                <div className="col-12 sm:col-6 lg:col-3">
                    <KpiCard
                        titulo="Noticias publicadas"
                        valor={resumen?.totalNoticias ?? '—'}
                        icono="pi-file-edit"
                        color="#f59e0b"
                        bg="#fffbeb"
                        cargando={cargando}
                    />
                </div>
                <div className="col-12 sm:col-6 lg:col-3">
                    <KpiCard
                        titulo="Eventos"
                        valor={resumen?.totalEventos ?? '—'}
                        icono="pi-calendar"
                        color="#ec4899"
                        bg="#fdf2f8"
                        cargando={cargando}
                    />
                </div>
            </div>

            {/* Streaming + Próximos eventos */}
            <div className="grid">
                <div className="col-12 md:col-4">
                    <StreamingCard estado={resumen?.streaming} cargando={cargando} />
                </div>
                <div className="col-12 md:col-8">
                    <ProximosEventos eventos={eventos} cargando={cargando} />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
