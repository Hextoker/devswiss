# Contributing to DevSwiss

Gracias por aportar a DevSwiss. Este repo prioriza privacidad, velocidad percibida y herramientas simples de usar.

## Requisitos
- Node.js LTS + npm
- Docker y Docker Compose (opcional, para stack completo)

## Levantar el proyecto con Docker
1. Clona el repo y entra al directorio.
2. Si vas a usar Umami local, completa tus variables en `.env`.
3. Ejecuta:

```bash
docker-compose up -d
```

La app queda disponible en `http://localhost:3000`.

## Levantar el proyecto con npm
1. Instala dependencias:

```bash
npm install
```

2. Inicia el entorno de desarrollo:

```bash
npm run dev
```

La app queda disponible en `http://localhost:3000`.

## Flujo de trabajo sugerido
1. Haz un fork y crea una rama nueva:

```bash
git checkout -b feat/nueva-herramienta
```

2. Agrega la herramienta en `src/app/tools/<slug>/`.
3. Registra la metadata en `src/data/tools.ts`.
4. Actualiza rutas/descubrimiento cuando aplique:
   - `src/app/sitemap.ts`
   - `llms.txt`
5. Abre un Pull Request con contexto claro.

## Estandares de codigo
- Usa Tailwind para estilos (evita CSS inline salvo casos excepcionales).
- Usa iconos de `lucide-react` en la metadata de herramientas.
- Mantén el layout con `ToolLayout` para consistencia visual.
- Processing **100% local** para payloads sensibles (Privacy-First).
- Respuesta perceptible en **< 100ms** (Ley de los 100ms).
- Incluye una explicacion tecnica breve (Pedagogia con IA).

## Checklist antes de abrir el PR
- [ ] La herramienta corre localmente sin enviar datos a servidores.
- [ ] La UX es zero-friction (auto-focus, pocos pasos).
- [ ] Metadata y rutas actualizadas.
- [ ] Explicacion tecnica incluida en la herramienta.
