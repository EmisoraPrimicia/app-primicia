import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Column } from 'primereact/column';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputSwitch } from 'primereact/inputswitch';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import ImageUpload from '../../shared/components/ImageUpload';
import agendaService from '../services/agendaService';

const VERDE    = '#3a7d1e';
const AMARILLO = '#f5c518';

const TIPOS = [
    { label: 'Evento',              value: 'Evento' },
    { label: 'Transmisión Especial', value: 'Transmisión Especial' },
    { label: 'Entrevista',          value: 'Entrevista' },
];

const TIPO_STYLE = {
    'Evento':              { bg: '#eff6ff', color: '#3b82f6' },
    'Transmisión Especial': { bg: `${VERDE}18`, color: VERDE },
    'Entrevista':          { bg: '#fdf4ff', color: '#a855f7' },
};

const VACIO = {
    titulo: '', descripcion: '', lugar: '', imagen_url: '',
    tipo: 'Evento', publico: true,
    fecha_inicio: null, fecha_fin: null,
};

const formatFecha = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('es-CO', {
        weekday: 'short', day: '2-digit', month: 'short',
        hour: '2-digit', minute: '2-digit',
    });
};

const toISO = (date) => (date ? new Date(date).toISOString() : undefined);

export default function Agenda() {
    const toast     = useRef(null);
    const [lista,     setLista]     = useState([]);
    const [total,     setTotal]     = useState(0);
    const [pagina,    setPagina]    = useState(1);
    const [cargando,  setCargando]  = useState(false);
    const [dialogo,   setDialogo]   = useState(false);
    const [form,      setForm]      = useState(VACIO);
    const [editId,    setEditId]    = useState(null);
    const [guardando, setGuardando] = useState(false);
    const tamano = 15;

    const ok  = (d) => toast.current?.show({ severity: 'success', summary: 'Listo', detail: d });
    const err = (e) => toast.current?.show({ severity: 'error',   summary: 'Error', detail: e.message });

    const cargar = useCallback(async (pag = pagina) => {
        setCargando(true);
        try {
            const res = await agendaService.listar(pag, tamano);
            setLista(res.data ?? []);
            setTotal(res.total ?? 0);
        } catch (e) { err(e); } finally { setCargando(false); }
    }, [pagina]);

    useEffect(() => { cargar(); }, [cargar]);

    const abrirNuevo  = () => { setForm(VACIO); setEditId(null); setDialogo(true); };
    const abrirEditar = (r) => {
        setForm({
            titulo:       r.titulo       ?? '',
            descripcion:  r.descripcion  ?? '',
            lugar:        r.lugar        ?? '',
            imagen_url:   r.imagen_url   ?? '',
            tipo:         r.tipo         ?? 'Evento',
            publico:      r.publico      ?? true,
            fecha_inicio: r.fecha_inicio ? new Date(r.fecha_inicio) : null,
            fecha_fin:    r.fecha_fin    ? new Date(r.fecha_fin)    : null,
        });
        setEditId(r.id);
        setDialogo(true);
    };

    const guardar = async () => {
        if (!form.titulo.trim() || !form.fecha_inicio) {
            toast.current?.show({ severity: 'warn', summary: 'Requerido', detail: 'Título y fecha de inicio son obligatorios' });
            return;
        }
        setGuardando(true);
        try {
            const payload = {
                titulo:       form.titulo.trim(),
                descripcion:  form.descripcion  || undefined,
                lugar:        form.lugar        || undefined,
                imagen_url:   form.imagen_url   || undefined,
                tipo:         form.tipo,
                publico:      form.publico,
                fecha_inicio: toISO(form.fecha_inicio),
                fecha_fin:    toISO(form.fecha_fin),
            };
            if (editId) {
                await agendaService.actualizar(editId, payload);
                ok('Evento actualizado');
            } else {
                await agendaService.crear(payload);
                ok('Evento creado');
            }
            setDialogo(false);
            cargar();
        } catch (e) { err(e); } finally { setGuardando(false); }
    };

    const confirmarEliminar = (r) => {
        confirmDialog({
            message:  `¿Eliminar el evento "${r.titulo}"?`,
            header:   'Confirmar eliminación',
            icon:     'pi pi-exclamation-triangle',
            acceptLabel: 'Eliminar',
            rejectLabel: 'Cancelar',
            acceptClassName: 'p-button-danger',
            accept: async () => {
                try {
                    await agendaService.eliminar(r.id);
                    ok('Evento eliminado');
                    cargar();
                } catch (e) { err(e); }
            },
        });
    };

    const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target?.value ?? e.value }));

    return (
        <div className="p-4">
            <Toast ref={toast} />
            <ConfirmDialog />

            <div className="flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
                <div>
                    <h1 className="text-900 font-bold m-0 mb-1" style={{ fontSize: '1.75rem' }}>Agenda</h1>
                    <p className="text-500 m-0 text-sm">Calendario de transmisiones y eventos</p>
                </div>
                <Button label="Nuevo evento" icon="pi pi-plus" size="small"
                    style={{ background: VERDE, borderColor: VERDE }} onClick={abrirNuevo} />
            </div>

            <div className="card shadow-1 border-round-xl">
                <DataTable
                    value={lista}
                    loading={cargando}
                    paginator rows={tamano}
                    totalRecords={total} lazy
                    first={(pagina - 1) * tamano}
                    onPage={(e) => { setPagina(e.page + 1); cargar(e.page + 1); }}
                    emptyMessage="Sin eventos registrados"
                    rowHover stripedRows
                    sortField="fecha_inicio" sortOrder={1}
                >
                    <Column field="titulo" header="Evento" sortable
                        body={(r) => <span className="font-semibold">{r.titulo}</span>} />
                    <Column field="tipo" header="Tipo" style={{ width: 120 }}
                        body={(r) => {
                            const s = TIPO_STYLE[r.tipo] ?? TIPO_STYLE.OTRO;
                            const lbl = TIPOS.find((t) => t.value === r.tipo)?.label ?? r.tipo;
                            return <Tag value={lbl} style={{ background: s.bg, color: s.color, fontSize: '0.7rem' }} />;
                        }} />
                    <Column field="fecha_inicio" header="Inicio" sortable
                        body={(r) => formatFecha(r.fecha_inicio)} />
                    <Column field="lugar" header="Lugar"
                        body={(r) => r.lugar ?? '—'} />
                    <Column field="publico" header="Visibilidad" style={{ width: 100 }}
                        body={(r) => (
                            <Tag value={r.publico ? 'Público' : 'Privado'}
                                style={{ background: r.publico ? `${VERDE}20` : '#f1f5f9', color: r.publico ? VERDE : '#64748b', fontSize: '0.7rem' }} />
                        )} />
                    <Column header="Acciones" style={{ width: 100 }}
                        body={(r) => (
                            <div className="flex gap-2">
                                <Button icon="pi pi-pencil" rounded text size="small"
                                    style={{ color: VERDE }} onClick={() => abrirEditar(r)} />
                                <Button icon="pi pi-trash" rounded text size="small"
                                    className="p-button-danger" onClick={() => confirmarEliminar(r)} />
                            </div>
                        )} />
                </DataTable>
            </div>

            <Dialog header={editId ? 'Editar evento' : 'Nuevo evento'}
                visible={dialogo} style={{ width: 560 }}
                onHide={() => setDialogo(false)} modal>
                <div className="pt-2">
                    <div className="field mb-3">
                        <label className="block text-900 font-semibold mb-1 text-sm">Título *</label>
                        <InputText className="w-full" value={form.titulo} onChange={set('titulo')} />
                    </div>
                    <div className="field mb-3">
                        <label className="block text-900 font-semibold mb-1 text-sm">Descripción</label>
                        <InputTextarea rows={2} className="w-full" autoResize
                            value={form.descripcion} onChange={set('descripcion')} />
                    </div>
                    <div className="grid">
                        <div className="col-12 md:col-6">
                            <div className="field mb-3">
                                <label className="block text-900 font-semibold mb-1 text-sm">Fecha inicio *</label>
                                <Calendar className="w-full" value={form.fecha_inicio}
                                    onChange={(e) => setForm((f) => ({ ...f, fecha_inicio: e.value }))}
                                    showTime showSeconds={false} dateFormat="dd/mm/yy"
                                    placeholder="dd/mm/aaaa hh:mm" />
                            </div>
                        </div>
                        <div className="col-12 md:col-6">
                            <div className="field mb-3">
                                <label className="block text-900 font-semibold mb-1 text-sm">Fecha fin</label>
                                <Calendar className="w-full" value={form.fecha_fin}
                                    onChange={(e) => setForm((f) => ({ ...f, fecha_fin: e.value }))}
                                    showTime showSeconds={false} dateFormat="dd/mm/yy"
                                    placeholder="dd/mm/aaaa hh:mm" minDate={form.fecha_inicio ?? undefined} />
                            </div>
                        </div>
                    </div>
                    <div className="grid">
                        <div className="col-12 md:col-6">
                            <div className="field mb-3">
                                <label className="block text-900 font-semibold mb-1 text-sm">Tipo</label>
                                <Dropdown className="w-full" value={form.tipo} options={TIPOS}
                                    onChange={(e) => setForm((f) => ({ ...f, tipo: e.value }))} />
                            </div>
                        </div>
                        <div className="col-12 md:col-6">
                            <div className="field mb-3">
                                <label className="block text-900 font-semibold mb-1 text-sm">Lugar</label>
                                <InputText className="w-full" placeholder="Ciudad, recinto..."
                                    value={form.lugar} onChange={set('lugar')} />
                            </div>
                        </div>
                    </div>
                    <ImageUpload
                        label="Imagen del evento"
                        carpeta="eventos"
                        value={form.imagen_url}
                        onUrlChange={(url) => setForm((f) => ({ ...f, imagen_url: url }))}
                    />
                    <div className="flex align-items-center gap-2 mb-3">
                        <InputSwitch checked={form.publico}
                            onChange={(e) => setForm((f) => ({ ...f, publico: e.value }))} />
                        <label className="text-sm font-semibold">Evento público</label>
                    </div>

                    <div className="flex justify-content-end gap-2 mt-3">
                        <Button label="Cancelar" outlined size="small" onClick={() => setDialogo(false)} />
                        <Button label={editId ? 'Guardar cambios' : 'Crear evento'}
                            size="small" loading={guardando}
                            style={{ background: VERDE, borderColor: VERDE }}
                            onClick={guardar} />
                    </div>
                </div>
            </Dialog>
        </div>
    );
}
