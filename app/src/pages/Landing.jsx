import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Ripple } from 'primereact/ripple';
import { Divider } from 'primereact/divider';
import { Tag } from 'primereact/tag';
import { Slider } from 'primereact/slider';
import { Skeleton } from 'primereact/skeleton';

/* ── Colores de marca ─────────────────────────────────────────────── */
const VERDE       = '#3a7d1e';
const VERDE_CLARO = '#4e9e28';
const AMARILLO    = '#f5c518';
const BASE_URL    = `${import.meta.env.VITE_API_URL ?? 'http://localhost:8000'}/api/v1`;

/* Fetch público sin interceptor de redireccion */
async function apiFetch(path) {
    const headers = { 'Content-Type': 'application/json' };
    const token = localStorage.getItem('token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${BASE_URL}${path}`, { headers });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
}

/* Día de la semana actual en español (igual al enum del backend) */
const DIAS_ES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const diaHoy  = () => DIAS_ES[new Date().getDay()];

/* Icono/color según género musical */
const generoEstilo = (genero) => {
    const g = (genero ?? '').toLowerCase();
    if (g.includes('vallenato') || g.includes('música') || g.includes('musica'))
        return { icono: 'pi-music',      bg: '#fce4ec', ic: '#ad1457' };
    if (g.includes('noticia') || g.includes('información'))
        return { icono: 'pi-sun',        bg: '#fff9e6', ic: '#b8860b' };
    if (g.includes('deporte'))
        return { icono: 'pi-star',       bg: '#fff3e0', ic: '#e65100' };
    if (g.includes('cultura') || g.includes('arte'))
        return { icono: 'pi-palette',    bg: '#ede7f6', ic: '#4527a0' };
    if (g.includes('entretenimiento') || g.includes('magazín'))
        return { icono: 'pi-headphones', bg: '#e8f5e1', ic: VERDE     };
    if (g.includes('político') || g.includes('política'))
        return { icono: 'pi-globe',      bg: '#e3f0fb', ic: '#1565c0' };
    return { icono: 'pi-clock', bg: '#f8fafc', ic: '#64748b' };
};

const Landing = () => {
    const navigate = useNavigate();
    const audioRef = useRef(null);

    const [menuAbierto,   setMenuAbierto]   = useState(false);
    const [reproduciendo, setReproduciendo] = useState(false);
    const [cargando,      setCargando]      = useState(false);
    const [volumen,       setVolumen]       = useState(80);
    const [silenciado,    setSilenciado]    = useState(false);
    const [anioActual]                      = useState(new Date().getFullYear());
    const [scrolled,      setScrolled]      = useState(false);
    const [visibles,      setVisibles]      = useState({});

    /* ── Datos dinámicos ── */
    const [streamUrl,      setStreamUrl]      = useState('');
    const [streamNombre,   setStreamNombre]   = useState('Cargando...');
    const [streamEnVivo,   setStreamEnVivo]   = useState(false);
    const [parrillaDatos,  setParrillaDatos]  = useState({});
    const [cargandoProg,   setCargandoProg]   = useState(true);
    const [semanaOffset,   setSemanaOffset]   = useState(0);
    const [locutores,      setLocutores]      = useState([]);
    const [cargandoLoc,    setCargandoLoc]    = useState(true);
    const [noticias,       setNoticias]       = useState([]);
    const [cargandoNot,    setCargandoNot]    = useState(true);
    const [eventos,        setEventos]        = useState([]);
    const [cargandoEv,     setCargandoEv]     = useState(true);

    /* ── Cargar parrilla de una semana específica ── */
    const cargarParrilla = useCallback(async (offset = 0) => {
        setCargandoProg(true);
        try {
            // Calcular el lunes de la semana con el offset dado
            const hoy = new Date();
            const dow = hoy.getDay();
            const diasDesdeElLunes = dow === 0 ? 6 : dow - 1;
            const lunes = new Date(hoy);
            lunes.setDate(hoy.getDate() - diasDesdeElLunes + offset * 7);
            const fechaISO = lunes.toISOString().split('T')[0];

            const res = await apiFetch(`/programas/parrilla-semanal?fecha=${fechaISO}`);
            setParrillaDatos(res.data ?? res);
        } catch { /* sin programas aún */ } finally { setCargandoProg(false); }
    }, []);

    /* ── Cargar datos desde la API ── */
    const cargarDatos = useCallback(async () => {
        /* 1. Streaming (endpoint público) */
        try {
            const est = await apiFetch('/streaming/estado');
            setStreamUrl(est.stream_url ?? '');
            setStreamNombre(est.nombre_servidor ?? 'Emisora Digital del Cesar');
            setStreamEnVivo(est.en_vivo ?? false);
        } catch { /* sin config de streaming aún */ }

        /* 2. Parrilla semanal: la carga el useEffect de semanaOffset al montar */

        /* 3. Locutores activos */
        try {
            const res = await apiFetch('/locutores?pagina=1&tamano=12');
            const lista = (res.data ?? []).filter((l) => l.activo !== false);
            setLocutores(lista.slice(0, 6));
        } catch { /* sin acceso o sin locutores */ } finally { setCargandoLoc(false); }

        /* 4. Noticias recientes */
        try {
            const res = await apiFetch('/noticias?tamano=4&pagina=1');
            setNoticias(Array.isArray(res) ? res : (res.data ?? []));
        } catch { setNoticias([]); } finally { setCargandoNot(false); }

        /* 5. Próximos eventos */
        try {
            const res = await apiFetch('/eventos/proximos?limite=4');
            setEventos(Array.isArray(res) ? res : (res.data ?? []));
        } catch { setEventos([]); } finally { setCargandoEv(false); }
    }, [cargarParrilla]);

    useEffect(() => { cargarDatos(); }, [cargarDatos]);

    /* ── Recargar parrilla cuando el usuario navega entre semanas ── */
    useEffect(() => {
        cargarParrilla(semanaOffset);
    }, [semanaOffset]); // eslint-disable-line react-hooks/exhaustive-deps

    /* ── Scroll y animaciones ── */
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => entries.forEach((e) => {
                if (e.isIntersecting) setVisibles((p) => ({ ...p, [e.target.id]: true }));
            }),
            { threshold: 0.15 }
        );
        // noticias/eventos no se observan aquí — se renderizan después de cargar datos
        ['programacion', 'locutores', 'contacto'].forEach((id) => {
            const el = document.getElementById(id);
            if (el) observer.observe(el);
        });
        return () => observer.disconnect();
    }, []);

    /* ── Reproductor ── */
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = silenciado ? 0 : volumen / 100;
        }
    }, [volumen, silenciado]);

    /* ── Calendario semanal ── */
    const DIAS_CAL = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];

    const fechasSemana = useMemo(() => {
        const hoy = new Date();
        const dow = hoy.getDay(); // 0=Dom
        const diasDesdeElLunes = dow === 0 ? 6 : dow - 1;
        const lunes = new Date(hoy);
        lunes.setDate(hoy.getDate() - diasDesdeElLunes + semanaOffset * 7);
        return DIAS_CAL.map((dia, i) => {
            const f = new Date(lunes);
            f.setDate(lunes.getDate() + i);
            return { dia, fecha: f };
        });
    }, [semanaOffset]); // eslint-disable-line

    const semanaLabel = useMemo(() => {
        if (!fechasSemana.length) return '';
        const ini = fechasSemana[0].fecha;
        const fin = fechasSemana[6].fecha;
        const mismoMes = ini.getMonth() === fin.getMonth();
        const fmtIni = { day: 'numeric', ...(mismoMes ? {} : { month: 'long' }) };
        const fmtFin = { day: 'numeric', month: 'long', year: 'numeric' };
        return `Semana del ${ini.toLocaleDateString('es-CO', fmtIni)} al ${fin.toLocaleDateString('es-CO', fmtFin)}`;
    }, [fechasSemana]);

    const hayProgramas = useMemo(
        () => Object.values(parrillaDatos).some(arr => arr.length > 0),
        [parrillaDatos]
    );

    const toggleReproduccion = () => {
        const audio = audioRef.current;
        if (!audio) return;
        if (reproduciendo) {
            audio.pause();
            audio.src = '';
            setReproduciendo(false);
        } else {
            if (!streamUrl) return;
            setCargando(true);
            audio.src = streamUrl;
            audio.load();
            audio.play()
                .then(() => { setReproduciendo(true);  setCargando(false); })
                .catch(()  => { setCargando(false); });
        }
    };

    const seccionesNav = [
        { etiqueta: 'Inicio',       href: '#inicio',       ruta: null },
        { etiqueta: 'Programación', href: '#programacion', ruta: null },
        { etiqueta: 'Locutores',    href: '#locutores',    ruta: null },
        { etiqueta: 'Documentos',   href: null,            ruta: '/documentos' },
        { etiqueta: 'Contáctenos',  href: '#contacto',     ruta: null },
    ];

    return (
        <div className="surface-0">
            <audio ref={audioRef} preload="none" />

            {/* ══ NAVBAR ══════════════════════════════════════════════════════ */}
            <header style={{
                position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
                background: scrolled ? 'rgba(255,255,255,0.85)' : '#fff',
                backdropFilter: scrolled ? 'blur(10px)' : 'none',
                boxShadow: scrolled ? '0 2px 12px rgba(0,0,0,0.15)' : '0 2px 8px rgba(0,0,0,0.12)',
                transition: 'all 0.3s ease',
            }}>
                <div className="flex align-items-center justify-content-between px-4 lg:px-8 py-3">
                    <div className="flex align-items-center gap-2">
                        <img src="/emisora.png" alt="Emisora Comunal del Cesar"
                            style={{ height: 54, width: 'auto', objectFit: 'contain' }} />
                    </div>
                    <nav className="hidden lg:flex align-items-center gap-5">
                        {seccionesNav.map((item) => (
                            item.ruta ? (
                                <button key={item.ruta}
                                    className="p-ripple font-medium border-none bg-transparent cursor-pointer p-0"
                                    style={{ color: '#333', transition: 'color .2s', fontFamily: 'inherit', fontSize: 'inherit' }}
                                    onMouseEnter={e => e.currentTarget.style.color = VERDE}
                                    onMouseLeave={e => e.currentTarget.style.color = '#333'}
                                    onClick={() => navigate(item.ruta)}>
                                    {item.etiqueta}<Ripple />
                                </button>
                            ) : (
                                <a key={item.href} href={item.href}
                                    className="p-ripple font-medium no-underline"
                                    style={{ color: '#333', transition: 'color .2s' }}
                                    onMouseEnter={e => e.target.style.color = VERDE}
                                    onMouseLeave={e => e.target.style.color = '#333'}>
                                    {item.etiqueta}<Ripple />
                                </a>
                            )
                        ))}
                    </nav>
                    <div className="flex align-items-center gap-2">
                        <Button label="Ingresar" icon="pi pi-sign-in" rounded className="hidden lg:flex"
                            style={{ background: VERDE, border: 'none' }}
                            onClick={() => navigate('/login')} />
                        <Button icon="pi pi-bars" text severity="secondary" className="lg:hidden"
                            onClick={() => setMenuAbierto(v => !v)} />
                    </div>
                </div>
                {menuAbierto && (
                    <div className="lg:hidden border-top-1 surface-border px-4 py-3 flex flex-column gap-3 surface-50">
                        {seccionesNav.map((item) => (
                            item.ruta ? (
                                <button key={item.ruta}
                                    className="font-medium border-none bg-transparent cursor-pointer text-left py-2 text-700 p-0"
                                    style={{ fontFamily: 'inherit', fontSize: 'inherit' }}
                                    onClick={() => { setMenuAbierto(false); navigate(item.ruta); }}>
                                    {item.etiqueta}
                                </button>
                            ) : (
                                <a key={item.href} href={item.href}
                                    className="font-medium no-underline py-2 text-700"
                                    onClick={() => setMenuAbierto(false)}>
                                    {item.etiqueta}
                                </a>
                            )
                        ))}
                        <Divider className="my-1" />
                        <Button label="Ingresar" icon="pi pi-sign-in" rounded
                            style={{ background: VERDE, border: 'none' }}
                            onClick={() => navigate('/login')} />
                    </div>
                )}
            </header>

            {/* ══ HERO ════════════════════════════════════════════════════════ */}
            <section id="inicio" style={{
                minHeight: '100vh', paddingTop: '80px',
                background: 'linear-gradient(135deg, #0d1f06 0%, #1a3a0a 40%, #0f2908 70%, #071503 100%)',
                display: 'flex', alignItems: 'center',
                position: 'relative', overflow: 'hidden', overflowX: 'hidden',
            }}>
                {/* Partículas flotantes */}
                {[
                    { size: 6,  top: '12%', left: '8%',   delay: '0s',   dur: '6s'   },
                    { size: 4,  top: '70%', left: '5%',   delay: '1.2s', dur: '8s'   },
                    { size: 8,  top: '35%', left: '18%',  delay: '0.5s', dur: '7s'   },
                    { size: 5,  top: '85%', left: '25%',  delay: '2s',   dur: '5.5s' },
                    { size: 10, top: '20%', right: '10%', delay: '0.8s', dur: '9s'   },
                    { size: 6,  top: '55%', right: '7%',  delay: '1.5s', dur: '6.5s' },
                    { size: 4,  top: '80%', right: '20%', delay: '0.3s', dur: '7.5s' },
                    { size: 7,  top: '40%', right: '30%', delay: '1.8s', dur: '8.5s' },
                    { size: 3,  top: '10%', left: '45%',  delay: '0.6s', dur: '6s'   },
                    { size: 5,  top: '90%', left: '55%',  delay: '2.2s', dur: '7s'   },
                ].map((p, i) => (
                    <div key={i} className="hidden md:block" style={{
                        position: 'absolute', width: p.size, height: p.size,
                        borderRadius: '50%', background: i % 3 === 0 ? AMARILLO : VERDE_CLARO,
                        top: p.top, left: p.left, right: p.right, opacity: 0.25,
                        animation: `flotarParticula ${p.dur} ease-in-out infinite alternate`,
                        animationDelay: p.delay, pointerEvents: 'none',
                    }} />
                ))}

                {/* Notas musicales */}
                {['♪', '♫', '♬', '♩', '♪', '♫'].map((nota, i) => (
                    <span key={i} className="hidden md:inline" style={{
                        position: 'absolute', fontSize: 14 + (i % 3) * 6 + 'px',
                        color: i % 2 === 0 ? AMARILLO : VERDE_CLARO, opacity: 0.18,
                        top: `${15 + i * 13}%`,
                        left: i < 3 ? `${3 + i * 5}%` : undefined,
                        right: i >= 3 ? `${3 + (i - 3) * 6}%` : undefined,
                        animation: `subirNota ${5 + i}s linear infinite`,
                        animationDelay: `${i * 0.8}s`, pointerEvents: 'none', userSelect: 'none',
                    }}>{nota}</span>
                ))}

                <div className="grid w-full mx-0 px-4 lg:px-8 align-items-center"
                    style={{ maxWidth: 1400, margin: '0 auto', position: 'relative', zIndex: 1 }}>

                    {/* Columna texto */}
                    <div className="col-12 lg:col-6 flex flex-column gap-4 py-8"
                        style={{ animation: 'entradaIzquierda 0.8s ease-out forwards' }}>

                        <div className="flex align-items-center gap-2">
                            <div className="border-round px-3 py-1 flex align-items-center gap-2"
                                style={{ background: AMARILLO, display: 'inline-flex' }}>
                                <div style={{
                                    width: 8, height: 8, borderRadius: '50%', background: '#c0392b',
                                    animation: (reproduciendo || streamEnVivo) ? 'parpadeo 1s infinite' : 'none',
                                }} />
                                <span className="font-bold text-sm" style={{ color: '#0d1f06' }}>
                                    {reproduciendo ? '¡AL AIRE!' : streamEnVivo ? 'EN VIVO' : 'EN LÍNEA'}
                                </span>
                            </div>
                        </div>

                        <h1 className="m-0 font-bold"
                            style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', lineHeight: 1.1, color: '#fff' }}>
                            Emisora Digital Comunal<br />
                            <span style={{ color: AMARILLO }}>Primicia</span><br />
                            <span style={{ color: VERDE_CLARO, fontWeight: 300 }}>Comunal del Cesar</span>
                        </h1>

                        <p style={{ color: '#a8c89a', fontSize: '1.1rem', maxWidth: 460, margin: 0, lineHeight: 1.7 }}>
                            Comunales del Cesar conectados en la esfera de las comunicaciones.
                        </p>

                        {/* ── REPRODUCTOR ── */}
                        <div className="flex flex-column gap-3 p-4 border-round-xl"
                            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', maxWidth: 460 }}>

                            <div className="flex align-items-center gap-3">
                                <div className="border-circle flex align-items-center justify-content-center flex-shrink-0"
                                    style={{
                                        width: 56, height: 56,
                                        background: `linear-gradient(135deg, ${VERDE}, ${VERDE_CLARO})`,
                                        animation: reproduciendo ? 'giroDisco 4s linear infinite' : 'none',
                                    }}>
                                    <i className="pi pi-volume-up text-white text-xl" />
                                </div>
                                <div className="min-w-0">
                                    <p className="m-0 font-semibold text-sm text-white white-space-nowrap overflow-hidden text-overflow-ellipsis">
                                        {streamNombre}
                                    </p>
                                    <p className="m-0 text-xs" style={{ color: '#888' }}>
                                        {streamUrl ? 'Stream disponible' : 'Configurando servidor...'}
                                    </p>
                                    <div className="flex align-items-center gap-1 mt-1">
                                        {reproduciendo ? (
                                            <>
                                                {[1,2,3,4,5].map(b => (
                                                    <div key={b} style={{
                                                        width: 3, borderRadius: 2, background: AMARILLO,
                                                        animation: `barra${b} 0.7s ease-in-out infinite alternate`,
                                                        animationDelay: `${b * 0.1}s`,
                                                    }} />
                                                ))}
                                                <span className="text-xs ml-1" style={{ color: AMARILLO }}>En vivo</span>
                                            </>
                                        ) : (
                                            <span className="text-xs" style={{ color: '#666' }}>
                                                {streamUrl ? 'Presiona play para escuchar' : 'Sin transmisión activa'}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex align-items-center gap-3">
                                <Button
                                    icon={cargando ? 'pi pi-spin pi-spinner' : reproduciendo ? 'pi pi-pause' : 'pi pi-play'}
                                    rounded disabled={cargando || !streamUrl}
                                    onClick={toggleReproduccion}
                                    tooltip={streamUrl ? (reproduciendo ? 'Pausar' : 'Escuchar en vivo') : 'Sin URL de streaming configurada'}
                                    tooltipOptions={{ position: 'top' }}
                                    style={{
                                        width: 52, height: 52,
                                        background: `linear-gradient(135deg, ${VERDE}, ${VERDE_CLARO})`,
                                        border: 'none',
                                        boxShadow: reproduciendo ? `0 0 20px ${VERDE}88` : 'none',
                                        flexShrink: 0,
                                    }} />
                                <div className="flex align-items-center gap-2 flex-1">
                                    <Button icon={silenciado || volumen === 0 ? 'pi pi-volume-off' : 'pi pi-volume-up'}
                                        text rounded size="small" style={{ color: '#aaa' }}
                                        onClick={() => setSilenciado(v => !v)} />
                                    <div className="flex-1">
                                        <Slider value={volumen} onChange={e => setVolumen(e.value)} />
                                    </div>
                                    <span className="text-xs" style={{ color: '#888', width: 32 }}>{volumen}%</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 flex-wrap">
                            <Button label="Ver Programación" icon="pi pi-calendar" outlined rounded
                                style={{ borderColor: 'rgba(255,255,255,0.3)', color: '#fff' }}
                                onClick={() => document.getElementById('programacion')?.scrollIntoView({ behavior: 'smooth' })} />
                            <Button label="Síguenos" icon="pi pi-instagram" text rounded
                                style={{ color: AMARILLO }}
                                onClick={() => window.open('https://www.instagram.com/EMISORADIGITALCOMUNAL_DELCESAR', '_blank')} />
                        </div>
                    </div>

                    {/* Columna visual */}
                    <div className="col-12 lg:col-6 flex justify-content-center align-items-center py-8"
                        style={{ animation: 'entradaDerecha 0.8s ease-out forwards' }}>
                        <div className="relative flex align-items-center justify-content-center"
                            style={{ width: '100%', maxWidth: 340, aspectRatio: '1/1' }}>
                            {[1, 2, 3].map(i => (
                                <div key={i} className="absolute border-circle" style={{
                                    width: 110 + i * 70, height: 110 + i * 70,
                                    border: `1px solid ${VERDE}${Math.floor((0.35 - i * 0.09) * 255).toString(16).padStart(2,'0')}`,
                                    animation: reproduciendo ? `onda ${1.4 + i * 0.5}s ease-out infinite` : `pulsarSuave ${3 + i}s ease-in-out infinite`,
                                }} />
                            ))}
                            <div style={{ position:'absolute', top:10, right:30, fontSize:28, color:AMARILLO, opacity:0.75, animation:'orbitar 8s linear infinite' }}>♪</div>
                            <div style={{ position:'absolute', bottom:20, left:20, fontSize:22, color:VERDE_CLARO, opacity:0.65, animation:'orbitar 12s linear infinite reverse' }}>♫</div>
                            <div style={{ position:'absolute', top:0, right:10, animation:'flotarParticula 3s ease-in-out infinite alternate' }}>
                                <i className="pi pi-wifi" style={{ fontSize:32, color:AMARILLO, opacity:0.55 }} />
                            </div>
                            <div className="border-circle flex align-items-center justify-content-center" style={{
                                width:118, height:118,
                                background: `linear-gradient(135deg, ${VERDE} 0%, ${VERDE_CLARO} 100%)`,
                                boxShadow: reproduciendo ? `0 0 40px ${VERDE}99, 0 0 80px ${VERDE}44` : `0 0 20px ${VERDE}44`,
                                transition: 'box-shadow .5s', animation: 'latidoMic 2.5s ease-in-out infinite',
                            }}>
                                <i className="pi pi-microphone text-white" style={{ fontSize:'2.8rem' }} />
                            </div>
                            <div className="absolute border-round-lg px-3 py-1" style={{
                                background:AMARILLO, bottom:30, right:10,
                                boxShadow:'0 4px 12px rgba(0,0,0,0.3)', animation:'saltito 2s ease-in-out infinite',
                            }}>
                                <span className="font-bold text-sm" style={{ color:'#0d1f06' }}>¡Al Aire!</span>
                            </div>
                            {[0,60,120,180,240,300].map((deg,i) => (
                                <div key={i} style={{
                                    position:'absolute', width: i%2===0?6:4, height: i%2===0?6:4,
                                    borderRadius:'50%', background: i%2===0?AMARILLO:VERDE_CLARO, opacity:0.5,
                                    transform:`rotate(${deg}deg) translateX(155px)`,
                                    animation:`orbitar ${10+i}s linear infinite`, transformOrigin:'0 0',
                                }} />
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ══ FRANJA IDENTIDAD ════════════════════════════════════════════ */}
            <div style={{ background: AMARILLO, padding: '14px 32px' }}>
                <div className="flex align-items-center justify-content-center gap-3 flex-wrap">
                    <i className="pi pi-globe" style={{ color: VERDE, fontSize: '1.2rem' }} />
                    <span className="font-bold" style={{ color: '#0d1f06', textAlign: 'center' }}>
                        SINTONIZA EN: www.primiciacomunaldelcesar.com
                    </span>
                </div>
            </div>

            {/* ══ PROGRAMACIÓN — CALENDARIO SEMANAL ══════════════════════════ */}
            <section id="programacion" className="py-8 px-4 lg:px-8" style={{
                opacity: visibles['programacion'] ? 1 : 0,
                transform: visibles['programacion'] ? 'translateY(0)' : 'translateY(40px)',
                transition: 'opacity 0.7s ease, transform 0.7s ease',
            }}>
                <div style={{ maxWidth: 1400, margin: '0 auto' }}>

                    {/* Título + navegación de semana */}
                    <div className="text-center mb-5">
                        <h2 className="text-900 font-bold m-0" style={{ fontSize: '2.2rem' }}>Nuestra Programación</h2>
                        <div className="flex align-items-center justify-content-center gap-3 mt-3 flex-wrap">
                            <Button icon="pi pi-chevron-left" text rounded size="small"
                                tooltip="Semana anterior" tooltipOptions={{ position:'top' }}
                                style={{ color: VERDE, width:36, height:36 }}
                                onClick={() => setSemanaOffset(o => o - 1)} />
                            <div className="text-center px-2">
                                <p className="m-0 font-semibold text-800" style={{ fontSize:'1rem' }}>
                                    {semanaLabel}
                                </p>
                                {semanaOffset !== 0 && (
                                    <Button label="Hoy" text size="small" className="p-0 mt-1"
                                        style={{ color: VERDE, fontSize:'0.75rem', height:'auto' }}
                                        onClick={() => setSemanaOffset(0)} />
                                )}
                            </div>
                            <Button icon="pi pi-chevron-right" text rounded size="small"
                                tooltip="Semana siguiente" tooltipOptions={{ position:'top' }}
                                style={{ color: VERDE, width:36, height:36 }}
                                onClick={() => setSemanaOffset(o => o + 1)} />
                        </div>
                        <Divider className="mt-4" />
                    </div>

                    {/* Grilla del calendario */}
                    {cargandoProg ? (
                        <div style={{ display:'grid', gridTemplateColumns:'repeat(7, 1fr)', gap:8, minWidth:700, overflowX:'auto' }}>
                            {[1,2,3,4,5,6,7].map(i => (
                                <Skeleton key={i} height="200px" borderRadius="10px" />
                            ))}
                        </div>
                    ) : !hayProgramas ? (
                        <div className="text-center py-8">
                            <i className="pi pi-calendar-times text-5xl mb-4 block" style={{ color: `${VERDE}55` }} />
                            <p className="text-500 text-lg">No hay programas registrados aún</p>
                        </div>
                    ) : (
                        <div style={{ overflowX:'auto' }}>
                            <div style={{
                                display:'grid',
                                gridTemplateColumns:'repeat(7, minmax(140px, 1fr))',
                                gap:'6px',
                                minWidth:700,
                            }}>
                                {fechasSemana.map(({ dia, fecha }) => {
                                    const esHoy = semanaOffset === 0 && dia === diaHoy();
                                    const progs = parrillaDatos[dia] ?? [];
                                    const diaNum = fecha.getDate();
                                    const mes = fecha.toLocaleDateString('es-CO', { month:'short' });
                                    return (
                                        <div key={dia} className="border-round-xl overflow-hidden"
                                            style={{
                                                border: `1.5px solid ${esHoy ? VERDE : '#e2e8f0'}`,
                                                boxShadow: esHoy ? `0 0 0 3px ${VERDE}22` : '0 1px 4px rgba(0,0,0,0.06)',
                                            }}>
                                            {/* ── Header del día ── */}
                                            <div className="text-center py-3 px-1"
                                                style={{
                                                    background: esHoy
                                                        ? `linear-gradient(135deg, ${VERDE}, ${VERDE_CLARO})`
                                                        : '#f8fafc',
                                                    borderBottom: `1px solid ${esHoy ? VERDE_CLARO : '#e2e8f0'}`,
                                                }}>
                                                <div className="font-bold text-sm"
                                                    style={{ color: esHoy ? '#fff' : '#475569', letterSpacing:'0.04em' }}>
                                                    {dia.slice(0,3).toUpperCase()}
                                                </div>
                                                <div className="font-bold mt-1"
                                                    style={{ fontSize:'1.5rem', color: esHoy ? '#fff' : '#1e293b', lineHeight:1 }}>
                                                    {diaNum}
                                                </div>
                                                <div className="text-xs mt-1"
                                                    style={{ color: esHoy ? 'rgba(255,255,255,0.8)' : '#94a3b8', textTransform:'capitalize' }}>
                                                    {mes}
                                                </div>
                                                {esHoy && (
                                                    <div className="mt-1">
                                                        <span style={{ fontSize:'0.6rem', background:'rgba(255,255,255,0.22)',
                                                            color:'#fff', padding:'1px 7px', borderRadius:10, letterSpacing:'0.05em' }}>
                                                            HOY
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* ── Programas del día ── */}
                                            <div className="p-2 flex flex-column gap-2"
                                                style={{ background:'#fff', minHeight:120 }}>
                                                {progs.length === 0 ? (
                                                    <div className="flex flex-column align-items-center justify-content-center py-5">
                                                        <i className="pi pi-minus-circle text-300 text-xl mb-1" />
                                                        <p className="text-xs text-400 m-0">Sin programas</p>
                                                    </div>
                                                ) : progs.map(prog => {
                                                    const est = generoEstilo(prog.genero_musical);
                                                    return (
                                                        <div key={prog.id} className="border-round-lg overflow-hidden"
                                                            style={{
                                                                border:`1px solid ${est.ic}1a`,
                                                                background: est.bg,
                                                                boxShadow:'0 1px 3px rgba(0,0,0,0.05)',
                                                            }}>
                                                            {prog.imagen_url && (
                                                                <img src={prog.imagen_url} alt={prog.nombre}
                                                                    style={{ width:'100%', height:56, objectFit:'cover', display:'block' }}
                                                                    onError={e => { e.target.style.display='none'; }} />
                                                            )}
                                                            <div className="p-2">
                                                                <div className="font-semibold text-900 mb-1"
                                                                    style={{ fontSize:'0.72rem', lineHeight:1.3 }}>
                                                                    {prog.nombre}
                                                                </div>
                                                                <div className="flex align-items-center gap-1 mb-1">
                                                                    <i className="pi pi-clock" style={{ fontSize:'0.58rem', color:est.ic }} />
                                                                    <span style={{ fontSize:'0.64rem', color:'#64748b' }}>
                                                                        {prog.hora_inicio?.slice(0,5)}–{prog.hora_fin?.slice(0,5)}
                                                                    </span>
                                                                </div>
                                                                {prog.genero_musical && (
                                                                    <span style={{
                                                                        fontSize:'0.58rem', background:`${est.ic}25`,
                                                                        color:est.ic, padding:'1px 6px', borderRadius:10,
                                                                    }}>
                                                                        {prog.genero_musical}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* ══ LOCUTORES ═══════════════════════════════════════════════════ */}
            <section id="locutores" className="py-8 px-4 lg:px-8 surface-50" style={{
                opacity: visibles['locutores'] ? 1 : 0,
                transform: visibles['locutores'] ? 'translateY(0)' : 'translateY(40px)',
                transition: 'opacity 0.7s ease 0.1s, transform 0.7s ease 0.1s',
            }}>
                <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                    <div className="text-center mb-6">
                        <h2 className="text-900 font-bold m-0" style={{ fontSize: '2.2rem' }}>Nuestras Voces</h2>
                        <p className="text-600 text-xl mt-2">Conoce a los locutores de la emisora</p>
                        <Divider />
                    </div>

                    {cargandoLoc ? (
                        <div className="grid justify-content-center">
                            {[1,2,3].map(i => (
                                <div key={i} className="col-12 md:col-6 lg:col-4 p-3">
                                    <Skeleton height="14rem" borderRadius="12px" />
                                </div>
                            ))}
                        </div>
                    ) : locutores.length === 0 ? (
                        <div className="text-center py-6">
                            <i className="pi pi-microphone text-4xl text-300 mb-3 block" />
                            <p className="text-500">No hay locutores registrados aún</p>
                        </div>
                    ) : (
                        <div className="grid justify-content-center">
                            {locutores.map((l) => (
                                <div key={l.id} className="col-12 sm:col-6 lg:col-4 p-3">
                                    <div className="border-round-xl shadow-2 border-1 surface-border h-full flex flex-column"
                                        style={{ background:'#fff', overflow:'hidden', transition:'transform .25s ease, box-shadow .25s ease', position:'relative' }}
                                        onMouseEnter={e => {
                                            e.currentTarget.style.transform = 'translateY(-6px)';
                                            e.currentTarget.style.boxShadow = `0 16px 40px rgba(58,125,30,0.18)`;
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.transform = '';
                                            e.currentTarget.style.boxShadow = '';
                                        }}>

                                        {/* ── Banda header verde ── */}
                                        <div style={{ height:90, position:'relative', overflow:'hidden',
                                            background:`linear-gradient(135deg, ${VERDE} 0%, ${VERDE_CLARO} 60%, ${AMARILLO}55 100%)` }}>
                                            <div style={{ position:'absolute', width:120, height:120, borderRadius:'50%',
                                                background:'rgba(255,255,255,0.07)', top:-30, right:-20 }} />
                                            <div style={{ position:'absolute', width:70, height:70, borderRadius:'50%',
                                                background:'rgba(255,255,255,0.05)', top:30, left:10 }} />
                                            <div style={{ position:'absolute', bottom:10, left:16 }}>
                                                <span className="font-bold text-xs px-2 py-1 border-round-xl"
                                                    style={{ background:'rgba(255,255,255,0.18)', color:'#fff',
                                                        border:'1px solid rgba(255,255,255,0.28)', letterSpacing:'0.06em' }}>
                                                    ♪ LOCUTOR
                                                </span>
                                            </div>
                                        </div>

                                        {/* ── Avatar flotante sobre la banda ── */}
                                        <div className="flex justify-content-center"
                                            style={{ marginTop:-44, position:'relative', zIndex:1 }}>
                                            <div className="border-circle overflow-hidden flex align-items-center justify-content-center flex-shrink-0"
                                                style={{ width:88, height:88,
                                                    background:`linear-gradient(135deg, ${VERDE}, ${VERDE_CLARO})`,
                                                    border:'4px solid #fff', boxShadow:'0 6px 20px rgba(0,0,0,0.18)' }}>
                                                {l.foto_url
                                                    ? <img src={l.foto_url}
                                                        alt={l.nombre_completo ?? `${l.nombre} ${l.apellido}`}
                                                        style={{ width:'100%', height:'100%', objectFit:'cover' }}
                                                        onError={e => { e.target.style.display='none'; }} />
                                                    : <i className="pi pi-user text-white" style={{ fontSize:'2.2rem' }} />
                                                }
                                            </div>
                                        </div>

                                        {/* ── Datos ── */}
                                        <div className="flex flex-column align-items-center text-center px-4 pt-3 pb-4 flex-1">
                                            <h4 className="text-900 font-bold m-0 mb-1" style={{ fontSize:'1.05rem', lineHeight:1.3 }}>
                                                {l.nombre_completo ?? `${l.nombre} ${l.apellido}`}
                                            </h4>
                                            {l.biografia && (
                                                <p className="text-500 text-sm m-0 mb-3 mt-1 line-clamp-2"
                                                    style={{ lineHeight:1.55, maxWidth:260 }}>
                                                    {l.biografia}
                                                </p>
                                            )}
                                            <div className="flex flex-column gap-2 w-full mt-auto">
                                                {l.email && (
                                                    <div className="flex align-items-center justify-content-center gap-2 px-3 py-2 border-round-lg"
                                                        style={{ background:`${VERDE}0e` }}>
                                                        <i className="pi pi-envelope text-xs" style={{ color:VERDE }} />
                                                        <span className="text-xs text-600 overflow-hidden text-overflow-ellipsis white-space-nowrap"
                                                            style={{ maxWidth:200 }}>{l.email}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* ══ NOTICIAS ══════════════════════════════════════════════════ */}
            <section id="noticias" className="py-8 px-4 lg:px-8">
                <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                    <div className="text-center mb-6">
                        <h2 className="text-900 font-bold m-0" style={{ fontSize: '2.2rem' }}>Últimas Noticias</h2>
                        <p className="text-600 text-xl mt-2">Información destacada de nuestra región</p>
                        <Divider />
                    </div>
                    {cargandoNot ? (
                        <div className="grid">
                            {[1,2,3,4].map(i => (
                                <div key={i} className="col-12 md:col-6 lg:col-3 p-3">
                                    <Skeleton height="260px" borderRadius="12px" />
                                </div>
                            ))}
                        </div>
                    ) : noticias.length === 0 ? (
                        <div className="text-center py-6">
                            <i className="pi pi-file-edit text-4xl text-300 mb-3 block" />
                            <p className="text-500">No hay noticias publicadas aún</p>
                        </div>
                    ) : (
                        <div className="grid">
                            {noticias.map((n) => (
                                <div key={n.id} className="col-12 md:col-6 lg:col-3 p-3">
                                    <div className="surface-card border-round-xl overflow-hidden shadow-1 border-1 surface-border h-full flex flex-column"
                                        style={{ transition: 'box-shadow .3s' }}
                                        onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.12)'}
                                        onMouseLeave={e => e.currentTarget.style.boxShadow = ''}>
                                        {n.imagen_portada_url && (
                                            <img src={n.imagen_portada_url} alt={n.titulo}
                                                style={{ width: '100%', height: 160, objectFit: 'cover' }}
                                                onError={e => { e.target.parentNode.removeChild(e.target); }} />
                                        )}
                                        <div className="p-4 flex flex-column flex-1">
                                            <Tag value={n.categoria} className="text-xs mb-2 align-self-start"
                                                style={{ background: `${VERDE}18`, color: VERDE }} />
                                            <h4 className="text-900 font-semibold m-0 mb-2 line-clamp-2">{n.titulo}</h4>
                                            {n.resumen && (
                                                <p className="text-500 text-sm m-0 line-clamp-3 flex-1">{n.resumen}</p>
                                            )}
                                            {n.fecha_publicacion && (
                                                <p className="text-400 text-xs m-0 mt-2">
                                                    <i className="pi pi-calendar mr-1" />
                                                    {new Date(n.fecha_publicacion).toLocaleDateString('es-CO', { day:'2-digit', month:'short', year:'numeric' })}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* ══ EVENTOS ═══════════════════════════════════════════════════ */}
            <section id="eventos" className="py-8 px-4 lg:px-8 surface-50">
                <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                    <div className="text-center mb-6">
                        <h2 className="text-900 font-bold m-0" style={{ fontSize: '2.2rem' }}>Agenda de Eventos</h2>
                        <p className="text-600 text-xl mt-2">Eventos y transmisiones de la emisora</p>
                        <Divider />
                    </div>
                    {cargandoEv ? (
                        <div className="grid">
                            {[1,2,3,4].map(i => (
                                <div key={i} className="col-12 md:col-6 lg:col-3 p-3">
                                    <Skeleton height="240px" borderRadius="12px" />
                                </div>
                            ))}
                        </div>
                    ) : eventos.length === 0 ? (
                        <div className="text-center py-6">
                            <i className="pi pi-calendar text-4xl text-300 mb-3 block" />
                            <p className="text-500">No hay eventos próximos registrados</p>
                        </div>
                    ) : (
                        <div className="grid">
                            {eventos.map((ev) => {
                                const fechaInicio = ev.fecha_inicio ? new Date(ev.fecha_inicio) : null;
                                const tipoStyles = {
                                    'Evento':               { bg: '#eff6ff', color: '#3b82f6' },
                                    'Transmisión Especial': { bg: `${VERDE}18`, color: VERDE  },
                                    'Entrevista':           { bg: '#fdf4ff', color: '#a855f7' },
                                };
                                const ts = tipoStyles[ev.tipo] ?? { bg: '#f8fafc', color: '#64748b' };
                                return (
                                    <div key={ev.id} className="col-12 md:col-6 lg:col-3 p-3">
                                        <div className="surface-card border-round-xl overflow-hidden shadow-1 border-1 surface-border h-full flex flex-column"
                                            style={{ transition: 'box-shadow .3s' }}
                                            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.12)'}
                                            onMouseLeave={e => e.currentTarget.style.boxShadow = ''}>
                                            {ev.imagen_url && (
                                                <img src={ev.imagen_url} alt={ev.titulo}
                                                    style={{ width: '100%', height: 160, objectFit: 'cover' }}
                                                    onError={e => { e.target.parentNode.removeChild(e.target); }} />
                                            )}
                                            <div className="p-4 flex flex-column flex-1">
                                                <div className="flex align-items-center justify-content-between mb-2">
                                                    <Tag value={ev.tipo} style={{ background: ts.bg, color: ts.color, fontSize: '0.7rem' }} />
                                                    {!ev.publico && <Tag value="Privado" style={{ background:'#f1f5f9', color:'#64748b', fontSize:'0.65rem' }} />}
                                                </div>
                                                <h4 className="text-900 font-semibold m-0 mb-2 line-clamp-2">{ev.titulo}</h4>
                                                {fechaInicio && (
                                                    <p className="text-500 text-sm m-0 mb-1">
                                                        <i className="pi pi-calendar mr-1" style={{ color: VERDE }} />
                                                        {fechaInicio.toLocaleDateString('es-CO', { weekday:'short', day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' })}
                                                    </p>
                                                )}
                                                {ev.lugar && (
                                                    <p className="text-400 text-xs m-0">
                                                        <i className="pi pi-map-marker mr-1" />{ev.lugar}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>

            {/* ══ CONTACTO ════════════════════════════════════════════════════ */}
            <section id="contacto" className="py-8 px-4 lg:px-8" style={{
                opacity: visibles['contacto'] ? 1 : 0,
                transform: visibles['contacto'] ? 'translateY(0)' : 'translateY(40px)',
                transition: 'opacity 0.7s ease 0.15s, transform 0.7s ease 0.15s',
            }}>
                <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                    <div className="grid align-items-center">
                        <div className="col-12 lg:col-6">
                            <h2 className="text-900 font-bold mb-3" style={{ fontSize: '2.2rem' }}>Contáctenos</h2>
                            <p className="text-600 text-lg mb-5">
                                ¿Tienes un aviso o quieres hacer parte de nuestra programación?
                            </p>
                            <div className="flex flex-column gap-4">
                                {[
                                    { icono:'pi-envelope',   label:'Presidencia', valor:'presidencia@primiciacomunaldelcesar.com' },
                                    { icono:'pi-envelope',   label:'Contacto',    valor:'contacto@primiciacomunaldelcesar.com'    },
                                    { icono:'pi-globe',      label:'Web',         valor:'www.primiciacomunaldelcesar.com'          },
                                    { icono:'pi-map-marker', label:'Sede',        valor:'Valledupar, Cesar, Colombia'             },
                                ].map((c) => (
                                    <div key={c.label} className="flex align-items-center gap-3">
                                        <div className="border-circle flex align-items-center justify-content-center flex-shrink-0"
                                            style={{ width:44, height:44, background:`${VERDE}1a` }}>
                                            <i className={`pi ${c.icono}`} style={{ color:VERDE }} />
                                        </div>
                                        <div>
                                            <p className="m-0 text-xs text-500 font-medium" style={{ textTransform:'uppercase' }}>{c.label}</p>
                                            <p className="m-0 text-900 font-medium" style={{ fontSize:'.9rem' }}>{c.valor}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-3 mt-5">
                                {[
                                    { red:'Instagram', icono:'pi-instagram', url:'https://www.instagram.com/EMISORADIGITALCOMUNAL_DELCESAR' },
                                    { red:'Facebook',  icono:'pi-facebook',  url:'https://www.facebook.com/EMISORADIGITALCOMUNALDELCESAR'  },
                                ].map((s) => (
                                    <Button key={s.red} label={s.red} icon={`pi ${s.icono}`} outlined rounded
                                        style={{ borderColor:VERDE, color:VERDE }}
                                        onClick={() => window.open(s.url, '_blank')} />
                                ))}
                            </div>
                        </div>

                        <div className="col-12 lg:col-6 flex justify-content-center mt-5 lg:mt-0">
                            <div className="border-round-2xl p-6 w-full text-center text-white"
                                style={{ background:`linear-gradient(135deg, ${VERDE} 0%, ${VERDE_CLARO} 100%)`, maxWidth:400 }}>
                                <i className="pi pi-microphone text-5xl mb-4 block" />
                                <h3 className="m-0 mb-2 text-2xl font-bold">Escucha en vivo</h3>
                                <p className="m-0 text-lg mb-4" style={{ opacity:.85 }}>La voz del Cesar, siempre contigo</p>
                                <Button
                                    icon={reproduciendo ? 'pi pi-pause' : 'pi pi-play'}
                                    label={reproduciendo ? 'Pausar' : 'Sintonizar ahora'}
                                    rounded disabled={!streamUrl}
                                    style={{ background:AMARILLO, border:'none', color:'#0d1f06', fontWeight:700 }}
                                    onClick={toggleReproduccion} />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══ FOOTER ══════════════════════════════════════════════════════ */}
            <footer style={{ background:'#0d1f06', paddingTop:40, paddingBottom:32 }}>
                <div className="px-4 lg:px-8" style={{ maxWidth:1200, margin:'0 auto' }}>
                    <div className="grid">
                        <div className="col-12 md:col-4 mb-4">
                            <div className="flex align-items-center gap-3 mb-3">
                                <div className="border-circle flex align-items-center justify-content-center"
                                    style={{ width:40, height:40, background:VERDE }}>
                                    <i className="pi pi-microphone text-white" />
                                </div>
                                <div>
                                    <span className="font-bold text-white block">Primicia Comunal</span>
                                    <span className="text-xs" style={{ color:AMARILLO }}>Emisora Digital del Cesar</span>
                                </div>
                            </div>
                            <p className="text-sm" style={{ color:'#7aaa66', lineHeight:1.7, margin:0 }}>
                                Comunales del Cesar conectados en la esfera de las comunicaciones.
                            </p>
                        </div>
                        <div className="col-12 md:col-4 mb-4">
                            <h5 className="font-bold mb-3" style={{ color:AMARILLO }}>Contáctenos</h5>
                            <div className="flex flex-column gap-2">
                                {['presidencia@primiciacomunaldelcesar.com','contacto@primiciacomunaldelcesar.com','www.primiciacomunaldelcesar.com'].map(v => (
                                    <span key={v} className="text-sm" style={{ color:'#7aaa66' }}>{v}</span>
                                ))}
                            </div>
                        </div>
                        <div className="col-12 md:col-4 mb-4">
                            <h5 className="font-bold mb-3" style={{ color:AMARILLO }}>Redes Sociales</h5>
                            <div className="flex gap-2">
                                {[
                                    { icono:'pi-instagram', url:'https://www.instagram.com/EMISORADIGITALCOMUNAL_DELCESAR' },
                                    { icono:'pi-facebook',  url:'https://www.facebook.com/EMISORADIGITALCOMUNALDELCESAR'  },
                                ].map(s => (
                                    <Button key={s.icono} icon={`pi ${s.icono}`} rounded text
                                        style={{ color:AMARILLO, width:40, height:40 }}
                                        onClick={() => window.open(s.url, '_blank')} />
                                ))}
                            </div>
                        </div>
                    </div>
                    <div style={{ borderTop:'1px solid rgba(255,255,255,0.1)', marginTop:24, paddingTop:20, textAlign:'center' }}>
                        <span className="text-sm" style={{ color:'#4a7a38' }}>
                            © {anioActual} Emisora Digital Comunal Primicia Comunal del Cesar — Todos los derechos reservados
                        </span>
                    </div>
                </div>
            </footer>

            <style>{`
                @keyframes giroDisco        { from{transform:rotate(0deg);}   to{transform:rotate(360deg);} }
                @keyframes onda             { 0%{transform:scale(1);opacity:1;} 100%{transform:scale(1.3);opacity:0;} }
                @keyframes pulsarSuave      { 0%,100%{transform:scale(1);opacity:0.25;} 50%{transform:scale(1.08);opacity:0.45;} }
                @keyframes parpadeo         { 0%,100%{opacity:1;} 50%{opacity:0;} }
                @keyframes barra1           { from{height:5px;}  to{height:16px;} }
                @keyframes barra2           { from{height:9px;}  to{height:22px;} }
                @keyframes barra3           { from{height:7px;}  to{height:18px;} }
                @keyframes barra4           { from{height:12px;} to{height:20px;} }
                @keyframes barra5           { from{height:6px;}  to{height:14px;} }
                @keyframes flotarParticula  { from{transform:translateY(0px);} to{transform:translateY(-18px);} }
                @keyframes subirNota        { 0%{transform:translateY(0) rotate(-10deg);opacity:0.18;} 80%{opacity:0.18;} 100%{transform:translateY(-120px) rotate(15deg);opacity:0;} }
                @keyframes orbitar          { 0%{transform:rotate(0deg) translateX(155px) rotate(0deg);} 100%{transform:rotate(360deg) translateX(155px) rotate(-360deg);} }
                @keyframes saltito          { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-8px);} }
                @keyframes latidoMic        { 0%,100%{transform:scale(1);} 50%{transform:scale(1.05);} }
                @keyframes entradaIzquierda { from{opacity:0;transform:translateX(-40px);} to{opacity:1;transform:translateX(0);} }
                @keyframes entradaDerecha   { from{opacity:0;transform:translateX(40px);}  to{opacity:1;transform:translateX(0);} }
                .line-clamp-2 { display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
            `}</style>
        </div>
    );
};

export default Landing;
