# TimeLine — Civilization Roadmap App

## Objetivo

Crear una aplicación web estática, desplegable en GitHub Pages, para llevar una agenda estratégica de vida y desarrollo basada en metas, fechas, milestones, fotos y 12 bases civilizacionales.

La app debe ayudar a responder constantemente:

> ¿Qué capacidades estamos construyendo, qué metas están activas, qué fechas importan y qué bases estamos descuidando?

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

## Requisitos clave de la app

La app debe manejar desde el inicio:

1. **Timeline horizontal** como vista principal.
2. **Múltiples fechas por meta**, no solo un año general.
3. **Milestones internos** dentro de cada meta.
4. **Fotos e imágenes** por meta y por milestone.
5. **Filtros reales**, no solo recomendados.
6. **Vista por bases** para ver qué metas desarrollan cada principio.
7. **Dashboard de cobertura** para detectar bases descuidadas.
8. **Revisiones periódicas** para ajustar el plan cada trimestre/año.

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
├── assets/
│   ├── goals/
│   │   ├── jj-taco/
│   │   ├── robotics/
│   │   ├── construction/
│   │   └── research/
│   └── icons/
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

---

## Modelo robusto de metas con varias fechas y milestones

### `data/goals.json`

Cada meta debe soportar:

- fecha general visible
- fecha de inicio
- fecha objetivo
- fecha final real, si aplica
- múltiples milestones
- fotos principales
- fotos por milestone
- bases relacionadas
- estado
- prioridad
- dependencias
- notas

Ejemplo:

```json
{
  "id": "jj-taco-2026",
  "emoji": "🌮",
  "title": "Nace JJTaco",
  "summary": "Lo que empezó como un sueño entre José + Janet se convierte en una marca con identidad propia, sabor mexicano y potencial de expansión.",
  "periodLabel": "2026–2027",
  "startDate": "2026-01-01",
  "targetDate": "2027-12-31",
  "completedDate": null,
  "bases": ["recursos-biosfera", "movimiento-flujos", "gobernanza", "materia"],
  "status": "planned",
  "priority": "high",
  "category": "business",
  "dependencies": [],
  "coverImage": "assets/goals/jj-taco/cover.jpg",
  "images": [
    {
      "src": "assets/goals/jj-taco/logo-draft.jpg",
      "caption": "Primer concepto visual de la marca",
      "date": "2026-02-01"
    }
  ],
  "milestones": [
    {
      "id": "jj-taco-brand",
      "title": "Definir marca e identidad",
      "targetDate": "2026-03-31",
      "completedDate": null,
      "status": "planned",
      "summary": "Nombre, logo, menú inicial, tono de marca y propuesta de valor.",
      "images": []
    },
    {
      "id": "jj-taco-first-sales",
      "title": "Primeras ventas",
      "targetDate": "2026-06-30",
      "completedDate": null,
      "status": "planned",
      "summary": "Validar producto, precio, operación y respuesta de clientes.",
      "images": []
    },
    {
      "id": "jj-taco-repeatable-model",
      "title": "Modelo repetible",
      "targetDate": "2027-12-31",
      "completedDate": null,
      "status": "planned",
      "summary": "Documentar operación, costos, proveedores y sistema de entrenamiento.",
      "images": []
    }
  ],
  "notes": ""
}
```

---

## Estados permitidos

```text
planned
active
paused
completed
cancelled
revised
```

## Prioridades permitidas

```text
low
medium
high
critical
```

## Categorías sugeridas

```text
business
technology
robotics
construction
research
medicine
education
foundation
energy
resources
resilience
governance
space
personal
```

---

## Fechas y milestones

La app debe distinguir entre:

| Campo | Uso |
|---|---|
| `periodLabel` | Texto visible, por ejemplo `2026–2027`, `2055+` o `2032` |
| `startDate` | Fecha real de inicio para ordenar en el timeline |
| `targetDate` | Fecha objetivo |
| `completedDate` | Fecha real de cierre, si ya terminó |
| `milestones[].targetDate` | Fecha objetivo de cada milestone |
| `milestones[].completedDate` | Fecha real de cierre de cada milestone |

La vista timeline debe ordenar por `startDate`, pero mostrar `periodLabel`.

---

## Fotos e imágenes

La app debe permitir fotos en tres niveles:

### 1. Imagen principal de meta

```json
"coverImage": "assets/goals/jj-taco/cover.jpg"
```

### 2. Galería de meta

```json
"images": [
  {
    "src": "assets/goals/jj-taco/logo-draft.jpg",
    "caption": "Primer concepto visual de la marca",
    "date": "2026-02-01"
  }
]
```

### 3. Imágenes por milestone

```json
"milestones": [
  {
    "title": "Primer prototipo",
    "images": [
      {
        "src": "assets/goals/robotics/prototype-01.jpg",
        "caption": "Primer prototipo funcional",
        "date": "2026-08-15"
      }
    ]
  }
]
```

La primera versión puede mostrar solo `coverImage`. La versión 0.3 debe mostrar galerías.

---

## Vista principal: Timeline horizontal

La app debe tener un **timeline horizontal** como vista principal.

### Requisitos de diseño

- Scroll horizontal.
- Cada año o periodo aparece como una columna o bloque.
- Las metas aparecen como tarjetas dentro del periodo.
- En desktop debe verse como línea horizontal.
- En móvil debe permitir swipe horizontal.
- Debe tener opción de “compact view” y “expanded view”.

Ejemplo visual conceptual:

```text
2026–2027        2028              2029              2030
─────────        ─────             ─────             ─────
🌮 JJTaco         🏗️ Edificio       🏢 Construcción    ❤️ Organización social
💻 Tech company   🛠️ Prototipos     🤖 Robótica        🎓 Formación IA/robotics
🤖 Robotics line  ⚡ Energía        🌍 Expansión       ⚖️ Gobernanza
```

### Tarjeta de meta

Cada tarjeta debe mostrar:

- emoji
- título
- periodo
- resumen corto
- estado
- prioridad
- bases relacionadas como chips
- foto principal, si existe
- número de milestones completados / totales

Ejemplo:

```text
🌮 Nace JJTaco
2026–2027
Marca mexicana con potencial de expansión.
[planned] [high]
🌱 Recursos  🔄 Movimiento  ⚖️ Gobernanza
Milestones: 0/3
```

---

## Vista de detalle de meta

Al hacer clic en una tarjeta, abrir un panel/modal con:

- título
- resumen
- fechas
- bases relacionadas
- cover image
- galería
- milestones
- notas
- dependencias

Los milestones deben verse como checklist:

```text
☐ Definir marca e identidad — target: 2026-03-31
☐ Primeras ventas — target: 2026-06-30
☐ Modelo repetible — target: 2027-12-31
```

---

## Filtros obligatorios

La app debe tener filtros desde la versión 0.2.

Filtros mínimos:

1. **Búsqueda por texto** — título, resumen, notas.
2. **Año / periodo** — `periodLabel`.
3. **Base civilizacional** — una o varias bases.
4. **Estado** — planned, active, paused, completed, cancelled, revised.
5. **Prioridad** — low, medium, high, critical.
6. **Categoría** — business, technology, robotics, construction, etc.
7. **Con fotos / sin fotos**.
8. **Con milestones vencidos**.
9. **Con milestones completados**.

Filtros recomendados para versión posterior:

- Dependencias.
- Metas sin bases asignadas.
- Metas con menos de 2 milestones.
- Metas por década.
- Metas con muchas bases conectadas.

---

## Vista por bases

Mostrar las 12 bases como tarjetas.

Al hacer clic en una base, filtrar las metas relacionadas.

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

---

## Dashboard de cobertura

Mostrar cuántas metas tiene cada base.

Ejemplo:

```text
🧠 Inteligencia: 10 metas
🏗️ Materia: 9 metas
🌱 Recursos y biosfera: 5 metas
🚀 Expansión: 1 meta
```

También debe mostrar alertas:

```text
⚠️ Expansión tiene pocas metas antes de 2055+.
⚠️ Recursos y biosfera aparece tarde; revisar si debe adelantarse.
✅ Robótica aparece desde 2026–2027.
```

---

## Revisión periódica

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
- Timeline horizontal como vista principal.
- Tarjetas simples.
- Imágenes opcionales sin saturar la vista.
- Fondo claro u oscuro configurable.
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
  - Buscador
  - Filtros

Main
  - Timeline horizontal o vista seleccionada

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
3. Renderizar la vista timeline horizontal.
4. Permitir abrir detalle de meta.
5. Renderizar milestones.
6. Renderizar fotos si existen.
7. Permitir cambiar a vista por bases.
8. Renderizar dashboard de cobertura.
9. Aplicar filtros.
10. Detectar milestones vencidos.

### `src/styles.css`

Debe definir:

- layout general
- timeline horizontal
- tarjetas
- chips de bases
- estados
- prioridades
- galería de imágenes
- modal o panel de detalle
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

- Timeline horizontal simple.
- Datos en `goals.json`.
- Tarjetas por periodo.
- Modelo con `startDate`, `targetDate` y `milestones`.
- Sin filtros avanzados.

### Versión 0.2

- Filtros obligatorios básicos.
- Vista por bases.
- Chips de bases.
- Filtro por base, estado, prioridad y texto.

### Versión 0.3

- Fotos principales.
- Galerías de metas.
- Imágenes por milestone.
- Modal/panel de detalle.

### Versión 0.4

- Dashboard de cobertura.
- Conteo de metas por base.
- Alertas de bases descuidadas.
- Detección de milestones vencidos.

### Versión 0.5

- Revisiones trimestrales.
- Archivo `reviews.json`.
- Historial de cambios.

### Versión 1.0

- App estable.
- Timeline horizontal responsive.
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
assets/goals/
```

Después activar GitHub Pages y validar que:

1. El timeline sea horizontal.
2. Las metas soporten varias fechas.
3. Los milestones aparezcan dentro del detalle.
4. Se puedan mostrar fotos.
5. Los filtros funcionen.

---

## Principio rector

La app no debe ser rígida.

Debe servir para revisar y adaptar la visión conforme cambien:

- tecnologías
- riesgos
- recursos
- prioridades
- alianzas
- conocimientos
- capacidades reales

La app debe ayudar a responder constantemente:

> ¿Qué capacidades estamos construyendo, qué fechas importan, qué milestones están atrasados y qué bases estamos descuidando?
