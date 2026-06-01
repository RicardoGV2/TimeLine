# TimeLine — Civilization Roadmap App

## Objetivo

Crear una aplicación web estática, desplegable en GitHub Pages, para llevar una agenda estratégica de vida y desarrollo basada en metas por fecha y en 12 bases civilizacionales.

La app debe ayudar a responder constantemente:

> ¿Qué capacidades estamos construyendo y qué bases estamos descuidando?

---

## 12 bases civilizacionales

1. 🧠 **Inteligencia** — IA, agentes, automatización y ciencia asistida.
2. 🔭 **Conocimiento fundamental** — matemáticas, física, teoría profunda y comprensión de la realidad.
3. 🏛️ **Instituciones de investigación** — centros donde se concentra talento y se producen descubrimientos.
4. 🧬 **Vida** — medicina, cáncer, órganos artificiales, longevidad y bioseguridad.
5. ⚡ **Energía** — electricidad abundante, barata y resiliente.
6. 🏗️ **Materia** — materiales, robótica, manufactura y construcción.
7. 🌱 **Recursos y biosfera** — agua, comida, minerales, reciclaje, suelos, océanos y biodiversidad.
8. 🧩 **Mente** — neurociencia, connectomics, memoria, identidad y conciencia.
9. 🛡️ **Resiliencia** — apagones, pandemias, meteoritos, ciberataques, ciudades-arca y backups.
10. ⚖️ **Gobernanza** — poder extremo, IA, inmortales, derechos digitales, incentivos y economía post-trabajo.
11. 🚀 **Expansión** — Luna, Marte, asteroides, hábitats orbitales y civilizaciones backup.
12. 🔄 **Movimiento / Flujos** — transporte, logística, distribución, movilidad y transmisión de energía, información y materiales.

---

## Estructura recomendada del repositorio

```text
TimeLine/
│
├── index.html
├── README.md
├── instructions.md
│
├── src/
│   ├── styles.css
│   └── app.js
│
├── data/
│   ├── bases.json
│   ├── goals.json
│   ├── phases.json
│   └── reviews.json
│
└── docs/
    ├── vision.md
    ├── roadmap.md
    ├── bases.md
    └── review-process.md
```

---

## Modelo de datos

### `data/bases.json`

Cada base debe tener:

```json
{
  "id": "inteligencia",
  "emoji": "🧠",
  "name": "Inteligencia",
  "description": "IA, agentes, automatización y ciencia asistida.",
  "color": "#6366f1"
}
```

### `data/goals.json`

Cada meta debe tener:

```json
{
  "id": "jj-taco-2026",
  "year": "2026–2027",
  "emoji": "🌮",
  "title": "Nace JJTaco",
  "summary": "Lo que empezó como un sueño entre José + Janet se convierte en una marca con identidad propia, sabor mexicano y potencial de expansión.",
  "bases": ["recursos-biosfera", "movimiento-flujos", "gobernanza", "materia"],
  "status": "planned",
  "priority": "high",
  "notes": ""
}
```

Estados sugeridos:

```text
planned
active
paused
completed
cancelled
revised
```

Prioridades sugeridas:

```text
low
medium
high
critical
```

---

## Metas iniciales resumidas

| Fecha | Meta | Bases principales |
|---|---|---|
| 2026–2027 | 🌮 Nace JJTaco | Recursos, Movimiento, Gobernanza, Materia |
| 2026–2027 | 💻 Primera empresa tecnológica | Inteligencia, Movimiento, Gobernanza |
| 2026–2027 | 🤖 Primera línea de automatización y robótica aplicada | Inteligencia, Materia, Movimiento |
| 2028 | 🏗️ Primer edificio | Materia, Energía, Recursos, Resiliencia |
| 2028 | 🛠️ Primer laboratorio de prototipos | Materia, Inteligencia, Instituciones |
| 2028 | ⚡ Eficiencia energética y resiliencia en edificios | Energía, Resiliencia, Materia |
| 2029 | 🏢 Empresa de construcción e infraestructura | Materia, Energía, Recursos, Resiliencia, Movimiento |
| 2029 | 🤖 Robótica aplicada a construcción, alimentos y logística | Materia, Inteligencia, Movimiento |
| 2029 | 🌍 Expansión internacional de JJTaco | Recursos, Movimiento, Gobernanza |
| 2030 | ❤️ Primera organización social | Instituciones, Gobernanza, Inteligencia |
| 2030 | 🎓 Formación en IA, automatización y robótica | Inteligencia, Materia, Instituciones |
| 2030 | ⚖️ Estudio de gobernanza e incentivos | Gobernanza, Inteligencia |
| 2032 | 🔬 Primer espacio de investigación aplicada | Instituciones, Inteligencia, Materia, Conocimiento fundamental |
| 2032 | 🤖 Primera empresa formal de robótica aplicada | Materia, Inteligencia, Movimiento, Vida |
| 2032 | 🩺 Primeras soluciones médicas | Vida, Mente, Inteligencia, Materia |
| 2032 | 🔭 Programa temprano de conocimiento fundamental | Conocimiento fundamental, Inteligencia, Materia |
| 2035 | 🧬 Centros de investigación especializados | Vida, Mente, Inteligencia, Instituciones |
| 2035 | 🧩 Investigación formal en mente, memoria e identidad | Mente, Vida, Inteligencia, Gobernanza |
| 2035 | 🛡️ Capacidades iniciales de resiliencia | Resiliencia, Energía, Vida, Gobernanza |
| 2038 | 🔌 Semiconductores, sensores y computación avanzada | Inteligencia, Materia, Vida, Mente, Resiliencia |
| 2038 | 🏭 Planta manufacturera de materiales, componentes y robótica | Materia, Energía, Resiliencia, Movimiento |
| 2038 | 🌱 Proyectos serios de recursos y biosfera | Recursos, Energía, Resiliencia |
| 2042 | 🌎 Fundación internacional | Gobernanza, Instituciones, Vida, Recursos |
| 2042 | 🎓 Academias internacionales potenciadas con IA | Inteligencia, Instituciones, Conocimiento fundamental, Gobernanza |
| 2042 | 🤖 Centros de formación en robótica y automatización | Materia, Inteligencia, Instituciones, Movimiento |
| 2042 | ⚖️ Modelos de gobernanza para tecnología avanzada | Gobernanza, Inteligencia, Vida, Mente |
| 2045 | 🏙️ Campus completos de investigación | Instituciones, Vida, Inteligencia, Materia, Energía, Recursos, Movimiento |
| 2045 | 🌱 Recursos y biosfera dentro de los campus | Recursos, Energía, Resiliencia |
| 2045 | 🛡️ Campus resilientes | Resiliencia, Energía, Vida, Gobernanza |
| 2050 | 🧠 Avances en vida y mente | Vida, Mente, Inteligencia, Gobernanza |
| 2050 | 🌆 Ciudad inteligente y resiliente | Resiliencia, Energía, Recursos, Movimiento, Gobernanza, Inteligencia, Materia |
| 2050 | 🛡️ Sistemas de respaldo civilizacional | Resiliencia, Recursos, Vida, Energía, Gobernanza |
| 2050 | 🔄 Optimización de movimiento y flujos urbanos | Movimiento, Energía, Recursos, Inteligencia, Materia |
| 2055+ | 🚀 Infraestructura fuera de la Tierra | Expansión, Recursos, Energía, Materia, Resiliencia |
| 2055+ | 🏛️ Instituciones que continúan más allá de nosotros | Instituciones, Gobernanza, Inteligencia, Resiliencia |

---

## Funcionalidades de la app

### 1. Vista Timeline

Mostrar metas agrupadas por año.

Cada tarjeta debe mostrar:

- emoji
- título
- resumen
- año
- estado
- prioridad
- bases relacionadas

Ejemplo:

```text
2026–2027
  🌮 Nace JJTaco
  💻 Primera empresa tecnológica
  🤖 Primera línea de automatización y robótica aplicada

2028
  🏗️ Primer edificio
  🛠️ Laboratorio de prototipos
```

### 2. Vista por bases

Mostrar las 12 bases como tarjetas. Al hacer clic en una base, filtrar las metas relacionadas.

Ejemplo:

```text
🏗️ Materia
Metas relacionadas:
- 2028: Construimos nuestro primer edificio
- 2029: Empresa de construcción e infraestructura
- 2032: Empresa formal de robótica aplicada
- 2038: Planta manufacturera
- 2050: Ciudad inteligente resiliente
```

### 3. Dashboard de cobertura

Mostrar cuántas metas tiene cada base.

Ejemplo:

```text
🧠 Inteligencia: 10 metas
🏗️ Materia: 9 metas
🌱 Recursos y biosfera: 5 metas
🚀 Expansión: 1 meta
```

Esto sirve para detectar áreas descuidadas.

### 4. Filtros

Filtros recomendados:

- Año
- Base
- Estado
- Prioridad
- Texto de búsqueda

### 5. Revisión periódica

Crear una sección para revisiones trimestrales o anuales.

Cada revisión debe responder:

1. ¿Qué metas siguen teniendo sentido?
2. ¿Qué metas deben cambiar?
3. ¿Qué tecnologías aceleraron?
4. ¿Qué riesgos nuevos aparecieron?
5. ¿Qué base está descuidada?
6. ¿Qué meta debe adelantarse?
7. ¿Qué meta debe pausarse?
8. ¿Qué aprendimos este periodo?

---

## Diseño visual sugerido

- Serio.
- Limpio.
- Con emojis como marcadores visuales.
- Fondo claro u oscuro configurable.
- Tarjetas simples.
- Enfoque en lectura rápida y actualización fácil.
- Responsive para celular, tablet y desktop.

Secciones principales:

```text
Header
  - Título
  - Descripción corta
  - Botón: Timeline
  - Botón: Bases
  - Botón: Dashboard
  - Botón: Revisiones

Main
  - Vista dinámica según selección

Footer
  - Última actualización
```

---

## Implementación técnica simple

La primera versión puede hacerse con HTML, CSS y JavaScript puro.

### `index.html`

Debe cargar:

```html
<link rel="stylesheet" href="src/styles.css">
<script type="module" src="src/app.js"></script>
```

### `src/app.js`

Debe:

1. Cargar `data/bases.json`.
2. Cargar `data/goals.json`.
3. Renderizar la vista timeline.
4. Permitir cambiar a vista por bases.
5. Renderizar dashboard de cobertura.
6. Aplicar filtros.

### `src/styles.css`

Debe definir:

- layout general
- tarjetas
- chips de bases
- colores por prioridad
- diseño responsive para móvil

---

## Despliegue en GitHub Pages

1. Ir al repositorio.
2. Abrir `Settings`.
3. Ir a `Pages`.
4. En `Build and deployment`, seleccionar:
   - Source: `Deploy from a branch`
   - Branch: `main`
   - Folder: `/root`
5. Guardar.
6. Esperar a que GitHub genere la URL.

La app quedará disponible en una URL similar a:

```text
https://ricardogv2.github.io/TimeLine/
```

---

## Roadmap de desarrollo incremental

### Versión 0.1

- Timeline simple.
- Datos en `goals.json`.
- Tarjetas por año.
- Sin filtros.

### Versión 0.2

- Vista por bases.
- Chips de bases.
- Filtro por base.

### Versión 0.3

- Dashboard de cobertura.
- Conteo de metas por base.
- Filtro por prioridad y estado.

### Versión 0.4

- Revisiones trimestrales.
- Archivo `reviews.json`.
- Historial de cambios.

### Versión 1.0

- App estable.
- Responsive.
- GitHub Pages activo.
- Datos fáciles de editar.
- Documentación clara.

---

## Siguiente paso recomendado

Crear los archivos base:

```text
index.html
src/styles.css
src/app.js
data/bases.json
data/goals.json
```

Después activar GitHub Pages y validar que el timeline se vea correctamente.
