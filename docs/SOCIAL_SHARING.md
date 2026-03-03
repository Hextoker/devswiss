# 📱 Sistema de Generación de Imágenes OG para Redes Sociales

## ✅ Problema Resuelto

El error de compilación `Cannot read properties of undefined (reading 'replace')` que ocurría durante la precompilación de la página `/tools/security-audit` ha sido corregido.

## 🚀 Nuevas Características Implementadas

Se ha creado un **sistema robusto y automático** para generar imágenes optimizadas para diferentes redes sociales:

### 1. **API Principal OG Mejorada** (`/api/og`)
- ✅ Soporta múltiples redes sociales: LinkedIn, Facebook, Instagram, Twitter
- ✅ Generación automática de imágenes con dimensiones optimizadas
- ✅ Colores de acento personalizados por herramienta
- ✅ Manejo robusto de errores y parámetros undefined
- ✅ Runtime en Edge para máxima velocidad

### 2. **API de Imágenes Sociales** (`/api/social-image`)
- Instagram: Formato cuadrado optimizado (1080x1080)
- Pinterest: Formato alto y vertical (1000x1500)
- LinkedIn: Formato óptimo para redes profesionales (1200x627)
- Twitter/X: Formato optimizado para feeds (1024x576)
- Facebook: Formato universal (1200x630)

### 3. **Utilidad de Constructor OG** (`src/utils/ogImageBuilder.ts`)
```typescript
// Genera URLs OG con parámetros
generateOGImageUrl(config: OGImageConfig): string

// Obtiene configuración optimizada por red social
getOptimizedOGConfig(baseConfig, socialNetwork): { url, width, height }

// Genera metadatos OpenGraph completos
generateToolOGMetadata(config): Metadata

// Construye URLs para compartir en redes
buildShareUrls(pageUrl, config): ShareURLs
```

### 4. **Componente ShareButton Mejorado**
- Botón principal con indicador de copia
- Menú desplegable con opciones de redes sociales
- Soporte para: LinkedIn, Facebook, Twitter/X
- Copia directa de enlace

### 5. **Metadatos Dinámicos Automáticos**
- Cada herramienta genera automáticamente imágenes OG personalizadas
- Colores de acento específicos por herramienta
- Descripciones optimizadas para cada red social

## 📊 Dimensiones de Imágenes por Red Social

| Red Social | Ancho | Alto | Formato |
|-----------|-------|------|---------|
| LinkedIn | 1200 | 627 | Profesional |
| Facebook | 1200 | 630 | Universal |
| Instagram | 1080 | 1080 | Cuadrado |
| Twitter | 1024 | 576 | Compacto |
| Pinterest | 1000 | 1500 | Vertical |

## 🎨 Uso en las Herramientas

### Ejemplo de Uso en Componentes

```tsx
import { ShareButton } from '@/components/ShareButton';

export default function ToolPage() {
    return (
        <>
            <ShareButton 
                title="Security Audit - DevSwiss"
                description="Detecta hashes y evalúa seguridad"
            />
        </>
    );
}
```

### Generar URLs OG Personalizadas

```tsx
import { generateOGImageUrl, buildShareUrls } from '@/utils/ogImageBuilder';

// URL para LinkedIn
const linkedinUrl = generateOGImageUrl({
    title: 'JWT Inspector',
    description: 'Inspecciona tokens JWT',
    accent: 'blue',
    socialNetwork: 'linkedin'
});

// URLs de compartir
const shareUrls = buildShareUrls(
    'https://devswiss.cl/tools/jwt-inspector',
    { title: 'JWT Inspector', description: 'Tool description' }
);
```

## 🔧 Personalización por Red Social

### LinkedIn
```typescript
getOptimizedOGConfig(config, 'linkedin')
// Dimensiones: 1200x627 (formato profesional)
```

### Instagram
```typescript
getOptimizedOGConfig(config, 'instagram')
// Dimensiones: 1080x1080 (cuadrado perfecto)
```

### Pinterest
```typescript
getOptimizedOGConfig(config, 'pinterest')
// Dimensiones: 1000x1500 (formato alto)
```

## 📋 Cambios Realizados

### Archivos Creados
- ✅ `src/utils/ogImageBuilder.ts` - Utilidad central para OG images
- ✅ `src/app/api/social-image/route.tsx` - API de imágenes sociales
- ✅ `docs/SOCIAL_SHARING.md` - Esta documentación

### Archivos Modificados
- ✅ `src/app/api/og/route.tsx` - Mejorado y refactorizado
- ✅ `src/app/tools/[id]/page.tsx` - Metadata dinámico y robusto
- ✅ `src/components/ShareButton.tsx` - Componente mejorado con opciones sociales

## 🐛 Problemas Corregidos

1. **Error de Precompilación**: Corregido el manejo de parámetros undefined en `toTitleCase`
2. **Robustez OG**: Mejoramiento del manejo de errores en la ruta `/api/og`
3. **Types**: Corrección de tipos TypeScript en funciones de generación

## 🚀 Características Futuras

- [ ] Generar imágenes OG con vista previa en tiempo real
- [ ] Dashboard de analítica de compartidos
- [ ] Customización de templates OG
- [ ] Soporte para WhatsApp Business
- [ ] Preview de imágenes antes de compartir

## 🔍 Verificación

Para verificar que todo funciona correctamente:

```bash
npm run build  # Compilación sin errores
npm run dev    # Modo desarrollo para pruebas
```

### URLs de Prueba

- `http://localhost:3000/api/og?title=Test&description=Description`
- `http://localhost:3000/api/social-image?title=Test&platform=instagram`
- `http://localhost:3000/tools/security-audit` - Con metadatos OG automáticos

## 📚 Recursos

- [OpenGraph Specification](https://ogp.me/)
- [Next.js OG Image Generation](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image)
- [Social Media Best Practices](https://buffer.com/library/social-media-image-sizes)
