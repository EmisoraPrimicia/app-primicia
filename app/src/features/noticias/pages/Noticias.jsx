import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
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
import noticiasService from '../services/noticiasService';

const VERDE    = '#3a7d1e';
const AMARILLO = '#f5c518';

const CATEGORIAS = [
    { label: 'Local',           value: 'Local' },
    { label: 'Nacional',        value: 'Nacional' },
    { label: 'Deportes',        value: 'Deportes' },
    { label: 'Cultura',         value: 'Cultura' },
    { label: 'Política',        value: 'Política' },
    { label: 'Entretenimiento', value: 'Entretenimiento' },
];

const VACIO = {
    titulo: '', resumen: '', contenido: '',
    imagen_portada_url: '', categoria: 'Local',
    destacada: false,
};

const formatFecha = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('es-CO', {
        day: '2-digit', month: 'short', year: 'numeric',
    });
};

export default function Noticias() {
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
            const res = await noticiasService.listar(pag, tamano);
            setLista(res.data ?? []);
            setTotal(res.total ?? 0);
        } catch (e) { err(e); } finally { setCargando(false); }
    }, [pagina]);

    useEffect(() => { cargar(); }, [cargar]);

    const abrirNuevo  = () => { setForm(VACIO); setEditId(null); setDialogo(true); };
    const abrirEditar = (r) => {
        setForm({
            titulo:             r.titulo             ?? '',
            resumen:            r.resumen            ?? '',
            contenido:          r.contenido          ?? '',
            imagen_portada_url: r.imagen_portada_url ?? '',
            categoria:          r.categoria          ?? 'Local',
            destacada:          r.destacada          ?? false,
        });
        setEditId(r.id);
        setDialogo(true);
    };

    const guardar = async () => {
        if (!form.titulo.trim() || !form.contenido.trim()) {
            toast.current?.show({ severity: 'warn', summary: 'Requerido', detail: 'Título y contenido son obligatorios' });
            return;
        }
        setGuardando(true);
        try {
            const payload = {
                titulo:             form.titulo.trim(),
                resumen:            form.resumen            || undefined,
                contenido:          form.contenido,
                imagen_portada_url: form.imagen_portada_url || undefined,
                categoria:          form.categoria ?? 'Local',
                destacada:          form.destacada,
            };
            if (editId) {
                await noticiasService.actualizar(editId, payload);
                ok('Noticia actualizada');
            } else {
                await noticiasService.crear(payload);
                ok('Noticia creada');
            }
            setDialogo(false);
            cargar();
        } catch (e) { err(e); } finally { setGuardando(false); }
    };

    const togglePublicar = async (r) => {
        try {
            if (r.publicada) {
                await noticiasService.actualizar(r.id, { publicada: false });
                ok('Noticia despublicada');
            } else {
                await noticiasService.publicar(r.id);
                ok('Noticia publicada');
            }
            cargar();
        } catch (e) { err(e); }
    };

    const confirmarEliminar = (r) => {
        confirmDialog({
            message:  `¿Eliminar la noticia "${r.titulo}"?`,
            header:   'Confirmar eliminación',
            icon:     'pi pi-exclamation-triangle',
            acceptLabel: 'Eliminar',
            rejectLabel: 'Cancelar',
            acceptClassName: 'p-button-danger',
            accept: async () => {
                try {
                    await noticiasService.eliminar(r.id);
                    ok('Noticia eliminada');
                    cargar();
                } catch (e) { err(e); }
            },
        });
    };

    return (
        <div className="p-4">
            <Toast ref={toast} />
            <ConfirmDialog />

            <div className="flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
                <div>
                    <h1 className="text-900 font-bold m-0 mb-1" style={{ fontSize: '1.75rem' }}>Noticias</h1>
                    <p className="text-500 m-0 text-sm">Gestión de noticias y publicaciones</p>
                </div>
                <Button label="Nueva noticia" icon="pi pi-plus" size="small"
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
                    emptyMessage="Sin noticias registradas"
                    rowHover stripedRows
                >
                    <Column field="titulo" header="Título" sortable
                        body={(r) => (
                            <div>
                                <p className="m-0 font-semibold text-900 white-space-nowrap overflow-hidden text-overflow-ellipsis" style={{ maxWidth: 280 }}>{r.titulo}</p>
                                {r.resumen && <p className="m-0 text-400 text-xs white-space-nowrap overflow-hidden text-overflow-ellipsis" style={{ maxWidth: 280 }}>{r.resumen}</p>}
                            </div>
                        )} />
                    <Column field="categoria" header="Categoría" style={{ width: 130 }}
                        body={(r) => {
                            const cat = CATEGORIAS.find((c) => c.value === r.categoria);
                            return <Tag value={cat?.label ?? r.categoria}
                                style={{ background: '#eff6ff', color: '#3b82f6', fontSize: '0.7rem' }} />;
                        }} />
                    <Column header="Fecha" style={{ width: 120 }}
                        body={(r) => formatFecha(r.fecha_publicacion ?? r.creado_en)} />
                    <Column field="destacada" header="Destacada" style={{ width: 95 }}
                        body={(r) => r.destacada
                            ? <i className="pi pi-star-fill" style={{ color: AMARILLO }} />
                            : <i className="pi pi-star text-300" />} />
                    <Column field="publicada" header="Estado" style={{ width: 105 }}
                        body={(r) => (
                            <Tag value={r.publicada ? 'Publicada' : 'Borrador'}
                                style={{ background: r.publicada ? VERDE : '#94a3b8', fontSize: '0.7rem' }} />
                        )} />
                    <Column header="Acciones" style={{ width: 140 }}
                        body={(r) => (
                            <div className="flex gap-2">
                                <Button icon="pi pi-pencil" rounded text size="small"
                                    style={{ color: VERDE }} onClick={() => abrirEditar(r)} />
                                <Button
                                    icon={r.publicada ? 'pi pi-eye-slash' : 'pi pi-send'}
                                    rounded text size="small"
                                    style={{ color: AMARILLO }}
                                    tooltip={r.publicada ? 'Despublicar' : 'Publicar'}
                                    onClick={() => togglePublicar(r)} />
                                <Button icon="pi pi-trash" rounded text size="small"
                                    className="p-button-danger" onClick={() => confirmarEliminar(r)} />
                            </div>
                        )} />
                </DataTable>
            </div>

            <Dialog header={editId ? 'Editar noticia' : 'Nueva noticia'}
                visible={dialogo} style={{ width: 600 }}
                onHide={() => setDialogo(false)} modal>
                <div className="pt-2">
                    <div className="field mb-3">
                        <label className="block text-900 font-semibold mb-1 text-sm">Título *</label>
                        <InputText className="w-full" value={form.titulo}
                            onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))} />
                    </div>
                    <div className="field mb-3">
                        <label className="block text-900 font-semibold mb-1 text-sm">Resumen</label>
                        <InputTextarea rows={2} className="w-full" autoResize value={form.resumen}
                            onChange={(e) => setForm((f) => ({ ...f, resumen: e.target.value }))} />
                    </div>
                    <div className="field mb-3">
                        <label className="block text-900 font-semibold mb-1 text-sm">Contenido *</label>
                        <InputTextarea rows={6} className="w-full" autoResize value={form.contenido}
                            onChange={(e) => setForm((f) => ({ ...f, contenido: e.target.value }))} />
                    </div>
                    <div className="grid">
                        <div className="col-12 md:col-6">
                            <div className="field mb-3">
                                <label className="block text-900 font-semibold mb-1 text-sm">Categoría</label>
                                <Dropdown className="w-full" value={form.categoria} options={CATEGORIAS}
                                    onChange={(e) => setForm((f) => ({ ...f, categoria: e.value }))} />
                            </div>
                        </div>
                        <div className="col-12 md:col-6">
                            <ImageUpload
                                label="Imagen portada"
                                carpeta="noticias"
                                value={form.imagen_portada_url}
                                onUrlChange={(url) => setForm((f) => ({ ...f, imagen_portada_url: url }))}
                            />
                        </div>
                    </div>
                    <div className="flex align-items-center gap-2 mb-3">
                        <InputSwitch checked={form.destacada}
                            onChange={(e) => setForm((f) => ({ ...f, destacada: e.value }))} />
                        <label className="text-sm font-semibold">Marcar como destacada</label>
                    </div>

                    <div className="flex justify-content-end gap-2 mt-3">
                        <Button label="Cancelar" outlined size="small" onClick={() => setDialogo(false)} />
                        <Button label={editId ? 'Guardar cambios' : 'Crear noticia'}
                            size="small" loading={guardando}
                            style={{ background: VERDE, borderColor: VERDE }}
                            onClick={guardar} />
                    </div>
                </div>
            </Dialog>
        </div>
    );
}
