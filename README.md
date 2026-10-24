# FSckDy

Repaso espaciado para la prueba **DAM 2026** (código 3015, Costa Rica). Pensada para el teléfono: se instala como app, funciona sin conexión y te dice qué estudiar hoy en lugar de darte una lista infinita.

**En vivo:** https://fsckdy.web.app

## Qué hace

- **Sesión de 10 tarjetas** priorizando lo que ya toca repasar (algoritmo SM-2).
- **Feedback inmediato** con explicación de cada respuesta.
- **Progreso**: racha de días, precisión, mapa de 30 días y cobertura por materia.
- **Banco de preguntas** con búsqueda y filtro por materia.
- **Tema oscuro/claro**, exportación de datos y borrado de progreso.
- **Offline e instalable** (PWA + IndexedDB).

## Contenido

50 preguntas distribuidas según la tabla de especificaciones oficial de DAM 2026:

| Materia | Ítems |
|---|---|
| Lógica y algoritmos | 8 |
| Hardware móvil | 6 |
| UI y patrones | 6 |
| Firebase | 5 |
| Ciberseguridad | 5 |
| Entorno web | 3 |
| Bases de datos | 3 |
| Emprendimiento | 3 |
| Servicio al cliente | 3 |
| Eficiencia energética | 3 |
| Phishing | 3 |
| Ciudadano digital | 2 |

## Stack

React 19 · TypeScript · Vite · Tailwind CSS v4 · Dexie (IndexedDB) · Zustand · vite-plugin-pwa · Firebase Hosting

## Desarrollo

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # tsc -b && vite build
npm run preview
```

## Despliegue

```bash
npm run build
firebase deploy --only hosting
```

Firebase Hosting sirve `dist/` con rewrite a `index.html` para las rutas del SPA.

## Arquitectura

```
src/
├── app/Layout.tsx        # shell + tab bar inferior
├── features/
│   ├── hoy/              # pantalla de inicio y cola del día
│   ├── sesion/           # motor de repaso
│   ├── progreso/         # racha, estadísticas, heatmap
│   ├── banco/            # explorador de preguntas
│   └── ajustes/          # tema, exportar, reiniciar
├── lib/
│   ├── sm2.ts            # algoritmo de repaso espaciado
│   ├── db.ts             # Dexie + cálculo de racha
│   └── store.ts          # estado global (Zustand)
└── data/preguntas.ts     # contenido
```

## Roadmap

- [ ] Backend propio (Node + PostgreSQL) con cuentas y sincronización entre dispositivos
- [ ] Editor de preguntas
- [ ] Simulacro cronometrado de 34 ítems
- [ ] Estadísticas por tema, no solo por materia

## Nota

v0.1.0 guarda el progreso **solo en el dispositivo**. No hay cuentas ni sincronización todavía; eso llega con la API propia.
