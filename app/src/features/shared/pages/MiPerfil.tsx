// import { useEffect, useRef, useState } from 'react';
// import { Avatar } from 'primereact/avatar';
// import { Button } from 'primereact/button';
// import { Card } from 'primereact/card';
// import { Divider } from 'primereact/divider';
// import { InputText } from 'primereact/inputtext';
// import { Message } from 'primereact/message';
// import { Password } from 'primereact/password';
// import { Toast } from 'primereact/toast';

// const PERSONA_KEY = 'persona';

// const actualizarPersonaEnSesion = (cambios: Record<string, string>) => {
//   const raw = sessionStorage.getItem(PERSONA_KEY);
//   if (!raw) return;
//   try {
//     const persona = JSON.parse(raw);
//     sessionStorage.setItem(PERSONA_KEY, JSON.stringify({ ...persona, ...cambios }));
//   } catch {
//     // ignorar
//   }
// };

// interface FormDatos {
//   nombres: string;
//   apellidos: string;
//   correo: string;
//   telefono: string;
//   identificacion: string;
// }

// interface FormPassword {
//   passwordActual: string;
//   nuevaPassword: string;
//   confirmar: string;
// }

// export default function MiPerfil() {
//   const toast = useRef<Toast>(null);
//   const persona = obtenerPersona();

//   const [datos, setDatos] = useState<FormDatos>({
//     nombres: '',
//     apellidos: '',
//     correo: '',
//     telefono: '',
//     identificacion: '',
//   });
//   const [cargando, setCargando] = useState(true);
//   const [guardandoDatos, setGuardandoDatos] = useState(false);
//   const [errorDatos, setErrorDatos] = useState<string | null>(null);

//   const [pwd, setPwd] = useState<FormPassword>({
//     passwordActual: '',
//     nuevaPassword: '',
//     confirmar: '',
//   });
//   const [guardandoPwd, setGuardandoPwd] = useState(false);
//   const [errorPwd, setErrorPwd] = useState<string | null>(null);
//   const [exitoPwd, setExitoPwd] = useState(false);

//   useEffect(() => {
//     if (!persona?.id) return;
//     cargarPerfil();
//   }, []);

//   const cargarPerfil = async () => {
//     if (!persona?.id) return;
//     setCargando(true);
//     try {
//       const p = await personaService.obtener(persona.id);
//       setDatos({
//         nombres: p.nombres ?? '',
//         apellidos: p.apellidos ?? '',
//         correo: p.correo ?? '',
//         telefono: p.telefono ?? '',
//         identificacion: p.identificacion ?? '',
//       });
//     } catch {
//       setDatos({
//         nombres: persona.nombres ?? '',
//         apellidos: persona.apellidos ?? '',
//         correo: persona.correo ?? '',
//         telefono: persona.telefono ?? '',
//         identificacion: persona.identificacion ?? '',
//       });
//     } finally {
//       setCargando(false);
//     }
//   };

//   const handleGuardarDatos = async () => {
//     if (!persona?.id) return;
//     setErrorDatos(null);
//     if (!datos.nombres.trim() || !datos.apellidos.trim()) {
//       setErrorDatos('El nombre y apellido son obligatorios.');
//       return;
//     }
//     setGuardandoDatos(true);
//     try {
//       await personaService.actualizar(persona.id, {
//         nombres: datos.nombres.trim(),
//         apellidos: datos.apellidos.trim(),
//         correo: datos.correo.trim(),
//         telefono: datos.telefono.trim(),
//         identificacion: datos.identificacion.trim(),
//       });
//       actualizarPersonaEnSesion({
//         nombres: datos.nombres.trim(),
//         apellidos: datos.apellidos.trim(),
//         correo: datos.correo.trim(),
//         telefono: datos.telefono.trim(),
//         identificacion: datos.identificacion.trim(),
//       });
//       toast.current?.show({
//         severity: 'success',
//         summary: 'Perfil actualizado',
//         detail: 'Tus datos han sido guardados correctamente.',
//         life: 3000,
//       });
//     } catch (err) {
//       const mensaje = err instanceof Error ? err.message : 'No se pudo actualizar el perfil.';
//       setErrorDatos(mensaje);
//     } finally {
//       setGuardandoDatos(false);
//     }
//   };

//   const handleCambiarPassword = async () => {
//     setErrorPwd(null);
//     setExitoPwd(false);
//     if (!pwd.passwordActual || !pwd.nuevaPassword || !pwd.confirmar) {
//       setErrorPwd('Completa todos los campos.');
//       return;
//     }
//     if (pwd.nuevaPassword !== pwd.confirmar) {
//       setErrorPwd('Las contraseñas nuevas no coinciden.');
//       return;
//     }
//     if (pwd.nuevaPassword.length < 8) {
//       setErrorPwd('La nueva contraseña debe tener al menos 8 caracteres.');
//       return;
//     }
//     setGuardandoPwd(true);
//     try {
//       await cambiarPasswordAutenticado({
//         password_actual: pwd.passwordActual,
//         nueva_password: pwd.nuevaPassword,
//       });
//       setExitoPwd(true);
//       setPwd({ passwordActual: '', nuevaPassword: '', confirmar: '' });
//     } catch (err) {
//       const mensaje = err instanceof Error ? err.message : 'No se pudo cambiar la contraseña.';
//       setErrorPwd(mensaje);
//     } finally {
//       setGuardandoPwd(false);
//     }
//   };

//   if (!persona) return null;

//   const iniciales = `${persona.nombres?.[0] ?? ''}${persona.apellidos?.[0] ?? ''}`.toUpperCase();

//   return (
//     <div className="p-4 md:p-5">
//       <Toast ref={toast} />

//       {/* Contenido lado a lado */}
//       <div className="flex gap-4 align-items-start" style={{ flexWrap: 'wrap' }}>
//         {/* Datos personales — crece */}
//         <div style={{ flex: '1 1 400px', minWidth: 0 }}>
//           <Card className="shadow-2 border-round-xl">
//             <div className="flex align-items-center gap-3 mb-1">
//               <Avatar
//                 label={iniciales}
//                 shape="circle"
//                 className="font-bold text-white flex-shrink-0"
//                 style={{ width: '3rem', height: '3rem', fontSize: '1rem', background: 'var(--primary-500)' }}
//               />
//               <span className="text-lg font-bold text-900">Datos personales</span>
//             </div>
//             <Divider className="mt-2 mb-4" />

//             {cargando ? (
//               <div className="flex justify-content-center py-6">
//                 <i className="pi pi-spin pi-spinner text-3xl text-primary" />
//               </div>
//             ) : (
//               <div className="flex flex-wrap gap-3">
//                 <div className="flex flex-column gap-2" style={{ flex: '1 1 180px' }}>
//                   <label className="text-sm font-semibold text-600">Nombres</label>
//                   <InputText
//                     value={datos.nombres}
//                     onChange={(e) => setDatos({ ...datos, nombres: e.target.value })}
//                     placeholder="Nombres"
//                     className="w-full"
//                   />
//                 </div>
//                 <div className="flex flex-column gap-2" style={{ flex: '1 1 180px' }}>
//                   <label className="text-sm font-semibold text-600">Apellidos</label>
//                   <InputText
//                     value={datos.apellidos}
//                     onChange={(e) => setDatos({ ...datos, apellidos: e.target.value })}
//                     placeholder="Apellidos"
//                     className="w-full"
//                   />
//                 </div>
//                 <div className="flex flex-column gap-2" style={{ flex: '1 1 180px' }}>
//                   <label className="text-sm font-semibold text-600">Correo electrónico</label>
//                   <InputText
//                     value={datos.correo}
//                     onChange={(e) => setDatos({ ...datos, correo: e.target.value })}
//                     placeholder="correo@ejemplo.com"
//                     keyfilter="email"
//                     className="w-full"
//                   />
//                 </div>
//                 <div className="flex flex-column gap-2" style={{ flex: '1 1 180px' }}>
//                   <label className="text-sm font-semibold text-600">Teléfono</label>
//                   <InputText
//                     value={datos.telefono}
//                     onChange={(e) => setDatos({ ...datos, telefono: e.target.value })}
//                     placeholder="Teléfono"
//                     className="w-full"
//                   />
//                 </div>
//                 <div className="flex flex-column gap-2 w-full">
//                   <label className="text-sm font-semibold text-600">Identificación</label>
//                   <InputText
//                     value={datos.identificacion}
//                     onChange={(e) => setDatos({ ...datos, identificacion: e.target.value })}
//                     placeholder="Número de identificación"
//                     className="w-full"
//                   />
//                 </div>
//               </div>
//             )}

//             {errorDatos && (
//               <Message severity="error" text={errorDatos} className="w-full mb-3" />
//             )}

//             <div className="flex justify-content-end mt-3">
//               <Button
//                 label="Guardar cambios"
//                 icon="pi pi-check"
//                 onClick={handleGuardarDatos}
//                 loading={guardandoDatos}
//                 disabled={cargando}
//               />
//             </div>
//           </Card>
//         </div>

//         {/* Cambiar contraseña — ancho fijo */}
//         <div style={{ flex: '0 0 360px' }}>
//           <Card className="shadow-2 border-round-xl">
//             <div className="flex align-items-center gap-2 mb-1">
//               <i className="pi pi-lock text-primary text-lg" />
//               <span className="text-lg font-bold text-900">Cambiar contraseña</span>
//             </div>
//             <Divider className="mt-2 mb-4" />

//             <div className="flex flex-column gap-4">
//               <div className="flex flex-column gap-2">
//                 <label className="text-sm font-semibold text-600">Contraseña actual</label>
//                 <Password
//                   value={pwd.passwordActual}
//                   onChange={(e) => setPwd({ ...pwd, passwordActual: e.target.value })}
//                   feedback={false}
//                   toggleMask
//                   placeholder="Contraseña actual"
//                   inputClassName="w-full"
//                   className="w-full"
//                 />
//               </div>
//               <div className="flex flex-column gap-2">
//                 <label className="text-sm font-semibold text-600">Nueva contraseña</label>
//                 <Password
//                   value={pwd.nuevaPassword}
//                   onChange={(e) => setPwd({ ...pwd, nuevaPassword: e.target.value })}
//                   toggleMask
//                   placeholder="Mínimo 8 caracteres"
//                   inputClassName="w-full"
//                   className="w-full"
//                 />
//               </div>
//               <div className="flex flex-column gap-2">
//                 <label className="text-sm font-semibold text-600">Confirmar nueva contraseña</label>
//                 <Password
//                   value={pwd.confirmar}
//                   onChange={(e) => setPwd({ ...pwd, confirmar: e.target.value })}
//                   feedback={false}
//                   toggleMask
//                   placeholder="Repite la nueva contraseña"
//                   inputClassName="w-full"
//                   className="w-full"
//                 />
//               </div>

//               {errorPwd && (
//                 <Message severity="error" text={errorPwd} className="w-full" />
//               )}
//               {exitoPwd && (
//                 <Message severity="success" text="Contraseña cambiada correctamente." className="w-full" />
//               )}

//               <div className="flex justify-content-end">
//                 <Button
//                   label="Cambiar contraseña"
//                   icon="pi pi-lock"
//                   onClick={handleCambiarPassword}
//                   loading={guardandoPwd}
//                 />
//               </div>
//             </div>
//           </Card>
//         </div>
//       </div>
//     </div>
//   );
// }
