# DevSwiss — Contexto Operativo

Este archivo define las reglas que deben respetarse antes de proponer o implementar cambios.

## 1) Identidad del producto
- DevSwiss es una navaja suiza para developers con enfoque **privacy-first** y **zero-friction**.
- La plataforma debe educar mientras resuelve (IA explicativa contextual, no genérica).
- Ninguna funcionalidad principal se bloquea por registro/pago.

## 2) Reglas de arquitectura
- **Client-side first**: si una operación puede ejecutarse en navegador, se implementa en cliente.
- **Sin backend para datos de usuario**: no enviar payloads sensibles (RUT, JSON, hashes, tokens) a servidores.
- **Persistencia local**: favoritos/recientes/configuración en `localStorage`.
- **Modularidad atómica**: cada herramienta debe ser independiente y no añadir peso innecesario al resto.
- **Hosting**: despliegue en EC2 con Docker (no S3).

## 3) Reglas de navegación y UX
- El flujo principal es **Command-First** (Command Palette + Quick Actions).
- Las herramientas deben ser invocables por ruta y por intención desde búsqueda.
- Mantener consistencia visual y de layout con `ToolLayout` y patrones existentes.
- Priorizar claridad, velocidad percibida y acciones en ≤3 clics.

## 4) SEO y descubrimiento
- Respetar `metadata` por ruta (`title`, `description`, `openGraph` cuando aplique).
- Mantener coherencia entre:
	- `src/app/sitemap.ts`
	- `src/app/robots.ts`
	- `llms.txt`
	- Rutas reales en `src/app/tools/**/page.tsx`
- Toda herramienta nueva debe agregarse al `sitemap` y reflejarse en `llms.txt`.

## 5) Estándar llms.txt
- `llms.txt` describe capacidades reales, no roadmap hipotético.
- El inventario de herramientas debe estar actualizado con los slugs/rutas activas.
- Evitar afirmaciones de features de descubrimiento no implementadas en código.

## 6) Criterios de cambio
- Cambios mínimos, precisos y compatibles con la base actual.
- Evitar features “nice to have” fuera del requerimiento.
- Si hay ambigüedad, elegir la interpretación más simple que cumpla el objetivo.

## 7) Checklist antes de merge
- [ ] ¿Se mantiene procesamiento local para datos sensibles?
- [ ] ¿La herramienta/ruta aparece en navegación y búsqueda?
- [ ] ¿SEO metadata está presente y correcta?
- [ ] ¿`sitemap.ts` incluye la ruta?
- [ ] ¿`llms.txt` refleja el estado real?
