# 📻 App Primicia - Emisora Digital

> Una plataforma moderna y completa para la gestión y transmisión de contenido radiofónico digital. Primicia Comunal del Cesar, conectando comunidades a través del sonido.

---

## 🎯 Descripción

**App Primicia** es una aplicación web de última generación diseñada para ser una emisora digital integral. Proporciona herramientas completas para la administración de contenido, gestión de programas, locutores y campañas publicitarias, todo en una interfaz moderna y reactiva.

### ✨ Características Principales

- 📅 **Gestión de Agenda** - Planifica y organiza la programación de la emisora
- 🎤 **Administración de Locutores** - Gestiona perfiles y horarios de locutores
- 📻 **Gestión de Programas** - Crea y edita programas de radio
- 📊 **Dashboard Interactivo** - Visualiza estadísticas y métricas en tiempo real
- 🎨 **Temas Personalizables** - Múltiples temas visuales disponibles
- 🔐 **Sistema de Autenticación** - Control de acceso basado en roles
- 💼 **Gestión de Clientes** - Administra anunciantes y campañas
- ⚙️ **Configuración Avanzada** - Panel de control para SuperAdmin

---

## 🛠️ Stack Tecnológico

### Frontend
- **Framework**: React 19.2.5
- **Build Tool**: Vite
- **Enrutamiento**: React Router DOM 7.15.0
- **UI Components**: PrimeReact 10.9.7
- **Styling**: PrimeFlex, SCSS
- **Icons**: PrimeIcons 7.0.0
- **Charts**: Chart.js 4.2.1

### Desarrollo
- **Linting**: ESLint 10.2.1
- **Compilador CSS**: SASS 1.99.0
- **Node**: Módulos ES

---

## 📦 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** >= 16.x
- **npm** >= 8.x o **yarn** >= 1.22.x

---

## 🚀 Instalación y Configuración

### 1. Clonar el repositorio

\`\`\`bash
git clone https://github.com/tu-usuario/app-primicia.git
cd app-primicia/app
\`\`\`

### 2. Instalar dependencias

\`\`\`bash
npm install
# o con yarn
yarn install
\`\`\`

### 3. Configurar variables de entorno

Crea un archivo \`.env\` en la raíz del proyecto:

\`\`\`env
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=App Primicia
\`\`\`

---

## 💻 Scripts Disponibles

### Desarrollo

\`\`\`bash
npm run dev
\`\`\`
Inicia el servidor de desarrollo en modo hot-reload.  
Accede a: `http://localhost:5173`

### Build para Producción

\`\`\`bash
npm run build
\`\`\`
Compila la aplicación para producción en la carpeta `dist/`.

### Vista Previa de Build

\`\`\`bash
npm run preview
\`\`\`
Visualiza localmente la versión compilada.

### Linting

\`\`\`bash
npm run lint
\`\`\`
Verifica el código con ESLint.

---

## 📁 Estructura del Proyecto

\`\`\`
app-primicia/
├── app/                          # Aplicación React
│   ├── src/
│   │   ├── features/            # Módulos de funcionalidades
│   │   │   ├── agenda/          # Gestión de agenda
│   │   │   ├── auth/            # Autenticación
│   │   │   ├── campanas/        # Campañas publicitarias
│   │   │   ├── clientes/        # Gestión de clientes
│   │   │   ├── configuracion/   # Panel de configuración
│   │   │   ├── dashboard/       # Dashboard principal
│   │   │   ├── locutores/       # Administración de locutores
│   │   │   ├── programas/       # Gestión de programas
│   │   │   └── shared/          # Componentes compartidos
│   │   ├── layout/              # Componentes de layout
│   │   ├── routes/              # Rutas de la aplicación
│   │   ├── services/            # Servicios HTTP
│   │   ├── core/                # Funcionalidades core
│   │   │   ├── components/      # Componentes reutilizables
│   │   │   ├── helpers/         # Funciones auxiliares
│   │   │   └── hooks/           # Custom React hooks
│   │   ├── lib/                 # Librerías y constantes
│   │   ├── pages/               # Páginas principales
│   │   ├── assets/              # Recursos estáticos
│   │   ├── styles/              # Estilos globales
│   │   ├── App.jsx              # Componente raíz
│   │   └── main.jsx             # Punto de entrada
│   ├── public/                  # Archivos públicos
│   │   ├── themes/              # Temas disponibles
│   │   ├── layout/              # Recursos de layout
│   │   └── demo/                # Datos de demostración
│   ├── vite.config.js
│   ├── package.json
│   └── eslint.config.js
└── sakai-react/                 # Template base (referencia)

\`\`\`

---

## 🎨 Temas Disponibles

App Primicia incluye una amplia variedad de temas profesionales:

### Bootstrap Themes
- Bootstrap4 Dark Blue
- Bootstrap4 Dark Purple
- Bootstrap4 Light Blue
- Bootstrap4 Light Purple

### Lara Themes (PrimeReact)
- Lara Dark (Amber, Blue, Cyan, Green, Indigo, Pink, Purple, Teal)
- Lara Light (Amber, Blue, Cyan, Green, Indigo, Pink, Purple, Teal)

### Material Design Themes
- MD Dark DeepPurple / Indigo
- MD Light DeepPurple / Indigo
- MDC Dark DeepPurple / Indigo
- MDC Light DeepPurple / Indigo

### Otros Temas
- Soho Dark / Light
- Viva Dark / Light

---

## 🔐 Autenticación y Roles

La aplicación soporta múltiples roles de usuario:

- **SuperAdmin**: Acceso total al sistema
- **Usuario**: Acceso limitado según permisos

Cada ruta está protegida según el nivel de acceso del usuario.

---

## 📱 Responsividad

La aplicación está diseñada para ser completamente responsiva y adaptarse a:
- 📱 Dispositivos móviles
- 📲 Tablets
- 💻 Computadoras de escritorio

---

## 🐛 Reportar Problemas

Si encuentras un bug o tienes una sugerencia de mejora, por favor:

1. Abre un **Issue** en el repositorio
2. Describe el problema detalladamente
3. Incluye pasos para reproducir (si es un bug)
4. Comparte capturas de pantalla si es relevante

---

## 🤝 Contribuciones

Las contribuciones son bienvenidas! Para contribuir:

1. Fork el repositorio
2. Crea una rama para tu feature (\`git checkout -b feature/AmazingFeature\`)
3. Haz commit de tus cambios (\`git commit -m 'Add some AmazingFeature'\`)
4. Push a la rama (\`git push origin feature/AmazingFeature\`)
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver archivo `LICENSE.md` para más detalles.

---

## 👥 Equipo

**App Primicia** es desarrollado y mantenido por el equipo de Primicia Comunal del Cesar.

---

## 📞 Soporte

¿Necesitas ayuda? Contacta a nuestro equipo de soporte:
- 📧 Email: [soporte@primiciadelaradio.com](mailto:soporte@primiciadelaradio.com)
- 💬 Discord: [Comunidad Primicia](https://discord.gg/primicia)

---

## 🙏 Agradecimientos

- [PrimeReact](https://primereact.org/) - Componentes UI premium
- [Vite](https://vitejs.dev/) - Build tool ultrarrápido
- [React](https://react.dev/) - Biblioteca de UI

---

**Hecho con ❤️ para la comunidad de Cesar**
