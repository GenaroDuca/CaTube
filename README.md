## 🎬 CaTube – Guía de Buenas Prácticas y Estructura del Proyecto

## 🧠 Filosofía del Proyecto
        CaTube es una plataforma de videos inspirada en YouTube, desarrollada con React. El objetivo es construir una aplicación modular, escalable y mantenible, siguiendo buenas prácticas de desarrollo frontend moderno.

## 📁 Estructura del Proyecto
        backend/
        ├──src
        │    ├── auth/
        │    ├── channels/
        │    ├── comments/
        │    ├── likes/
        │    ├── playlist/
        │    ├── playlist_videos/
        │    ├── product/
        │    ├── store/
        │    ├── subs/
        │    ├── users/
        │    └── videos/
        ├── test/
        ├── uploads/ 
        ├── package.json
        ├── tsconfig.json
        └── nest-cli.json

        frontend
        ├──src/
        │    ├── public/             # Logo Catube
        │    └── src/
        │       ├──assets/           # Imágenes, fuentes, iconos
        │       ├── components/      # Componentes agrupados por funcionalidad
        │       │   ├── common/      # Componentes generales
        │       │   ├── header/
        │       │   ├── search/
        │       │   ├── user/
        │       │   ├── notifications/
        │       │   └── etc/
        │       ├── hooks/           # Custom hooks reutilizables
        │       ├── pages/           # Páginas principales
        │       ├── styles/          # Estilos globales (si se usan)
        │       ├── main.jsx/        # Funciones y utilidades
        │       └── App.jsx          # Componente raíz
        └──package.json

## ✅ Buenas Prácticas
        1. Componentes Modulares
            -Separar lógica, presentación y estilos.
            -Usar nombres claros y consistentes (SearchBar.jsx, UserMenu.jsx).
            -Evitar componentes monolíticos; dividir en subcomponentes si es necesario.

        2. Estilos Locales con CSS Modules
            -Usar archivos .module.css para evitar conflictos de clases.
            -Ejemplo:
                jsx
                    import styles from './SearchBar.module.css';
                    <input className={styles.input} />

        3. Hooks Personalizados
            -Centralizar lógica reutilizable en hooks/.
            -Ejemplos útiles:
                -useClickOutside.js → para cerrar menús al hacer clic fuera.
                -useDebounce.js → para inputs de búsqueda.
                -useFetchVideos.js → para llamadas a la API.

        4. Rutas con React Router
            -Usar BrowserRouter, Routes, y Outlet para navegación.
            -Crear un Layout.jsx con el Header y espacio para vistas dinámicas.

        5. Manejo de Estado
            -Usar useState, useEffect, y useContext según necesidad.
            -Para estados globales más complejos, considerar Zustand o Redux (si el curso lo permite más adelante).

        6. Convenciones de Código
            -PascalCase para componentes.
            -camelCase para funciones y variables.
            -Evitar abreviaciones confusas.
            -Comentarios claros y concisos.

## 🔍 Hooks en React – Explicación Básica
        Hook	        Uso principal	                                    Ejemplo breve
        useState	    Manejo de estado local	                            const [query, setQuery] = useState('')
        useEffect	    Efectos secundarios (fetch, timers, etc.)	        useEffect(() => {}, [query])
        useRef	        Referencias a elementos DOM	                        const inputRef = useRef(null)
        useContext	    Compartir estado entre componentes	                const user = useContext(UserContext)
        useReducer	    Alternativa a useState para lógica compleja	        const [state, dispatch] = useReducer(...)
        useMemo	        moización de valores calculados	                    const result = useMemo(() => ..., [deps])
        useCallback	    Memoización de funciones	                        const handleClick = useCallback(..., [deps])

## 🧪 Testing

> *Esta sección está pensada para futuras etapas del proyecto.*

        - Usar **Jest** y **React Testing Library** para testear componentes de forma aislada.
        - Crear archivos de test con la extensión `.test.jsx` o `.spec.jsx`.
        - Ubicar los tests junto al componente o en una carpeta `__tests__`.
        - Priorizar pruebas de:
        - Renderizado correcto
        - Comportamiento de eventos (clicks, inputs)
        - Lógica condicional
        - Integración con hooks personalizados

        Ejemplo básico:
        ```jsx
        import { render, screen } from '@testing-library/react';
        import SearchBar from './SearchBar';

        test('renderiza el input de búsqueda', () => {
        render(<SearchBar />);
        expect(screen.getByPlaceholderText(/buscar/i)).toBeInTheDocument();
        });

##   🚀 Deployment
            -CaTube se desarrolla con Vite para una experiencia de desarrollo rápida y moderna.
            -Pasos para produccion
                1. Ejecutar el build: npm run build
                2. Servir el contenido con un servidor estático: npm run preview
                3. Configurar vite.config.js si se usan rutas personalizadas o assets externos.
    
##  Hosting sugerido:
        -Netlify
        -Vercel
        -GitHub Pages (con configuración adicional)

##   👥 Créditos y Colaboradores
            Este proyecto está siendo desarrollado por el medievalCats como parte de una migración de HTML/JS puro a React. Cada integrante está encargado de una sección modular del sitio, con el objetivo de integrarlas en una plataforma completa y funcional.

## Link de la documentación del proyecto:
    https://drive.google.com/drive/folders/1GrGI1Q2Ge9Uz1J91FYc3nlkiKxUUxbSm

## Dependencias
    npm install class-validator class-transformer
    npm install typeorm reflect-metadata
    npm install mysql2
    npm install @nestjs/core @nestjs/common reflect-metadata
    npm install @nestjs/typeorm
    npm install -D @types/bcrypt
    npm install bcrypt
    npm install -D @types/passport-jwt
    npm install @nestjs/jwt @nestjs/passport passport passport-jwt
    npm install @nestjs/platform-express
    npm install @nestjs/mapped-types
    npm install --save @fortawesome/fontawesome-svg-core
    npm install --save @fortawesome/free-solid-svg-icons
    npm install --save @fortawesome/react-fontawesome
    npm install react-router-dom
    npm install react-icons


## Crear proyecto React con Vite
    npm create vite@latest

## Diagrama de flujo:
![alt text](<media/flow_diagram/flow_diagram.png>)
