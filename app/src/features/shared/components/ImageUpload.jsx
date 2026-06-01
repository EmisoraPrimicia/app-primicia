/**
 * ImageUpload — Componente reutilizable de subida de imágenes a Cloudinary.
 *
 * Al seleccionar un archivo:
 *   1. Valida MIME y tamaño localmente (mismas reglas que el backend).
 *   2. Llama a cloudinaryService.subirImagen(file, carpeta).
 *   3. Al recibir la URL, la pasa a onUrlChange automáticamente.
 *   4. Muestra preview, estado de carga y errores inline.
 *
 * Props:
 *   value       string   - URL actual (para mostrar preview inicial).
 *   onUrlChange (url) => void  - Callback con la nueva URL de Cloudinary.
 *   carpeta     string   - Módulo destino (locutores | programas | noticias | eventos | general).
 *   label       string   - Etiqueta del campo (default "Imagen").
 *   disabled    bool     - Deshabilita el componente.
 */

import { Button } from 'primereact/button';
import { ProgressBar } from 'primereact/progressbar';
import React, { useRef, useState } from 'react';
import cloudinaryService from '../services/cloudinaryService';

const VERDE    = '#3a7d1e';
const MIME_OK  = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_MB   = 5;
const MAX_BYTES = MAX_MB * 1024 * 1024;

export default function ImageUpload({
    value       = '',
    onUrlChange,
    carpeta     = 'general',
    label       = 'Imagen',
    disabled    = false,
}) {
    const inputRef            = useRef(null);
    const [subiendo, setSubiendo] = useState(false);
    const [error,    setError]    = useState('');
    const [preview,  setPreview]  = useState(value || '');

    /* Sincroniza preview cuando el padre cambia value (p.ej. al abrir editar) */
    React.useEffect(() => { setPreview(value || ''); }, [value]);

    const abrirSelector = () => {
        if (disabled || subiendo) return;
        setError('');
        inputRef.current?.click();
    };

    const onFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        e.target.value = '';          // reset para poder subir el mismo archivo otra vez

        /* Validación local */
        if (!MIME_OK.includes(file.type)) {
            setError(`Formato no permitido. Use: JPG, PNG, WebP o GIF.`);
            return;
        }
        if (file.size > MAX_BYTES) {
            setError(`La imagen supera ${MAX_MB} MB (${(file.size / 1024 / 1024).toFixed(1)} MB).`);
            return;
        }

        /* Preview inmediato con URL temporal */
        const localUrl = URL.createObjectURL(file);
        setPreview(localUrl);
        setSubiendo(true);
        setError('');

        try {
            const res = await cloudinaryService.subirImagen(file, carpeta);
            URL.revokeObjectURL(localUrl);
            setPreview(res.url);
            onUrlChange?.(res.url);
        } catch (err) {
            URL.revokeObjectURL(localUrl);
            setPreview(value || '');  // volver a la imagen anterior
            setError(err.message ?? 'Error al subir la imagen.');
        } finally {
            setSubiendo(false);
        }
    };

    return (
        <div className="field mb-3">
            <label className="block text-900 font-semibold mb-1 text-sm">{label}</label>

            {/* Preview */}
            {preview ? (
                <div className="relative mb-2 border-round-lg overflow-hidden"
                    style={{ width: '100%', maxWidth: 240, height: 140, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <img
                        src={preview}
                        alt="preview"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={() => setPreview('')}
                    />
                    {!disabled && (
                        <button
                            type="button"
                            className="absolute"
                            style={{
                                top: 4, right: 4, width: 24, height: 24, borderRadius: '50%',
                                background: 'rgba(0,0,0,0.5)', border: 'none', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}
                            onClick={() => { setPreview(''); onUrlChange?.(''); }}
                        >
                            <i className="pi pi-times text-white" style={{ fontSize: '0.65rem' }} />
                        </button>
                    )}
                </div>
            ) : (
                <div className="mb-2 border-round-lg flex align-items-center justify-content-center"
                    style={{ width: '100%', maxWidth: 240, height: 100, background: '#f8fafc', border: '2px dashed #e2e8f0' }}>
                    <i className="pi pi-image text-300" style={{ fontSize: '2rem' }} />
                </div>
            )}

            {/* Barra de progreso durante la subida */}
            {subiendo && (
                <div className="mb-2" style={{ maxWidth: 240 }}>
                    <ProgressBar mode="indeterminate" style={{ height: 4 }} />
                    <p className="text-xs text-500 m-0 mt-1">Subiendo a Cloudinary...</p>
                </div>
            )}

            {/* Mensaje de error */}
            {error && (
                <p className="text-xs m-0 mb-2" style={{ color: '#ef4444' }}>
                    <i className="pi pi-exclamation-triangle mr-1" />{error}
                </p>
            )}

            {/* Botón de selección */}
            {!disabled && (
                <Button
                    type="button"
                    label={preview ? 'Cambiar imagen' : 'Subir imagen'}
                    icon={subiendo ? 'pi pi-spin pi-spinner' : 'pi pi-upload'}
                    size="small"
                    outlined
                    disabled={subiendo}
                    style={{ borderColor: VERDE, color: VERDE }}
                    onClick={abrirSelector}
                />
            )}

            {/* Input file oculto */}
            <input
                ref={inputRef}
                type="file"
                accept={MIME_OK.join(',')}
                style={{ display: 'none' }}
                onChange={onFileChange}
            />
        </div>
    );
}
