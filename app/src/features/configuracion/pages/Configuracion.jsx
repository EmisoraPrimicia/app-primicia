import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Divider } from 'primereact/divider';
import { InputNumber } from 'primereact/inputnumber';
import { InputSwitch } from 'primereact/inputswitch';
import { InputText } from 'primereact/inputtext';
import { Skeleton } from 'primereact/skeleton';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import configuracionService from '../services/configuracionService';

const VERDE    = '#3a7d1e';
const AMARILLO = '#f5c518';

const VACIO_STREAM = {
    nombre_servidor: '',
    stream_url:      '',
    descripcion:     '',
    icecast_host:    '',
    icecast_port:    8000,
    icecast_mount:   '/stream',
    source_password: '',
    activo:          true,
};

/* ── Panel de configuración BUTT ─────────────────────────────── */
function ButtPanel({ config, cargando }) {
    const toast = useRef(null);

    const copiar = (texto) => {
        navigator.clipboard?.writeText(texto);
        toast.current?.show({ severity: 'info', summary: 'Copiado', detail: texto, life: 2000 });
    };

    const fila = (label, valor) => (
        <div className="flex align-items-center justify-content-between py-2 border-bottom-1 border-100">
            <span className="text-500 text-sm font-semibold w-9rem flex-shrink-0">{label}</span>
            {cargando
                ? <Skeleton height="1.2rem" width="10rem" />
                : (
                    <div className="flex align-items-center gap-2 min-w-0">
                        <code className="text-sm text-900 bg-primary-50 px-2 py-1 border-round overflow-hidden text-overflow-ellipsis white-space-nowrap" style={{ maxWidth: 240 }}>
                            {valor ?? '—'}
                        </code>
                        {valor && (
                            <Button icon="pi pi-copy" rounded text size="small"
                                style={{ color: VERDE }} onClick={() => copiar(String(valor))} />
                        )}
                    </div>
                )}
        </div>
    );

    return (
        <>
            <Toast ref={toast} />
            <Card className="shadow-1" style={{ borderTop: `4px solid ${AMARILLO}`, borderRadius: 12 }}>
                <div className="flex align-items-center gap-2 mb-1">
                    <i className="pi pi-headphones text-xl" style={{ color: AMARILLO }} />
                    <h2 className="text-900 font-bold m-0" style={{ fontSize: '1.1rem' }}>
                        Datos para B.U.T.T.
                    </h2>
                </div>
                <p className="text-500 text-sm m-0 mb-3">
                    Ingresa estos datos en tu aplicación <strong>BUTT</strong> para que se conecte
                    al servidor de la emisora y puedas transmitir en vivo.
                </p>
                {fila('Host / Servidor', config?.icecast_host)}
                {fila('Puerto',          config?.icecast_port)}
                {fila('Mount point',     config?.icecast_mount)}
                {fila('Contraseña',      config?.source_password)}
                {fila('URL stream',      config?.stream_url)}
            </Card>
        </>
    );
}

/* ── Formulario de streaming ──────────────────────────────────── */
function StreamingForm({ onGuardado }) {
    const toast     = useRef(null);
    const [config,    setConfig]    = useState(null);
    const [form,      setForm]      = useState(VACIO_STREAM);
    const [cargando,  setCargando]  = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [editId,    setEditId]    = useState(null);

    const ok  = (d) => toast.current?.show({ severity: 'success', summary: 'Listo',  detail: d });
    const err = (e) => toast.current?.show({ severity: 'error',   summary: 'Error',  detail: e.message });

    const cargar = useCallback(async () => {
        setCargando(true);
        try {
            const res = await configuracionService.streaming.obtenerConfig();
            const cfg = Array.isArray(res) ? res[0] : (res?.data?.[0] ?? res?.data ?? res);
            if (cfg?.id) {
                setConfig(cfg);
                setEditId(cfg.id);
                setForm({
                    nombre_servidor: cfg.nombre_servidor ?? '',
                    stream_url:      cfg.stream_url      ?? '',
                    descripcion:     cfg.descripcion     ?? '',
                    icecast_host:    cfg.icecast_host    ?? '',
                    icecast_port:    cfg.icecast_port    ?? 8000,
                    icecast_mount:   cfg.icecast_mount   ?? '/stream',
                    source_password: cfg.source_password ?? '',
                    activo:          cfg.activo          ?? true,
                });
            }
        } catch {
            /* no config yet */
        } finally {
            setCargando(false);
        }
    }, []);

    useEffect(() => { cargar(); }, [cargar]);

    const guardar = async () => {
        if (!form.nombre_servidor.trim() || !form.stream_url.trim()) {
            toast.current?.show({ severity: 'warn', summary: 'Requerido', detail: 'Nombre y URL son obligatorios' });
            return;
        }
        setGuardando(true);
        try {
            const payload = {
                nombre_servidor: form.nombre_servidor.trim(),
                stream_url:      form.stream_url.trim(),
                descripcion:     form.descripcion     || undefined,
                icecast_host:    form.icecast_host    || undefined,
                icecast_port:    form.icecast_port    || undefined,
                icecast_mount:   form.icecast_mount   || undefined,
                source_password: form.source_password || undefined,
                activo:          form.activo,
            };
            if (editId) {
                await configuracionService.streaming.actualizar(editId, payload);
                ok('Configuración actualizada');
            } else {
                await configuracionService.streaming.crear(payload);
                ok('Configuración creada');
            }
            cargar();
            onGuardado?.();
        } catch (e) { err(e); } finally { setGuardando(false); }
    };

    const set = (key) => (val) =>
        setForm((f) => ({ ...f, [key]: typeof val === 'object' && 'target' in val ? val.target.value : val }));

    const campo = (key, label, opts = {}) => (
        <div className="field mb-3">
            <label className="block text-900 font-semibold mb-1 text-sm">{label}</label>
            {opts.number
                ? <InputNumber className="w-full" value={form[key]} min={1} max={65535}
                    onValueChange={(e) => setForm((f) => ({ ...f, [key]: e.value }))} useGrouping={false} />
                : <InputText className="w-full" value={form[key]}
                    onChange={set(key)} placeholder={opts.placeholder ?? ''}
                    type={opts.password ? 'password' : 'text'} />
            }
        </div>
    );

    return (
        <>
            <Toast ref={toast} />
            <Card className="shadow-1" style={{ borderTop: `4px solid ${VERDE}`, borderRadius: 12 }}>
                <div className="flex align-items-center justify-content-between mb-1">
                    <div className="flex align-items-center gap-2">
                        <i className="pi pi-wifi text-xl" style={{ color: VERDE }} />
                        <h2 className="text-900 font-bold m-0" style={{ fontSize: '1.1rem' }}>
                            Servidor de Streaming
                        </h2>
                    </div>
                    {!cargando && config && (
                        <Tag value={config.activo ? 'Activo' : 'Inactivo'}
                            style={{ background: config.activo ? VERDE : '#64748b', fontSize: '0.7rem' }} />
                    )}
                </div>
                <p className="text-500 text-sm m-0 mb-4">
                    {editId ? 'Modifica la configuración del servidor Icecast' : 'Configura el servidor de streaming por primera vez'}
                </p>

                {cargando ? (
                    <div className="flex flex-column gap-3">
                        {[1, 2, 3, 4].map((i) => <Skeleton key={i} height="2.5rem" />)}
                    </div>
                ) : (
                    <>
                        {campo('nombre_servidor', 'Nombre del servidor *',   { placeholder: 'Icecast Emisora...' })}
                        {campo('stream_url',      'URL pública del stream *', { placeholder: 'http://...' })}
                        {campo('descripcion',     'Descripción',              { placeholder: 'Descripción opcional' })}

                        <Divider align="left">
                            <span className="text-xs font-bold text-500 uppercase">Icecast / BUTT</span>
                        </Divider>

                        <div className="grid">
                            <div className="col-12 md:col-8">
                                {campo('icecast_host', 'Host', { placeholder: 'localhost o IP' })}
                            </div>
                            <div className="col-12 md:col-4">
                                {campo('icecast_port', 'Puerto', { number: true })}
                            </div>
                        </div>
                        {campo('icecast_mount',   'Mount point',       { placeholder: '/stream' })}
                        {campo('source_password', 'Contraseña source', { password: true })}

                        <div className="flex align-items-center gap-2 mb-4">
                            <InputSwitch checked={form.activo}
                                onChange={(e) => setForm((f) => ({ ...f, activo: e.value }))} />
                            <label className="text-sm font-semibold">Servidor activo</label>
                        </div>

                        <div className="flex justify-content-end">
                            <Button
                                label={editId ? 'Guardar cambios' : 'Crear configuración'}
                                icon="pi pi-save" size="small" loading={guardando}
                                style={{ background: VERDE, borderColor: VERDE }}
                                onClick={guardar} />
                        </div>
                    </>
                )}
            </Card>
        </>
    );
}

/* ── Página principal ─────────────────────────────────────────── */
export default function Configuracion() {
    const [butt,         setButt]         = useState(null);
    const [cargandoButt, setCargandoButt] = useState(true);

    const cargarButt = useCallback(async () => {
        setCargandoButt(true);
        try {
            const res = await configuracionService.streaming.buttConfig();
            setButt(res);
        } catch {
            /* no config yet */
        } finally {
            setCargandoButt(false);
        }
    }, []);

    useEffect(() => { cargarButt(); }, [cargarButt]);

    return (
        <div className="p-4">
            <div className="mb-4">
                <h1 className="text-900 font-bold m-0 mb-1" style={{ fontSize: '1.75rem' }}>Configuración</h1>
                <p className="text-500 m-0 text-sm">Ajustes del servidor de streaming y B.U.T.T.</p>
            </div>

            <div className="grid">
                <div className="col-12 lg:col-7">
                    <StreamingForm onGuardado={cargarButt} />
                </div>
                <div className="col-12 lg:col-5">
                    <ButtPanel config={butt} cargando={cargandoButt} />
                </div>
            </div>
        </div>
    );
}
