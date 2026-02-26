# DevSwiss

La navaja suiza definitiva para developers. DevSwiss es una suite de utilidades de alto rendimiento, enfocada en privacidad, con experiencia zero-friction y soporte pedagogico con IA.

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![Docker](https://img.shields.io/badge/Docker-ready-2496ED)](https://www.docker.com/)
[![Tailwind](https://img.shields.io/badge/TailwindCSS-38B2AC)](https://tailwindcss.com/)
[![Visit devswiss.cl](https://img.shields.io/badge/%F0%9F%8C%90-Visit%20devswiss.cl-00C853)](https://devswiss.cl)

## Propuesta de valor

DevSwiss se construye sobre tres pilares claros:

- **Privacy-First**: procesamiento local en el navegador; tus datos no salen del cliente.
- **Zero Friction**: todas las herramientas son accesibles desde una Command Palette con busqueda global.
- **Pedagogia con IA**: cada herramienta explica el por que tecnico, no solo el resultado.

## Arquitectura de despliegue

Disenado para correr en Docker, con un flujo simple y reproducible.

```
Usuario -> ALB -> Apache (Proxy) -> Docker (Next.js)
```

### Instrucciones rapidas

```bash
docker-compose up -d
```

## Privacidad y seguridad

DevSwiss prioriza la seguridad por diseno:

- La persistencia se mantiene en `localStorage` (favoritos, recientes, preferencias).
- Las operaciones criticas se ejecutan en el cliente (JS/TS/WASM), evitando enviar payloads sensibles a servidores.
- Esto reduce superficie de ataque y elimina riesgos de exfiltracion accidental.

## Monitoreo con Umami

DevSwiss incorpora Umami como analitica privacy-first para entender el uso real de la plataforma sin recolectar datos sensibles.

- **Cantidad de usuarios**: permite observar el volumen de usuarios activos y tendencias de crecimiento.
- **Uso por herramienta**: muestra que utilidades se usan mas y en que momentos, para priorizar mejoras.
- **Mejora continua**: los hallazgos guian optimizaciones, nuevas funcionalidades y ajustes de UX con impacto medible.

## Why Open Source?

La transparencia es vital cuando se procesan datos sensibles. Abrir el codigo permite a cualquier persona verificar que el tratamiento de RUT, JWT y otros payloads ocurre localmente, sin telemetria oculta ni dependencias opacas. Esa audibilidad es la base de la confianza en DevSwiss.

## Guia para IA (LLMs)

El archivo `llms.txt` describe rapidamente el contexto del proyecto para agentes de IA y herramientas de analisis. Si estas automatizando tareas o generando cambios, revisa primero `llms.txt`.

## Como contribuir

La colaboracion es bienvenida. Propuestas y PRs son el motor de DevSwiss.

1. Haz un fork y crea una rama con tu feature o fix.
2. Asegura que la herramienta mantenga el enfoque privacy-first y zero-friction.
3. Abre un Pull Request con una descripcion clara del problema y la solucion.

## Licencia

Este proyecto usa licencia MIT.
