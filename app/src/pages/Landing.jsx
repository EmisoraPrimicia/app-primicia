import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Ripple } from 'primereact/ripple';
import { Divider } from 'primereact/divider';
import { Tag } from 'primereact/tag';
import { Slider } from 'primereact/slider';

/* ── Colores de marca ─────────────────────────────────────────────── */
const VERDE       = '#3a7d1e';
const VERDE_CLARO = '#4e9e28';
const AMARILLO    = '#f5c518';
const STREAM_URL  = 'https://stream.zeno.fm/0r0xa792kwzuv'; // reemplazar con URL real

const Landing = () => {
    const navigate  = useNavigate();
    const audioRef  = useRef(null);

    const [menuAbierto,  setMenuAbierto]  = useState(false);
    const [reproduciendo, setReproduciendo] = useState(false);
    const [cargando,     setCargando]     = useState(false);
    const [volumen,      setVolumen]      = useState(80);
    const [silenciado,   setSilenciado]   = useState(false);
    const [anioActual]                    = useState(new Date().getFullYear());
    const [scrolled,     setScrolled]     = useState(false);
    const [visibles,     setVisibles]     = useState({});

    // Detectar scroll para cambiar estilo del navbar
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // IntersectionObserver para animaciones de entrada por sección
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setVisibles((prev) => ({ ...prev, [entry.target.id]: true }));
                    }
                });
            },
            { threshold: 0.15 }
        );
        ['programacion', 'locutores', 'contacto'].forEach((id) => {
            const el = document.getElementById(id);
            if (el) observer.observe(el);
        });
        return () => observer.disconnect();
    }, []);

    const toggleReproduccion = () => {
        const audio = audioRef.current;
        if (!audio) return;
        if (reproduciendo) {
            audio.pause();
            audio.src = '';
            setReproduciendo(false);
        } else {
            setCargando(true);
            audio.src = STREAM_URL;
            audio.load();
            audio.play()
                .then(() => { setReproduciendo(true);  setCargando(false); })
                .catch(()  => { setCargando(false); });
        }
    };

    const irLogin = () => navigate('/login');

    const seccionesNav = [
        { etiqueta: 'Inicio',       href: '#inicio'       },
        { etiqueta: 'Programación', href: '#programacion' },
        { etiqueta: 'Locutores',    href: '#locutores'    },
        { etiqueta: 'Contáctenos',  href: '#contacto'     },
    ];

    return (
        <div className="surface-0">
            <audio ref={audioRef} preload="none" onVolumeChange={() => {
                if (audioRef.current) audioRef.current.volume = silenciado ? 0 : volumen / 100;
            }} />

            {/* ══ NAVBAR ══════════════════════════════════════════════════════ */}
            <header style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 1000,
                background: scrolled ? 'rgba(255,255,255,0.85)' : '#fff',
                backdropFilter: scrolled ? 'blur(10px)' : 'none',
                boxShadow: scrolled ? '0 2px 12px rgba(0,0,0,0.15)' : '0 2px 8px rgba(0,0,0,0.12)',
                transition: 'all 0.3s ease',
            }}>
                <div className="flex align-items-center justify-content-between px-4 lg:px-8 py-3">

                    {/* Logo */}
                    <div className="flex align-items-center gap-2">
                        <img
                            src="/emisora.png"
                            alt="Emisora Comunal del Cesar"
                            style={{ height: 54, width: 'auto', objectFit: 'contain' }}
                        />
                    </div>

                    {/* Nav desktop */}
                    <nav className="hidden lg:flex align-items-center gap-5">
                        {seccionesNav.map((item) => (
                            <a key={item.href} href={item.href}
                                className="p-ripple font-medium no-underline"
                                style={{ color: '#333', transition: 'color .2s' }}
                                onMouseEnter={e => e.target.style.color = VERDE}
                                onMouseLeave={e => e.target.style.color = '#333'}>
                                {item.etiqueta}<Ripple />
                            </a>
                        ))}
                    </nav>

                    <div className="flex align-items-center gap-2">
                        <Button label="Ingresar" icon="pi pi-sign-in" rounded
                            className="hidden lg:flex"
                            style={{ background: VERDE, border: 'none' }}
                            onClick={irLogin} />
                        <Button icon="pi pi-bars" text severity="secondary"
                            className="lg:hidden"
                            onClick={() => setMenuAbierto(v => !v)} />
                    </div>
                </div>

                {/* Menú móvil */}
                {menuAbierto && (
                    <div className="lg:hidden border-top-1 surface-border px-4 py-3 flex flex-column gap-3 surface-50">
                        {seccionesNav.map((item) => (
                            <a key={item.href} href={item.href}
                                className="font-medium no-underline py-2 text-700"
                                onClick={() => setMenuAbierto(false)}>
                                {item.etiqueta}
                            </a>
                        ))}
                        <Divider className="my-1" />
                        <Button label="Ingresar" icon="pi pi-sign-in" rounded
                            style={{ background: VERDE, border: 'none' }}
                            onClick={irLogin} />
                    </div>
                )}
            </header>

            {/* ══ HERO ════════════════════════════════════════════════════════ */}
            <section id="inicio"
                style={{
                    minHeight: '100vh',
                    paddingTop: '80px',
                    background: 'linear-gradient(135deg, #0d1f06 0%, #1a3a0a 40%, #0f2908 70%, #071503 100%)',
                    display: 'flex', alignItems: 'center',
                    position: 'relative', overflow: 'hidden',
                    overflowX: 'hidden',
                }}>

                {/* ── Partículas flotantes de fondo ── */}
                {[
                    { size: 6,  top: '12%', left: '8%',  delay: '0s',    dur: '6s'  },
                    { size: 4,  top: '70%', left: '5%',  delay: '1.2s',  dur: '8s'  },
                    { size: 8,  top: '35%', left: '18%', delay: '0.5s',  dur: '7s'  },
                    { size: 5,  top: '85%', left: '25%', delay: '2s',    dur: '5.5s'},
                    { size: 10, top: '20%', right: '10%',delay: '0.8s',  dur: '9s'  },
                    { size: 6,  top: '55%', right: '7%', delay: '1.5s',  dur: '6.5s'},
                    { size: 4,  top: '80%', right: '20%',delay: '0.3s',  dur: '7.5s'},
                    { size: 7,  top: '40%', right: '30%',delay: '1.8s',  dur: '8.5s'},
                    { size: 3,  top: '10%', left: '45%', delay: '0.6s',  dur: '6s'  },
                    { size: 5,  top: '90%', left: '55%', delay: '2.2s',  dur: '7s'  },
                ].map((p, i) => (
                    <div key={i} className="hidden md:block" style={{
                        position: 'absolute',
                        width: p.size, height: p.size,
                        borderRadius: '50%',
                        background: i % 3 === 0 ? AMARILLO : VERDE_CLARO,
                        top: p.top, left: p.left, right: p.right,
                        opacity: 0.25,
                        animation: `flotarParticula ${p.dur} ease-in-out infinite alternate`,
                        animationDelay: p.delay,
                        pointerEvents: 'none',
                    }} />
                ))}

                {/* ── Notas musicales flotantes ── */}
                {['♪', '♫', '♬', '♩', '♪', '♫'].map((nota, i) => (
                    <span key={i} className="hidden md:inline" style={{
                        position: 'absolute',
                        fontSize: 14 + (i % 3) * 6 + 'px',
                        color: i % 2 === 0 ? AMARILLO : VERDE_CLARO,
                        opacity: 0.18,
                        top: `${15 + i * 13}%`,
                        left: i < 3 ? `${3 + i * 5}%` : undefined,
                        right: i >= 3 ? `${3 + (i - 3) * 6}%` : undefined,
                        animation: `subirNota ${5 + i}s linear infinite`,
                        animationDelay: `${i * 0.8}s`,
                        pointerEvents: 'none',
                        userSelect: 'none',
                    }}>{nota}</span>
                ))}

                {/* ── Ondas de señal decorativas (izquierda) - oculto en móviles ── */}
                <div className="hidden lg:block" style={{
                    position: 'absolute', left: '-80px', top: '50%',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none',
                }}>
                    {[1, 2, 3].map(i => (
                        <div key={i} style={{
                            position: 'absolute',
                            width: 60 + i * 50, height: 60 + i * 50,
                            borderRadius: '50%',
                            border: `1px solid ${VERDE}${Math.floor((0.2 - i * 0.05) * 255).toString(16).padStart(2, '0')}`,
                            top: '50%', left: '50%',
                            transform: 'translate(-50%, -50%)',
                            animation: `pulsarOnda ${2 + i * 0.6}s ease-out infinite`,
                            animationDelay: `${i * 0.4}s`,
                        }} />
                    ))}
                </div>

                <div className="grid w-full mx-0 px-4 lg:px-8 align-items-center" style={{ maxWidth: 1400, margin: '0 auto', position: 'relative', zIndex: 1 }}>

                    {/* Columna texto */}
                    <div className="col-12 lg:col-6 flex flex-column gap-4 py-8"
                        style={{ animation: 'entradaIzquierda 0.8s ease-out forwards' }}>

                        {/* Badge AL AIRE */}
                        <div className="flex align-items-center gap-2">
                            <div className="border-round px-3 py-1 flex align-items-center gap-2"
                                style={{ background: AMARILLO, display: 'inline-flex' }}>
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#c0392b',
                                    animation: reproduciendo ? 'parpadeo 1s infinite' : 'none' }} />
                                <span className="font-bold text-sm" style={{ color: '#0d1f06' }}>
                                    {reproduciendo ? '¡AL AIRE!' : 'EN LÍNEA'}
                                </span>
                            </div>
                        </div>

                        <h1 className="m-0 font-bold" style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', lineHeight: 1.1, color: '#fff' }}>
                            Emisora Digital<br />
                            <span style={{ color: AMARILLO }}>Comunal</span><br />
                            <span style={{ color: VERDE_CLARO, fontWeight: 300 }}>del Cesar</span>
                        </h1>

                        <p style={{ color: '#a8c89a', fontSize: '1.1rem', maxWidth: 460, margin: 0, lineHeight: 1.7 }}>
                            Comunales del Cesar conectados en la esfera de las comunicaciones.
                        </p>

                        {/* ── REPRODUCTOR ─────────────────────────────────────── */}
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
                                <div>
                                    <p className="m-0 font-semibold text-sm text-white">Transmisión en vivo</p>
                                    <p className="m-0 text-xs" style={{ color: '#888' }}>Primicia Comunal del Cesar</p>
                                    <div className="flex align-items-center gap-1 mt-1">
                                        {reproduciendo ? (
                                            <>
                                                {[1,2,3,4,5].map(b => (
                                                    <div key={b} style={{
                                                        width: 3, borderRadius: 2,
                                                        background: AMARILLO,
                                                        animation: `barra${b} 0.7s ease-in-out infinite alternate`,
                                                        animationDelay: `${b * 0.1}s`,
                                                    }} />
                                                ))}
                                                <span className="text-xs ml-1" style={{ color: AMARILLO }}>En vivo</span>
                                            </>
                                        ) : (
                                            <span className="text-xs" style={{ color: '#666' }}>Pausado</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Botón play + volumen */}
                            <div className="flex align-items-center gap-3">
                                <Button
                                    icon={cargando ? 'pi pi-spin pi-spinner' : reproduciendo ? 'pi pi-pause' : 'pi pi-play'}
                                    rounded disabled={cargando}
                                    onClick={toggleReproduccion}
                                    tooltip={reproduciendo ? 'Pausar' : 'Escuchar en vivo'}
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
                                        text rounded size="small"
                                        style={{ color: '#aaa' }}
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

                            {/* Anillos de onda */}
                            {[1, 2, 3].map(i => (
                                <div key={i} className="absolute border-circle"
                                    style={{
                                        width: 110 + i * 70, height: 110 + i * 70,
                                        border: `1px solid ${VERDE}${Math.floor((0.35 - i * 0.09) * 255).toString(16).padStart(2,'0')}`,
                                        animation: reproduciendo ? `onda ${1.4 + i * 0.5}s ease-out infinite` : `pulsarSuave ${3 + i}s ease-in-out infinite`,
                                    }} />
                            ))}

                            {/* Icono giratorio secundario — nota musical */}
                            <div style={{
                                position: 'absolute',
                                top: 10, right: 30,
                                fontSize: 28,
                                color: AMARILLO,
                                opacity: 0.75,
                                animation: 'orbitar 8s linear infinite',
                            }}>♪</div>
                            <div style={{
                                position: 'absolute',
                                bottom: 20, left: 20,
                                fontSize: 22,
                                color: VERDE_CLARO,
                                opacity: 0.65,
                                animation: 'orbitar 12s linear infinite reverse',
                            }}>♫</div>

                            {/* Señal wifi decorativa arriba derecha */}
                            <div style={{
                                position: 'absolute', top: 0, right: 10,
                                animation: 'flotarParticula 3s ease-in-out infinite alternate',
                            }}>
                                <i className="pi pi-wifi" style={{ fontSize: 32, color: AMARILLO, opacity: 0.55 }} />
                            </div>

                            {/* Círculo central con micrófono */}
                            <div className="border-circle flex align-items-center justify-content-center"
                                style={{
                                    width: 118, height: 118,
                                    background: `linear-gradient(135deg, ${VERDE} 0%, ${VERDE_CLARO} 100%)`,
                                    boxShadow: reproduciendo ? `0 0 40px ${VERDE}99, 0 0 80px ${VERDE}44` : `0 0 20px ${VERDE}44`,
                                    transition: 'box-shadow .5s',
                                    animation: 'latidoMic 2.5s ease-in-out infinite',
                                }}>
                                <i className="pi pi-microphone text-white" style={{ fontSize: '2.8rem' }} />
                            </div>

                            {/* Badge amarillo "¡Al Aire!" */}
                            <div className="absolute border-round-lg px-3 py-1"
                                style={{
                                    background: AMARILLO, bottom: 30, right: 10,
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                                    animation: 'saltito 2s ease-in-out infinite',
                                }}>
                                <span className="font-bold text-sm" style={{ color: '#0d1f06' }}>¡Al Aire!</span>
                            </div>

                            {/* Puntos decorativos orbitando */}
                            {[0, 60, 120, 180, 240, 300].map((deg, i) => (
                                <div key={i} style={{
                                    position: 'absolute',
                                    width: i % 2 === 0 ? 6 : 4,
                                    height: i % 2 === 0 ? 6 : 4,
                                    borderRadius: '50%',
                                    background: i % 2 === 0 ? AMARILLO : VERDE_CLARO,
                                    opacity: 0.5,
                                    transform: `rotate(${deg}deg) translateX(155px)`,
                                    animation: `orbitar ${10 + i}s linear infinite`,
                                    transformOrigin: '0 0',
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

            {/* ══ PROGRAMACIÓN ════════════════════════════════════════════════ */}
            <section id="programacion" className="py-8 px-4 lg:px-8"
                style={{
                    opacity: visibles['programacion'] ? 1 : 0,
                    transform: visibles['programacion'] ? 'translateY(0)' : 'translateY(40px)',
                    transition: 'opacity 0.7s ease, transform 0.7s ease',
                }}>
                <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                    <div className="text-center mb-6">
                        <h2 className="text-900 font-bold m-0" style={{ fontSize: '2.2rem' }}>Nuestra Programación</h2>
                        <p className="text-600 text-xl mt-2">Contenido para toda la familia cesarense</p>
                        <Divider />
                    </div>
                    <div className="grid">
                        {[
                            { hora: '06:00 - 09:00', programa: 'Buenos Días Cesar',    tipo: 'Noticias',       icono: 'pi-sun',        bg: '#fff9e6', ic: '#b8860b' },
                            { hora: '09:00 - 12:00', programa: 'Frecuencia Comunal',   tipo: 'Entretenimiento',icono: 'pi-headphones', bg: '#e8f5e1', ic: VERDE     },
                            { hora: '12:00 - 14:00', programa: 'El Mediodía',          tipo: 'Magazín',        icono: 'pi-clock',      bg: '#e3f0fb', ic: '#1565c0' },
                            { hora: '17:00 - 19:00', programa: 'Tarde Vallenata',      tipo: 'Música',         icono: 'pi-music',      bg: '#fce4ec', ic: '#ad1457' },
                            { hora: '19:00 - 21:00', programa: 'Primicia Deportiva',   tipo: 'Deportes',       icono: 'pi-star',       bg: '#fff3e0', ic: '#e65100' },
                            { hora: '21:00 - 23:00', programa: 'Noche Cultural',       tipo: 'Cultura',        icono: 'pi-palette',    bg: '#ede7f6', ic: '#4527a0' },
                        ].map((item) => (
                            <div key={item.hora} className="col-12 md:col-6 lg:col-4 p-3">
                                <div className="surface-card border-round-xl p-4 h-full shadow-1 border-1 surface-border"
                                    style={{ transition: 'box-shadow .3s' }}
                                    onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.12)'}
                                    onMouseLeave={e => e.currentTarget.style.boxShadow = ''}>
                                    <div className="flex align-items-center gap-3 mb-3">
                                        <div className="flex align-items-center justify-content-center border-round-lg"
                                            style={{ width: 48, height: 48, background: item.bg }}>
                                            <i className={`pi ${item.icono} text-xl`} style={{ color: item.ic }} />
                                        </div>
                                        <div>
                                            <Tag value={item.tipo} severity="secondary" className="text-xs mb-1" />
                                            <p className="m-0 text-xs text-500">{item.hora}</p>
                                        </div>
                                    </div>
                                    <h4 className="text-900 font-semibold mt-0 mb-1">{item.programa}</h4>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══ LOCUTORES ═══════════════════════════════════════════════════ */}
            <section id="locutores" className="py-8 px-4 lg:px-8 surface-50"
                style={{
                    opacity: visibles['locutores'] ? 1 : 0,
                    transform: visibles['locutores'] ? 'translateY(0)' : 'translateY(40px)',
                    transition: 'opacity 0.7s ease 0.1s, transform 0.7s ease 0.1s',
                }}>
                <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                    <div className="text-center mb-6">
                        <h2 className="text-900 font-bold m-0" style={{ fontSize: '2.2rem' }}>Nuestras Voces</h2>
                        <p className="text-600 text-xl mt-2">Conoce a los locutores de Primicia Comunal</p>
                        <Divider />
                    </div>
                    <div className="grid justify-content-center">
                        {[
                            { nombre: 'Carlos Mendoza',       cargo: 'Director & Locutor Principal', especialidad: 'Noticias · Política'     },
                            { nombre: 'María Fernanda Torres', cargo: 'Locutora',                    especialidad: 'Entretenimiento · Cultura' },
                            { nombre: 'Jhon Pérez',           cargo: 'Locutor Deportivo',            especialidad: 'Deportes · Análisis'      },
                        ].map((l) => (
                            <div key={l.nombre} className="col-12 md:col-6 lg:col-4 p-3">
                                <div className="surface-card border-round-xl p-5 text-center shadow-1 border-1 surface-border">
                                    <div className="border-circle flex align-items-center justify-content-center mx-auto mb-4"
                                        style={{ width: 80, height: 80, background: `linear-gradient(135deg, ${VERDE}, ${VERDE_CLARO})` }}>
                                        <i className="pi pi-user text-white text-3xl" />
                                    </div>
                                    <h4 className="text-900 font-bold m-0 mb-1">{l.nombre}</h4>
                                    <p className="text-600 text-sm m-0 mb-2">{l.cargo}</p>
                                    <Tag value={l.especialidad} className="text-xs"
                                        style={{ background: `${VERDE}1a`, color: VERDE }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══ CONTACTO ════════════════════════════════════════════════════ */}
            <section id="contacto" className="py-8 px-4 lg:px-8"
                style={{
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
                                    { icono: 'pi-envelope', label: 'Presidencia', valor: 'presidencia@primiciacomunaldelcesar.com' },
                                    { icono: 'pi-envelope', label: 'Contacto',    valor: 'contacto@primiciacomunaldelcesar.com'    },
                                    { icono: 'pi-globe',    label: 'Web',         valor: 'www.primiciacomunaldelcesar.com'          },
                                    { icono: 'pi-map-marker', label: 'Sede',      valor: 'Valledupar, Cesar, Colombia'              },
                                ].map((c) => (
                                    <div key={c.label} className="flex align-items-center gap-3">
                                        <div className="border-circle flex align-items-center justify-content-center flex-shrink-0"
                                            style={{ width: 44, height: 44, background: `${VERDE}1a` }}>
                                            <i className={`pi ${c.icono}`} style={{ color: VERDE }} />
                                        </div>
                                        <div>
                                            <p className="m-0 text-xs text-500 font-medium" style={{ textTransform: 'uppercase' }}>{c.label}</p>
                                            <p className="m-0 text-900 font-medium" style={{ fontSize: '.9rem' }}>{c.valor}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Redes sociales */}
                            <div className="flex gap-3 mt-5">
                                {[
                                    { red: 'Instagram', icono: 'pi-instagram', url: 'https://www.instagram.com/EMISORADIGITALCOMUNAL_DELCESAR' },
                                    { red: 'Facebook',  icono: 'pi-facebook',  url: 'https://www.facebook.com/EMISORADIGITALCOMUNALDELCESAR'  },
                                ].map((s) => (
                                    <Button key={s.red} label={s.red} icon={`pi ${s.icono}`} outlined rounded
                                        style={{ borderColor: VERDE, color: VERDE }}
                                        onClick={() => window.open(s.url, '_blank')} />
                                ))}
                            </div>
                        </div>

                        <div className="col-12 lg:col-6 flex justify-content-center mt-5 lg:mt-0">
                            <div className="border-round-2xl p-6 w-full text-center text-white"
                                style={{ background: `linear-gradient(135deg, ${VERDE} 0%, ${VERDE_CLARO} 100%)`, maxWidth: 400 }}>
                                <i className="pi pi-microphone text-5xl mb-4 block" />
                                <h3 className="m-0 mb-2 text-2xl font-bold">Escucha en vivo</h3>
                                <p className="m-0 text-lg mb-4" style={{ opacity: .85 }}>
                                    La voz del Cesar, siempre contigo
                                </p>
                                <Button
                                    icon={reproduciendo ? 'pi pi-pause' : 'pi pi-play'}
                                    label={reproduciendo ? 'Pausar' : 'Sintonizar ahora'}
                                    rounded
                                    style={{ background: AMARILLO, border: 'none', color: '#0d1f06', fontWeight: 700 }}
                                    onClick={toggleReproduccion} />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══ FOOTER ══════════════════════════════════════════════════════ */}
            <footer style={{ background: '#0d1f06', paddingTop: 40, paddingBottom: 32 }}>
                <div className="px-4 lg:px-8" style={{ maxWidth: 1200, margin: '0 auto' }}>
                    <div className="grid">
                        <div className="col-12 md:col-4 mb-4">
                            <div className="flex align-items-center gap-3 mb-3">
                                <div className="border-circle flex align-items-center justify-content-center"
                                    style={{ width: 40, height: 40, background: VERDE }}>
                                    <i className="pi pi-microphone text-white" />
                                </div>
                                <div>
                                    <span className="font-bold text-white block">Primicia Comunal</span>
                                    <span className="text-xs" style={{ color: AMARILLO }}>Emisora Digital del Cesar</span>
                                </div>
                            </div>
                            <p className="text-sm" style={{ color: '#7aaa66', lineHeight: 1.7, margin: 0 }}>
                                Comunales del Cesar conectados en la esfera de las comunicaciones.
                            </p>
                        </div>

                        <div className="col-12 md:col-4 mb-4">
                            <h5 className="font-bold mb-3" style={{ color: AMARILLO }}>Contáctenos</h5>
                            <div className="flex flex-column gap-2">
                                {['presidencia@primiciacomunaldelcesar.com', 'contacto@primiciacomunaldelcesar.com', 'www.primiciacomunaldelcesar.com'].map(v => (
                                    <span key={v} className="text-sm" style={{ color: '#7aaa66' }}>{v}</span>
                                ))}
                            </div>
                        </div>

                        <div className="col-12 md:col-4 mb-4">
                            <h5 className="font-bold mb-3" style={{ color: AMARILLO }}>Redes Sociales</h5>
                            <div className="flex gap-2">
                                {[
                                    { icono: 'pi-instagram', url: 'https://www.instagram.com/EMISORADIGITALCOMUNAL_DELCESAR' },
                                    { icono: 'pi-facebook',  url: 'https://www.facebook.com/EMISORADIGITALCOMUNALDELCESAR'  },
                                ].map(s => (
                                    <Button key={s.icono} icon={`pi ${s.icono}`} rounded text
                                        style={{ color: AMARILLO, width: 40, height: 40 }}
                                        onClick={() => window.open(s.url, '_blank')} />
                                ))}
                            </div>
                        </div>
                    </div>

                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: 24, paddingTop: 20, textAlign: 'center' }}>
                        <span className="text-sm" style={{ color: '#4a7a38' }}>
                            © {anioActual} Emisora Digital Comunal Primicia Comunal del Cesar — Todos los derechos reservados
                        </span>
                    </div>
                </div>
            </footer>

            {/* Animaciones */}
            <style>{`
                @keyframes giroDisco        { from { transform: rotate(0deg); }   to   { transform: rotate(360deg); } }
                @keyframes onda             { 0%   { transform: scale(1); opacity:1; } 100% { transform: scale(1.3); opacity:0; } }
                @keyframes pulsarSuave      { 0%,100% { transform: scale(1); opacity:0.25; } 50% { transform: scale(1.08); opacity:0.45; } }
                @keyframes pulsarOnda       { 0%   { transform: translate(-50%,-50%) scale(1); opacity:0.4; } 100% { transform: translate(-50%,-50%) scale(1.6); opacity:0; } }
                @keyframes parpadeo         { 0%,100% { opacity:1; } 50% { opacity:0; } }
                @keyframes barra1           { from { height: 5px;  } to { height: 16px; } }
                @keyframes barra2           { from { height: 9px;  } to { height: 22px; } }
                @keyframes barra3           { from { height: 7px;  } to { height: 18px; } }
                @keyframes barra4           { from { height: 12px; } to { height: 20px; } }
                @keyframes barra5           { from { height: 6px;  } to { height: 14px; } }
                @keyframes flotarParticula  { from { transform: translateY(0px);  } to { transform: translateY(-18px); } }
                @keyframes subirNota        { 0% { transform: translateY(0) rotate(-10deg); opacity:0.18; } 80% { opacity:0.18; } 100% { transform: translateY(-120px) rotate(15deg); opacity:0; } }
                @keyframes orbitar         {
                    0%   { transform: rotate(0deg)   translateX(155px) rotate(0deg);   }
                    100% { transform: rotate(360deg) translateX(155px) rotate(-360deg); }
                }
                @keyframes saltito          { 0%,100% { transform: translateY(0);    } 50% { transform: translateY(-8px); } }
                @keyframes latidoMic        { 0%,100% { transform: scale(1);   } 50% { transform: scale(1.05); } }
                @keyframes entradaIzquierda { from { opacity:0; transform: translateX(-40px); } to { opacity:1; transform: translateX(0); } }
                @keyframes entradaDerecha   { from { opacity:0; transform: translateX(40px);  } to { opacity:1; transform: translateX(0); } }
            `}</style>
        </div>
    );
};

export default Landing;
