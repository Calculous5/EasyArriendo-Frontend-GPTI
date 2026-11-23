# EasyArriendo · Frontend

Frontend en React (Vite) del MVP EasyArriendo (GPTI, Grupo 8). Toda la información viene del backend FastAPI (`EasyArriendo-Backend-GPTI`).

## Arrancar

Requiere Node.js 22.12 o superior y el backend corriendo (por defecto en `http://127.0.0.1:8000`).

```bash
npm install
cp .env.example .env.local   # opcional: VITE_API_URL y VITE_MAPBOX_PUBLIC_TOKEN
npm run dev
```

```bash
npm test
npm run lint
npm run build
```

Las rutas usan hash (`/#/propiedad/3`), así se puede servir como sitio estático sin reglas especiales.

## Variables

| Variable | Uso |
| --- | --- |
| `VITE_API_URL` | URL del backend. |
| `VITE_MAPBOX_PUBLIC_TOKEN` | Token **público** de Mapbox, restringido por URL. Sin él se muestra un esquema de ubicación en vez del mapa. |

## Flujo

1. **Buscar:** por comuna o dirección, con filtros de arriendo, dormitorios, baños, superficie y las casillas *Admite mascotas* y *Con estacionamiento* (SC-01).
2. **Seleccionar:** al menos dos propiedades para comparar.
3. **Preferencias:** dirección de trabajo o estudio (con sugerencias), medio de transporte, días por semana e importancia del costo frente al tiempo, en pasos de 10.
4. **Comparar:** cualquier visitante ve la tabla con el costo real y la opción más conveniente. Los datos del visitante viven solo en la sesión del navegador.
5. **Ranking:** con cuenta verificada se obtiene el ranking explicado, que se puede compartir por enlace o WhatsApp (SC-02). Quien abre el enlace ve el orden y el costo total, sin desglose ni ubicación.
6. **Mi cuenta:** editar datos y contraseña, guardar preferencias, favoritos, descargar los datos y eliminar la cuenta.

## Organización

- `src/api/`: cliente HTTP (`client.js`) y adaptadores de las respuestas.
- `src/hooks/useEstimates.js`: costo real de un grupo de propiedades.
- `src/views/`: listado, preferencias, comparación, ranking, ranking compartido, detalle, cuenta y autenticación.
- `src/components/`: cabecera, tarjetas, pasos, desglose, mapa y modal.
- `docs/backend-roadmap.md`: estado del proyecto, modelo de datos y plan.

## Despliegue gratuito en Render

*New → Static Site* con este repositorio:

- **Build command:** `npm ci && npm run build`
- **Publish directory:** `dist`
- **Variables:** `VITE_API_URL` y `VITE_MAPBOX_PUBLIC_TOKEN`

La URL del sitio debe estar en `CORS_ORIGINS` y `FRONTEND_URL` del backend.
