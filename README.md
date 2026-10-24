# FSckDy

Repaso espaciado para la prueba **DAM 2026** (código 3015, Costa Rica). Pensada para el teléfono: se instala como app, funciona sin conexión y te dice qué estudiar hoy en lugar de darte una lista infinita.

**En vivo:** https://fsckdy.web.app

## Qué hace

- **Ruta de 17 unidades**: teoría corta y quiz de 5 preguntas por unidad. Se domina con 80%.
- **Repaso** de 10 tarjetas priorizando lo que ya toca (algoritmo SM-2).
- **Feedback inmediato** con explicación de cada respuesta.
- **Progreso**: racha de días, precisión, mapa de 30 días y cobertura por materia.
- **Banco de preguntas** con búsqueda y filtro por materia.
- **Tema oscuro/claro**, exportación de datos y borrado de progreso.
- **Offline e instalable** (PWA + IndexedDB).

## Contenido

85 preguntas distribuidas según la tabla de especificaciones oficial de DAM 2026:

| Materia | Ítems |
|---|---|
| Lógica y algoritmos | 10 |
| Hardware móvil | 10 |
| UI y patrones | 10 |
| Firebase | 5 |
| Ciberseguridad | 5 |
| Entorno web | 5 |
| Bases de datos | 5 |
| Emprendimiento | 5 |
| Servicio al cliente | 5 |
| Eficiencia energética | 5 |
| Phishing | 5 |
| Ciudadano digital | 5 |
| IA y agentes | 10 |

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
│   ├── ruta/             # mapa de unidades y progreso
│   ├── leccion/          # teoría por unidad
│   ├── sesion/           # quiz de unidad y repaso SM-2
│   ├── progreso/         # racha, estadísticas, heatmap
│   ├── banco/            # explorador de preguntas
│   └── ajustes/          # tema, exportar, reiniciar
├── lib/
│   ├── sm2.ts            # algoritmo de repaso espaciado
│   ├── db.ts             # Dexie + cálculo de racha
│   └── store.ts          # estado global (Zustand)
├── data/unidades.ts      # 17 unidades con su lección
└── data/preguntas.ts     # 85 preguntas
```

## Roadmap

- [ ] Backend propio (Node + PostgreSQL) con cuentas y sincronización entre dispositivos
- [ ] Editor de preguntas
- [x] Teoría por unidad antes del quiz
- [ ] Simulacro cronometrado de 34 ítems
- [ ] Estadísticas por tema, no solo por materia

## Nota

v0.1.0 guarda el progreso **solo en el dispositivo**. No hay cuentas ni sincronización todavía; eso llega con la API propia.
