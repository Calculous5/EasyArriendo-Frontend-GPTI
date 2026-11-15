# EasyArriendo React

Frontend funcional con datos mock basado en el mock-up de la aplicacion.

## Arrancar

Requiere Node.js 22.12 o superior (verificado con Node 24.20) y npm.

```powershell
npm install
npm run dev
```


```powershell
npm test
npm run lint
npm run build
npm run preview
```

`build` genera `dist/`. Las rutas usan hash (`/#/propiedad/3`) para poder actualizar, usar atrás/adelante y servir en hosting estático sin reglas especiales.

## Flujo

1. Buscar por comuna o dirección; abrir Filtros para arriendo, dormitorios, baños y superficie. El listado pagina de cuatro en cuatro y permite ordenar.
2. Seleccionar al menos dos propiedades (tres aparecen seleccionadas para reproducir la demo original).
3. Configurar destino, transporte, días, ponderación y valor por hora. Comparar presenta los componentes lado a lado.
4. Entrar con la cuenta demo para ver el ranking, guardar favoritos y editar el perfil. No se solicita contraseña ni se simula autenticación segura.
5. Abrir el detalle, consultar el desglose y probar el formulario de contacto. El mensaje no se envía.

## Organización

- `src/views/`: listado, preferencias, comparación/ranking, detalle y perfil, cada vista en su archivo.
- `src/components/`: cabecera, tarjetas, pasos, desglose, esquema de mapa, ilustraciones y modal accesible.
- `src/data/properties.js`: propiedades, destinos, transportes y preferencias iniciales.
- `src/services/calculations.js`: filtros, validación, estimaciones, formato CLP y ranking, independientes de React.
- `src/App.jsx`: composición, navegación y estado de la sesión.
- `tests/`: pruebas del cálculo, filtros, ranking y errores de datos.

