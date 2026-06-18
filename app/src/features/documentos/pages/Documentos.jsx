import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { ProgressBar } from 'primereact/progressbar';
import { Toast } from 'primereact/toast';
import documentosService from '../services/documentosService';

const VERDE = '#3a7d1e';

const formatFecha = (iso) =>
    new Date(iso).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });

export default function Documentos() {
    const toast    = useRef(null);
    const fileRef  = useRef(null);

    const [lista,     setLista]     = useState([]);
    const [total,     setTotal]     = useState(0);
    const [pagina,    setPagina]    = useState(1);
    const [cargando,  setCargando]  = useState(false);
    const [dialogo,   setDialogo]   = useState(false);
    const [titulo,    setTitulo]    = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [archivo,   setArchivo]   = useState(null);
    const [subiendo,  setSubiendo]  = useState(false);
    const tamano = 20;

    const ok  = (d) => toast.current?.show({ severity: 'success', summary: 'Listo',  detail: d });
    const err = (e) => toast.current?.show({ severity: 'error',   summary: 'Error',  detail: e.message });

    const cargar = useCallback(async (pag = pagina) => {
        setCargando(true);
        try {
            const res = await documentosService.listarAdmin(pag, tamano);
            setLista(res.data ?? []);
            setTotal(res.total ?? 0);
        } catch (e) { err(e); } finally { setCargando(false); }
    }, [pagina]);

    useEffect(() => { cargar(); }, [cargar]);

    const abrirNuevo = () => {
        setTitulo('');
        setDescripcion('');
        setArchivo(null);
        if (fileRef.current) fileRef.current.value = '';
        setDialogo(true);
    };

    const onFileChange = (e) => {
        const f = e.target.files?.[0];
        if (!f) return;
        if (f.type !== 'application/pdf') {
            err({ message: 'Solo se permiten archivos PDF' });
            e.target.value = '';
            return;
        }
        if (f.size > 20 * 1024 * 1024) {
            err({ message: 'El archivo supera 20 MB' });
            e.target.value = '';
            return;
        }
        setArchivo(f);
    };

    const guardar = async () => {
        if (!titulo.trim()) {
            toast.current?.show({ severity: 'warn', summary: 'Requerido', detail: 'El título es obligatorio' });
            return;
        }
        if (!archivo) {
            toast.current?.show({ severity: 'warn', summary: 'Requerido', detail: 'Selecciona un archivo PDF' });
            return;
        }
        setSubiendo(true);
        try {
            await documentosService.subir(titulo.trim(), descripcion || undefined, archivo);
            ok('Documento subido correctamente');
            setDialogo(false);
            cargar();
        } catch (e) { err(e); } finally { setSubiendo(false); }
    };

    const confirmarEliminar = (doc) => {
        confirmDialog({
            message:     `¿Eliminar "${doc.titulo}"?`,
            header:      'Confirmar eliminación',
            icon:        'pi pi-exclamation-triangle',
            acceptLabel: 'Eliminar',
            rejectLabel: 'Cancelar',
            acceptClassName: 'p-button-danger',
            accept: async () => {
                try {
                    await documentosService.eliminar(doc.id);
                    ok('Documento eliminado');
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
                    <h1 className="text-900 font-bold m-0 mb-1" style={{ fontSize: '1.75rem' }}>Documentos</h1>
                    <p className="text-500 m-0 text-sm">PDF publicados en el sitio público</p>
                </div>
                <Button label="Subir PDF" icon="pi pi-upload" size="small"
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
                    emptyMessage="Sin documentos subidos"
                    rowHover stripedRows
                >
                    <Column field="titulo" header="Título" sortable
                        body={(r) => <span className="font-semibold">{r.titulo}</span>} />
                    <Column field="descripcion" header="Descripción"
                        body={(r) => r.descripcion ?? '—'} />
                    <Column field="nombre_archivo" header="Archivo"
                        body={(r) => (
                            <span className="text-sm text-500">
                                <i className="pi pi-paperclip mr-1" />{r.nombre_archivo ?? '—'}
                            </span>
                        )} />
                    <Column field="creado_en" header="Fecha" style={{ width: 130 }}
                        body={(r) => formatFecha(r.creado_en)} />
                    <Column header="Acciones" style={{ width: 110 }}
                        body={(r) => (
                            <div className="flex gap-2">
                                <Button icon="pi pi-external-link" rounded text size="small"
                                    style={{ color: VERDE }}
                                    tooltip="Ver PDF" tooltipOptions={{ position: 'top' }}
                                    onClick={() => window.open(r.archivo_url, '_blank')} />
                                <Button icon="pi pi-trash" rounded text size="small"
                                    className="p-button-danger"
                                    tooltip="Eliminar" tooltipOptions={{ position: 'top' }}
                                    onClick={() => confirmarEliminar(r)} />
                            </div>
                        )} />
                </DataTable>
            </div>

            <Dialog header="Subir nuevo PDF"
                visible={dialogo} style={{ width: 500 }}
                onHide={() => setDialogo(false)} modal>
                <div className="pt-2 flex flex-column gap-3">
                    <div className="field">
                        <label className="block text-900 font-semibold mb-1 text-sm">Título *</label>
                        <InputText className="w-full" value={titulo}
                            onChange={(e) => setTitulo(e.target.value)}
                            placeholder="Ej: Resolución N° 001 de 2026" />
                    </div>
                    <div className="field">
                        <label className="block text-900 font-semibold mb-1 text-sm">Descripción</label>
                        <InputTextarea rows={2} className="w-full" autoResize
                            value={descripcion} onChange={(e) => setDescripcion(e.target.value)}
                            placeholder="Descripción breve del documento..." />
                    </div>
                    <div className="field">
                        <label className="block text-900 font-semibold mb-1 text-sm">Archivo PDF *</label>
                        <div className="flex align-items-center gap-3">
                            <Button type="button" label="Seleccionar PDF" icon="pi pi-file-pdf"
                                outlined size="small"
                                style={{ borderColor: VERDE, color: VERDE }}
                                onClick={() => fileRef.current?.click()} />
                            {archivo && (
                                <span className="text-sm text-600">
                                    <i className="pi pi-check-circle mr-1" style={{ color: VERDE }} />
                                    {archivo.name}
                                </span>
                            )}
                        </div>
                        <input ref={fileRef} type="file" accept="application/pdf"
                            style={{ display: 'none' }} onChange={onFileChange} />
                        {subiendo && (
                            <div className="mt-2">
                                <ProgressBar mode="indeterminate" style={{ height: 4 }} />
                                <p className="text-xs text-500 m-0 mt-1">Subiendo a Cloudinary...</p>
                            </div>
                        )}
                    </div>
                    <div className="flex justify-content-end gap-2 mt-2">
                        <Button label="Cancelar" outlined size="small" onClick={() => setDialogo(false)} />
                        <Button label="Subir documento" icon="pi pi-upload" size="small"
                            loading={subiendo}
                            style={{ background: VERDE, borderColor: VERDE }}
                            onClick={guardar} />
                    </div>
                </div>
            </Dialog>
        </div>
    );
}
