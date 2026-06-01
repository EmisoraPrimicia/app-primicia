/**
 * cloudinaryService — cliente del microservicio POST /cloudinary/upload.
 *
 * Sube un File/Blob a nuestro backend, que lo almacena en Cloudinary
 * y retorna la URL pública. La URL resultante se guarda automáticamente
 * en el campo del formulario que invocó la subida.
 *
 * El servicio usa fetch directamente (multipart/form-data) en lugar del
 * apiClient JSON para poder enviar archivos binarios.
 */

const BASE_URL = `${import.meta.env.VITE_API_URL ?? 'http://localhost:8000'}/api/v1`;

/**
 * Sube una imagen al microservicio Cloudinary.
 *
 * @param {File}   file    - Archivo de imagen seleccionado por el usuario.
 * @param {string} carpeta - Módulo destino: locutores | programas | noticias | eventos | general
 * @returns {Promise<{url: string, public_id: string, formato: string, ancho: number, alto: number, tamano_bytes: number, carpeta: string}>}
 */
async function subirImagen(file, carpeta = 'general') {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No autenticado');

    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(
        `${BASE_URL}/cloudinary/upload?carpeta=${encodeURIComponent(carpeta)}`,
        {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
        }
    );

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
        const mensaje = data?.detail ?? `Error ${res.status}`;
        throw new Error(Array.isArray(mensaje) ? mensaje.map((e) => e.msg).join(', ') : mensaje);
    }

    return data;
}

const cloudinaryService = { subirImagen };
export default cloudinaryService;
