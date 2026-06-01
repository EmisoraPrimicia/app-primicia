import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import ImageUpload from '../../shared/components/ImageUpload';
import locutoresService from '../services/locutoresService';

const VERDE    = '#3a7d1e';
const AMARILLO = '#f5c518';

const VACIO = { nombre: '', apellido: '', email: '', telefono: '', foto_url: '', biografia: '' };

export default function Locutores() {
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

    const cargar = useCallback(async (pag = pagina) => {
        setCargando(true);
        try {
            const res = await locutoresService.listar(pag, tamano);
            setLista(res.data ?? []);
            setTotal(res.total ?? 0);
        } catch (e) {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: e.message });
        } finally {
            setCargando(false);
        }
    }, [pagina]);

    useEffect(() => { cargar(); }, [cargar]);

    const ok = (detail) => toast.current?.show({ severity: 'success', summary: 'Listo', detail });
    const err = (e)    => toast.current?.show({ severity: 'error',   summary: 'Error', detail: e.message });

    const abrirNuevo = () => { setForm(VACIO); setEditId(null); setDialogo(true); };
    const abrirEditar = (row) => {
        setForm({
            nombre:    row.nombre    ?? '',
            apellido:  row.apellido  ?? '',
            email:     row.email     ?? '',
            telefono:  row.telefono  ?? '',
            foto_url:  row.foto_url  ?? '',
            biografia: row.biografia ?? '',
        });
        setEditId(row.id);
        setDialogo(true);
    };

    const guardar = async () => {
        if (!form.nombre.trim() || !form.apellido.trim()) {
            toast.current?.show({ severity: 'warn', summary: 'Requerido', detail: 'Nombre y apellido son obligatorios' });
            return;
        }
        setGuardando(true);
        try {
            const payload = {
                nombre:    form.nombre.trim(),
                apellido:  form.apellido.trim(),
                email:     form.email     || undefined,
                telefono:  form.telefono  || undefined,
                foto_url:  form.foto_url  || undefined,
                biografia: form.biografia || undefined,
            };
            if (editId) {
                await locutoresService.actualizar(editId, payload);
                ok('Locutor actualizado');
            } else {
                await locutoresService.crear(payload);
                ok('Locutor creado');
            }
            setDialogo(false);
            cargar();
        } catch (e) { err(e); } finally { setGuardando(false); }
    };

    const confirmarEliminar = (row) => {
        confirmDialog({
            message:  `¿Eliminar a ${row.nombre_completo ?? row.nombre}?`,
            header:   'Confirmar eliminación',
            icon:     'pi pi-exclamation-triangle',
            acceptLabel: 'Eliminar',
            rejectLabel: 'Cancelar',
            acceptClassName: 'p-button-danger',
            accept: async () => {
                try {
                    await locutoresService.eliminar(row.id);
                    ok('Locutor eliminado');
                    cargar();
                } catch (e) { err(e); }
            },
        });
    };

    const toggleActivo = async (row) => {
        try {
            await locutoresService.toggleActivo(row.id);
            ok(`Locutor ${row.activo ? 'desactivado' : 'activado'}`);
            cargar();
        } catch (e) { err(e); }
    };

    const campo = (key, label, opts = {}) => (
        <div className="field mb-3">
            <label className="block text-900 font-semibold mb-1 text-sm">{label}</label>
            {opts.textarea
                ? <InputTextarea rows={3} className="w-full" value={form[key]}
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
                    <h1 className="text-900 font-bold m-0 mb-1" style={{ fontSize: '1.75rem' }}>Locutores</h1>
                    <p className="text-500 m-0 text-sm">Gestión de locutores de la emisora</p>
                </div>
                <Button label="Nuevo locutor" icon="pi pi-plus" size="small"
                    style={{ background: VERDE, borderColor: VERDE }} onClick={abrirNuevo} />
            </div>

            <div className="card shadow-1 border-round-xl">
                <DataTable
                    value={lista}
                    loading={cargando}
                    paginator
                    rows={tamano}
                    totalRecords={total}
                    lazy
                    first={(pagina - 1) * tamano}
                    onPage={(e) => { setPagina(e.page + 1); cargar(e.page + 1); }}
                    emptyMessage="Sin locutores registrados"
                    rowHover
                    stripedRows
                >
                    <Column field="nombre_completo" header="Nombre" sortable
                        body={(r) => <span className="font-semibold">{r.nombre_completo ?? `${r.nombre} ${r.apellido}`}</span>} />
                    <Column field="email"    header="Email"    body={(r) => r.email    ?? '—'} />
                    <Column field="telefono" header="Teléfono" body={(r) => r.telefono ?? '—'} />
                    <Column field="activo" header="Estado" style={{ width: 110 }}
                        body={(r) => (
                            <Tag value={r.activo ? 'Activo' : 'Inactivo'}
                                style={{ background: r.activo ? VERDE : '#64748b', fontSize: '0.7rem' }} />
                        )} />
                    <Column header="Acciones" style={{ width: 140 }}
                        body={(r) => (
                            <div className="flex gap-2">
                                <Button icon="pi pi-pencil" rounded text size="small"
                                    style={{ color: VERDE }} onClick={() => abrirEditar(r)} />
                                <Button icon={r.activo ? 'pi pi-ban' : 'pi pi-check'} rounded text size="small"
                                    style={{ color: AMARILLO }} tooltip={r.activo ? 'Desactivar' : 'Activar'}
                                    onClick={() => toggleActivo(r)} />
                                <Button icon="pi pi-trash" rounded text size="small"
                                    className="p-button-danger" onClick={() => confirmarEliminar(r)} />
                            </div>
                        )} />
                </DataTable>
            </div>

            <Dialog header={editId ? 'Editar locutor' : 'Nuevo locutor'}
                visible={dialogo} style={{ width: 480 }}
                onHide={() => setDialogo(false)} modal>
                <div className="pt-2">
                    <div className="grid">
                        <div className="col-6">{campo('nombre',   'Nombre *')}</div>
                        <div className="col-6">{campo('apellido', 'Apellido *')}</div>
                    </div>
                    {campo('email',    'Correo electrónico', { placeholder: 'locutor@emisora.com' })}
                    {campo('telefono', 'Teléfono',           { placeholder: '+57 300...' })}
                    <ImageUpload
                        label="Foto de perfil"
                        carpeta="locutores"
                        value={form.foto_url}
                        onUrlChange={(url) => setForm((f) => ({ ...f, foto_url: url }))}
                    />
                    {campo('biografia','Biografía',          { textarea: true })}

                    <div className="flex justify-content-end gap-2 mt-3">
                        <Button label="Cancelar" outlined size="small" onClick={() => setDialogo(false)} />
                        <Button label={editId ? 'Guardar cambios' : 'Crear locutor'}
                            size="small" loading={guardando}
                            style={{ background: VERDE, borderColor: VERDE }}
                            onClick={guardar} />
                    </div>
                </div>
            </Dialog>
        </div>
    );
}
