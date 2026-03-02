# Guia de Estilo de Herramientas

Esta guia define la experiencia base para cualquier herramienta nueva en DevSwiss.

## Filosofia de Diseno
- **Zero Friccion**: el usuario debe resolver en 1 pantalla y sin pasos extra.
- **Auto-focus**: el input principal recibe foco inmediato.
- **Ley de los 100ms**: feedback visible en menos de 100ms; evita latencias de red.
- **Privacy-First**: procesamiento local, sin enviar payloads sensibles.

## Pedagogia con IA
Cada herramienta nueva debe incluir una explicacion tecnica breve de como funciona:
- Algoritmo, formula o estandar utilizado.
- Tradeoffs o limitaciones relevantes.
- Por que el resultado es correcto.

## Estandares de implementacion
- Usa `ToolLayout` para mantener consistencia visual.
- Estilos con Tailwind CSS.
- Iconos de `lucide-react` en la metadata.
