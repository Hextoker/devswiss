# 🛠️ DevSwiss: Manifesto & Business Rules

## 1. Nuestra Misión
"Centralizar la utilidad en el desarrollo web, eliminando las barreras de registro y fragmentación mediante una navaja suiza de herramientas intuitivas, privadas y potenciadas por IA que educan mientras resuelven."

## 2. Objetivos Estratégicos
Zero Fricción: Permitir que cualquier desarrollador acceda a soluciones técnicas en menos de 3 clics o una sola búsqueda.

Privacidad por Diseño: Garantizar que los datos sensibles (RUTs, JSONs, Hashes) se procesen localmente y nunca toquen un servidor externo sin consentimiento.

Cerrar la Brecha de Conocimiento: No solo entregar un resultado, sino explicar el "por qué" técnico mediante asistencia de IA para desarrolladores Junior y Senior.

Persistencia sin Cuentas: Ofrecer una experiencia personalizada (favoritos y recientes) basada exclusivamente en almacenamiento local nativo.

## 3. Reglas del Juego (Business Rules)
Para mantener la coherencia del producto a medida que crezca, cada nueva herramienta o funcionalidad debe cumplir con estas reglas:

### A. Reglas de Producto
Ley del Registro Zero: Ninguna funcionalidad principal (validar, formatear, generar) puede estar bloqueada tras un formulario de registro o pago.

Interfaz "Command-First": El buscador central es el corazón de la app; todas las herramientas deben ser invocables mediante parámetros desde la barra de búsqueda (Quick Actions).

Modularidad Atómica: Cada herramienta debe ser independiente, permitiendo que la plataforma crezca sin añadir peso innecesario a otras secciones.

### B. Reglas de Ingeniería (Stack Técnico)
Client-Side First: Si la lógica puede ejecutarse en el navegador (JS/TS/WASM), debe hacerse ahí para maximizar la velocidad y privacidad.

Rendimiento "Blink-Test": Los filtros del buscador y la carga de herramientas favoritas deben responder en menos de 100ms.

Estado Nativo: La persistencia de preferencias debe usar la API de localStorage para asegurar que el usuario sea el único dueño de sus datos.

### C. Reglas de Educación (IA)
Contextualidad: Las explicaciones de IA no deben ser genéricas; deben basarse en los datos que el usuario tiene en pantalla (ej: explicar específicamente la expresión Regular que el usuario escribió).

Tono Ayudante: La IA debe actuar como un compañero de equipo Senior: directo, técnico pero accesible, y libre de relleno innecesario.

## Comenzando

Primero, ejecuta el servidor de desarrollo:

```bash
npm run dev
# o
yarn dev
# o
pnpm dev
# o
bun dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver el resultado.

Puedes comenzar a editar la página modificando `app/page.tsx`. La página se actualiza automáticamente a medida que editas el archivo.

Este proyecto utiliza [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) para optimizar y cargar automáticamente [Geist](https://vercel.com/font), una nueva familia tipográfica de Vercel.


## Dependencias instaladas


### Dependencias principales

- **next**: Framework de React para aplicaciones web modernas, con renderizado del lado del servidor y generación de sitios estáticos.
- **react**: Biblioteca principal para construir interfaces de usuario basadas en componentes.
- **react-dom**: Permite renderizar componentes de React en el DOM del navegador.
- **zustand**: Librería ligera para manejo de estado global en aplicaciones React.


### Dependencias de desarrollo

- **@tailwindcss/postcss**: Integración de Tailwind CSS con PostCSS para procesamiento de estilos.
- **@types/node**: Tipos de TypeScript para Node.js, necesarios para el desarrollo y compilación.
- **@types/react**: Tipos de TypeScript para React.
- **@types/react-dom**: Tipos de TypeScript para React DOM.
- **eslint**: Herramienta para análisis y formateo de código, ayuda a mantener buenas prácticas.
- **eslint-config-next**: Configuración recomendada de ESLint para proyectos Next.js.
- **tailwindcss**: Framework de utilidades CSS para crear interfaces modernas y responsivas.
- **typescript**: Superset de JavaScript que añade tipado estático, mejorando la robustez del código.


## Aprende más

Para aprender más sobre Next.js, revisa los siguientes recursos:

- [Documentación de Next.js](https://nextjs.org/docs) - aprende sobre las características y API de Next.js.
- [Aprende Next.js](https://nextjs.org/learn) - un tutorial interactivo de Next.js.

También puedes visitar [el repositorio de Next.js en GitHub](https://github.com/vercel/next.js); tus comentarios y contribuciones son bienvenidos.


## Despliegue en Vercel

La forma más sencilla de desplegar tu aplicación Next.js es usando la [Plataforma Vercel](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) de los creadores de Next.js.

Consulta nuestra [documentación de despliegue de Next.js](https://nextjs.org/docs/app/building-your-application/deploying) para más detalles.
