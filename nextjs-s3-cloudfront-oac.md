# Deploy Next.js estático en AWS con S3 + CloudFront (OAC)

Este documento describe la **configuración correcta y recomendada** para desplegar una aplicación **Next.js exportada como estática** usando:

- Amazon S3 (bucket **NO público**)
- Amazon CloudFront
- Origin Access Control (OAC)

Configuración probada y validada para evitar errores **403 AccessDenied**.

---

## 1. Build correcto de Next.js

### `next.config.js`

```js
module.exports = {
  output: 'export',
};
```

### Build limpio

```bash
rm -rf .next out
npm run build
```

El build generará la carpeta:

```
out/
 ├── index.html
 ├── _next/
 └── assets...
```

⚠️ **Importante**: el archivo `index.html` debe existir en la raíz.

---

## 2. Subida correcta a S3

Sube **el contenido** de la carpeta `out`, no la carpeta completa:

```bash
aws s3 sync out/ s3://TU_BUCKET --delete
```

Estructura final en el bucket:

```
s3://TU_BUCKET/
 ├── index.html
 ├── _next/
 └── ...
```

---

## 3. Configuración del Bucket S3

### Bloqueo de acceso público
- **Block all public access**: ✅ ACTIVADO

### Static Website Hosting
❌ **NO usar** (no se necesita con OAC)

---

## 4. CloudFront – Configuración del Origen

- **Origin type**: Amazon S3
- **Bucket**: `TU_BUCKET`
- ❌ NO usar endpoint website
- **Origin Access Control (OAC)**: ✅ ACTIVADO

---

## 5. Bucket Policy (OBLIGATORIA)

Permite que **solo CloudFront** lea los archivos:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowCloudFrontRead",
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudfront.amazonaws.com"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::TU_BUCKET/*",
      "Condition": {
        "StringEquals": {
          "AWS:SourceArn": "arn:aws:cloudfront::TU_ACCOUNT_ID:distribution/TU_DISTRIBUTION_ID"
        }
      }
    }
  ]
}
```

---

## 6. CloudFront – Default Root Object (CLAVE)

En la distribución:

```
Default Root Object: index.html
```

⚠️ Si esto no se configura, CloudFront solicitará `/` y S3 responderá `AccessDenied`.

---

## 7. Manejo de rutas SPA (recomendado)

Para soportar rutas como `/login`, `/dashboard`:

### CloudFront → Error Pages

| Error | Path | HTTP |
|-----|-----|-----|
| 403 | /index.html | 200 |
| 404 | /index.html | 200 |

---

## 8. Pruebas rápidas de validación

- ✅ `https://TU_DISTRIBUTION.cloudfront.net/index.html`
- ✅ `https://TU_DISTRIBUTION.cloudfront.net/`

Si `/index.html` carga pero `/` no → falta **Default Root Object**.

---

## 9. Errores comunes (y cómo evitarlos)

| Error | Causa |
|-----|-----|
403 AccessDenied | Bucket sin policy para OAC |
403 XML AccessDenied | Falta `index.html` |
403 al entrar a `/` | Falta Default Root Object |
404 en rutas | No configuraste Error Pages |

---

## 10. Conclusión

✅ **Configuración recomendada y segura**  
- S3 privado  
- CloudFront con OAC  
- Next.js exportado  
- `index.html` como root  

Esta es la forma correcta y moderna de desplegar un frontend estático en AWS.

---

Autor: Documentación interna  
Fecha: 2025
