import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Column } from 'primereact/column';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { SelectButton } from 'primereact/selectbutton';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import locutoresService from '../../locutores/services/locutoresService';
import ImageUpload from '../../shared/components/ImageUpload';
import programasService from '../services/programasService';
import { useAuth } from '../../../context/AuthContext';

const VERDE    = '#3a7d1e';
const AMARILLO = '#f5c518';

const DIAS = [
    { label: 'Lunes',     value: 'Lunes' },
    { label: 'Martes',    value: 'Martes' },
    { label: 'Miércoles', value: 'Miércoles' },
    { label: 'Jueves',    value: 'Jueves' },
    { label: 'Viernes',   value: 'Viernes' },
    { label: 'Sábado',    value: 'Sábado' },
    { label: 'Domingo',   value: 'Domingo' },
];

/* Opciones de hora cada 30 minutos: 00:00 … 23:30 */
const HORAS = Array.from({ length: 48 }, (_, i) => {
    const h = String(Math.floor(i / 2)).padStart(2, '0');
    const m = i % 2 === 0 ? '00' : '30';
    return { label: `${h}:${m}`, value: `${h}:${m}` };
});

const VISTA_OPTS = [
    { label: 'Lista', value: 'lista' },
    { label: 'Parrilla', value: 'parrilla' },
];

/* Devuelve el lunes de la semana a la que pertenece una fecha */
function lunesDe(fecha) {
    const d = new Date(fecha);
    const dow = d.getDay(); // 0=Dom
    const diff = dow === 0 ? -6 : 1 - dow;
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
}

/* Formatea Date → 'YYYY-MM-DD' */
function toISO(d) {
    if (!d) return null;
    const lunes = lunesDe(d);
    return lunes.toISOString().split('T')[0];
}

/* Label de semana: "Sem. 19 may – 25 may 2025" */
function labelSemana(fecha) {
    if (!fecha) return '';
    const lunes = lunesDe(fecha);
    const domingo = new Date(lunes);
    domingo.setDate(lunes.getDate() + 6);
    const fmt = { day: '2-digit', month: 'short' };
    return `Sem. ${lunes.toLocaleDateString('es-CO', fmt)} – ${domingo.toLocaleDateString('es-CO', { ...fmt, year: 'numeric' })}`;
}

const VACIO = {
    nombre: '', descripcion: '', imagen_url: '', dia_semana: '',
    hora_inicio: '', hora_fin: '', genero_musical: '', locutor_id: null,
    fecha_semana: null,   // Date | null  → null = recurrente
};

/* ── Parrilla semanal ──────────────────────────────────────────── */
function ParrillaSemanal({ data, semanaDate, onSemanaChange }) {
    if (!data) return null;
    return (
        <div>
            {/* Selector de semana en la vista admin */}
            <div className="flex align-items-center gap-3 mb-4 flex-wrap">
                <span className="font-semibold text-700 text-sm">Semana:</span>
                <Calendar
                    value={semanaDate}
                    onChange={(e) => onSemanaChange(e.value)}
                    dateFormat="dd/mm/yy"
                    placeholder="Cualquier día de la semana"
                    showButtonBar
                    showIcon
                    style={{ width: 220 }}
                />
                {semanaDate && (
                    <span className="text-600 text-sm">
                        <i className="pi pi-calendar mr-1" style={{ color: VERDE }} />
                        {labelSemana(semanaDate)}
                    </span>
                )}
                {semanaDate && (
                    <Button label="Ver recurrentes" icon="pi pi-refresh" size="small" text
                        style={{ color: VERDE }} onClick={() => onSemanaChange(null)} />
                )}
            </div>
            <div className="grid">
                {DIAS.map(({ label, value }) => {
                    const programas = data[value] ?? [];
                    return (
                        <div key={value} className="col-12 md:col-6 lg:col-3 xl:col-2">
                            <div className="border-round-xl shadow-1 overflow-hidden">
                                <div className="px-3 py-2 font-bold text-sm text-white"
                                    style={{ background: VERDE }}>{label}</div>
                                {programas.length === 0
                                    ? <p className="text-center text-400 text-xs py-3 m-0">Sin programas</p>
                                    : programas.map((p) => (
                                        <div key={p.id} className="px-3 py-2 border-bottom-1 border-200 text-sm">
                                            <p className="m-0 font-semibold text-900 white-space-nowrap overflow-hidden text-overflow-ellipsis">{p.nombre}</p>
                                            <p className="m-0 text-400 text-xs">{p.hora_inicio?.slice(0, 5)} – {p.hora_fin?.slice(0, 5)}</p>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

/* ── Página principal ──────────────────────────────────────────── */
export default function Programas() {
    const { rol }  = useAuth();
    const esAdmin  = rol === 'SuperAdministrador';
    const toast     = useRef(null);
    const [vista,     setVista]     = useState('lista');
    const [lista,     setLista]     = useState([]);
    const [total,     setTotal]     = useState(0);
    const [pagina,    setPagina]    = useState(1);
    const [parrilla,       setParrilla]       = useState(null);
    const [semanaParrilla, setSemanaParrilla] = useState(null); // Date | null
    const [locutores,      setLocutores]      = useState([]);
    const [cargando,  setCargando]  = useState(false);
    const [dialogo,   setDialogo]   = useState(false);
    const [form,      setForm]      = useState(VACIO);
    const [editId,    setEditId]    = useState(null);
    const [guardando, setGuardando] = useState(false);
    const tamano = 15;

    const ok  = (d) => toast.current?.show({ severity: 'success', summary: 'Listo', detail: d });
    const err = (e) => toast.current?.show({ severity: 'error',   summary: 'Error', detail: e.message });

    const cargarLista = useCallback(async (pag = pagina) => {
        setCargando(true);
        try {
            const res = await programasService.listar(pag, tamano);
            setLista(res.data ?? []);
            setTotal(res.total ?? 0);
        } catch (e) { err(e); } finally { setCargando(false); }
    }, [pagina]);

    const cargarParrilla = useCallback(async (fecha = semanaParrilla) => {
        setCargando(true);
        try {
            const fechaParam = toISO(fecha);
            const res = await programasService.parrilla(fechaParam);
            setParrilla(res.data ?? res);
        } catch (e) { err(e); } finally { setCargando(false); }
    }, [semanaParrilla]);

    const cargarLocutores = useCallback(async () => {
        try {
            const res = await locutoresService.listar(1, 100);
            setLocutores((res.data ?? []).map((l) => ({
                label: l.nombre_completo ?? `${l.nombre} ${l.apellido}`,
                value: l.id,
            })));
        } catch { /* silencioso */ }
    }, []);

    useEffect(() => {
        cargarLocutores();
        if (vista === 'lista') cargarLista();
        else cargarParrilla();
    }, [vista, cargarLista, cargarParrilla, cargarLocutores]);

    const abrirNuevo = () => { setForm(VACIO); setEditId(null); setDialogo(true); };
    const abrirEditar = (r) => {
        setForm({
            nombre:         r.nombre           ?? '',
            descripcion:    r.descripcion      ?? '',
            imagen_url:     r.imagen_url       ?? '',
            dia_semana:     r.dia_semana       ?? '',
            hora_inicio:    r.hora_inicio?.slice(0, 5) ?? '',
            hora_fin:       r.hora_fin?.slice(0, 5)    ?? '',
            genero_musical: r.genero_musical   ?? '',
            locutor_id:     r.locutor_id       ?? null,
            fecha_semana:   r.fecha_semana ? new Date(r.fecha_semana) : null,
        });
        setEditId(r.id);
        setDialogo(true);
    };

    const guardar = async () => {
        if (!form.nombre.trim() || !form.dia_semana || !form.hora_inicio || !form.hora_fin) {
            toast.current?.show({ severity: 'warn', summary: 'Requerido', detail: 'Nombre, día y horario son obligatorios' });
            return;
        }
        setGuardando(true);
        try {
            const payload = {
                nombre:         form.nombre.trim(),
                descripcion:    form.descripcion   || undefined,
                imagen_url:     form.imagen_url    || undefined,
                dia_semana:     form.dia_semana,
                hora_inicio:    form.hora_inicio,
                hora_fin:       form.hora_fin,
                genero_musical: form.genero_musical || undefined,
                locutor_id:     form.locutor_id    ?? undefined,
                fecha_semana:   toISO(form.fecha_semana) ?? undefined,
            };
            if (editId) {
                await programasService.actualizar(editId, payload);
                ok('Programa actualizado');
            } else {
                await programasService.crear(payload);
                ok('Programa creado');
            }
            setDialogo(false);
            vista === 'lista' ? cargarLista() : cargarParrilla();
        } catch (e) { err(e); } finally { setGuardando(false); }
    };

    const confirmarEliminar = (r) => {
        confirmDialog({
            message:  `¿Eliminar el programa "${r.nombre}"?`,
            header:   'Confirmar eliminación',
            icon:     'pi pi-exclamation-triangle',
            acceptLabel: 'Eliminar',
            rejectLabel: 'Cancelar',
            acceptClassName: 'p-button-danger',
            accept: async () => {
                try {
                    await programasService.eliminar(r.id);
                    ok('Programa eliminado');
                    cargarLista();
                } catch (e) { err(e); }
            },
        });
    };

    const campo = (key, label, opts = {}) => (
        <div className="field mb-3">
            <label className="block text-900 font-semibold mb-1 text-sm">{label}</label>
            {opts.dropdown
                ? <Dropdown className="w-full" value={form[key]} options={opts.options ?? []}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.value }))}
                    placeholder={opts.placeholder ?? 'Seleccionar'}
                    showClear={opts.clearable} filter={opts.filter} />
                : opts.textarea
                    ? <InputTextarea rows={2} className="w-full" value={form[key]}
                        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} autoResize />
                    : <InputText className="w-full" value={form[key]}
                        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                        placeholder={opts.placeholder ?? ''} />
            }
        </div>
    );

    return (
        <div className="p-4">
            <Toast ref={toast} />
            <ConfirmDialog />

            <div className="flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
                <div>
                    <h1 className="text-900 font-bold m-0 mb-1" style={{ fontSize: '1.75rem' }}>Programas</h1>
                    <p className="text-500 m-0 text-sm">Gestión de programas y parrilla semanal</p>
                </div>
                <div className="flex align-items-center gap-2">
                    <SelectButton value={vista} options={VISTA_OPTS}
                        onChange={(e) => e.value && setVista(e.value)} />
                    <Button label="Nuevo programa" icon="pi pi-plus" size="small"
                        style={{ background: VERDE, borderColor: VERDE }} onClick={abrirNuevo} />
                </div>
            </div>

            {vista === 'parrilla'
                ? <ParrillaSemanal data={parrilla}
                    semanaDate={semanaParrilla}
                    onSemanaChange={(d) => { setSemanaParrilla(d); cargarParrilla(d); }} />
                : (
                    <div className="card shadow-1 border-round-xl">
                        <DataTable
                            value={lista}
                            loading={cargando}
                            paginator rows={tamano}
                            totalRecords={total} lazy
                            first={(pagina - 1) * tamano}
                            onPage={(e) => { setPagina(e.page + 1); cargarLista(e.page + 1); }}
                            emptyMessage="Sin programas registrados"
                            rowHover stripedRows
                        >
                            <Column field="nombre" header="Nombre" sortable
                                body={(r) => <span className="font-semibold">{r.nombre}</span>} />
                            <Column field="dia_semana" header="Día"
                                body={(r) => r.dia_semana} />
                            <Column header="Horario"
                                body={(r) => `${r.hora_inicio?.slice(0, 5)} – ${r.hora_fin?.slice(0, 5)}`} />
                            <Column field="genero_musical" header="Género"
                                body={(r) => r.genero_musical ?? '—'} />
                            <Column field="activo" header="Estado" style={{ width: 100 }}
                                body={(r) => (
                                    <Tag value={r.activo !== false ? 'Activo' : 'Inactivo'}
                                        style={{ background: r.activo !== false ? VERDE : '#64748b', fontSize: '0.7rem' }} />
                                )} />
                            <Column header="Acciones" style={{ width: 100 }}
                                body={(r) => (
                                    <div className="flex gap-2">
                                        <Button icon="pi pi-pencil" rounded text size="small"
                                            style={{ color: VERDE }} onClick={() => abrirEditar(r)} />
                                        {esAdmin && (
                                            <Button icon="pi pi-trash" rounded text size="small"
                                                className="p-button-danger" onClick={() => confirmarEliminar(r)} />
                                        )}
                                    </div>
                                )} />
                        </DataTable>
                    </div>
                )}

            <Dialog header={editId ? 'Editar programa' : 'Nuevo programa'}
                visible={dialogo} style={{ width: 520 }}
                onHide={() => setDialogo(false)} modal>
                <div className="pt-2">
                    {campo('nombre', 'Nombre del programa *')}
                    {campo('descripcion', 'Descripción', { textarea: true })}
                    <div className="grid">
                        <div className="col-12 md:col-6">
                            {campo('dia_semana', 'Día de la semana *', { dropdown: true, options: DIAS, placeholder: 'Seleccionar día' })}
                        </div>
                        <div className="col-6 md:col-3">
                            {campo('hora_inicio', 'Inicio *', { dropdown: true, options: HORAS, placeholder: '00:00', filter: true })}
                        </div>
                        <div className="col-6 md:col-3">
                            {campo('hora_fin', 'Fin *', { dropdown: true, options: HORAS, placeholder: '00:00', filter: true })}
                        </div>
                    </div>
                    {campo('genero_musical', 'Género musical', { placeholder: 'Vallenato, Rock...' })}
                    {campo('locutor_id', 'Locutor', { dropdown: true, options: locutores, placeholder: 'Sin asignar', clearable: true })}

                    {/* ── Semana específica ── */}
                    <div className="field mb-3">
                        <label className="block text-900 font-semibold mb-1 text-sm">
                            Semana específica
                            <span className="text-400 font-normal ml-2 text-xs">(dejar vacío = programa recurrente)</span>
                        </label>
                        <Calendar
                            className="w-full"
                            value={form.fecha_semana}
                            onChange={(e) => setForm((f) => ({ ...f, fecha_semana: e.value }))}
                            dateFormat="dd/mm/yy"
                            placeholder="Seleccionar cualquier día de la semana"
                            showButtonBar
                            showIcon
                            locale="es"
                        />
                        {form.fecha_semana && (
                            <small className="text-500 mt-1 block">
                                <i className="pi pi-calendar mr-1" style={{ color: VERDE }} />
                                {labelSemana(form.fecha_semana)}
                            </small>
                        )}
                    </div>

                    <ImageUpload
                        label="Imagen del programa"
                        carpeta="programas"
                        value={form.imagen_url}
                        onUrlChange={(url) => setForm((f) => ({ ...f, imagen_url: url }))}
                    />

                    <div className="flex justify-content-end gap-2 mt-3">
                        <Button label="Cancelar" outlined size="small" onClick={() => setDialogo(false)} />
                        <Button label={editId ? 'Guardar cambios' : 'Crear programa'}
                            size="small" loading={guardando}
                            style={{ background: VERDE, borderColor: VERDE }}
                            onClick={guardar} />
                    </div>
                </div>
            </Dialog>
        </div>
    );
}
