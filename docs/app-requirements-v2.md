# TimeLine — App Requirements V2

## Core direction

TimeLine should not be only a static long-term timeline. It should be a living roadmap system for goals, tasks, subtasks, ideas, resources, decisions, photos and reviews.

The app must be easy for Ricardo, Janet and ChatGPT to update over time.

Main use cases:

- Track long-term civilization/life goals.
- Track business goals such as JJTaco, snack carts, construction and robotics.
- Track work tasks for Ricardo and Janet.
- Track shared tasks between users.
- Track longevity research goals and devices.
- Track repo-related goals for TimeLine and Longevity Research System.
- Log important information such as books, courses, suppliers, photos, notes and links.
- Revisit, change, pause or restructure the plan frequently.

---

## Recommended data architecture

Use one main file as the source of truth:

```text
data/app-data.json
```

This is better than many small files at the beginning because ChatGPT can update one file more safely and quickly.

Later, if the app grows too much, the data can be split into separate files.

Suggested structure:

```json
{
  "meta": {},
  "users": [],
  "bases": [],
  "goals": [],
  "ideas": [],
  "resources": [],
  "decisions": [],
  "reviews": [],
  "tags": []
}
```

---

## Users

The app must support multiple users.

Initial users:

- Ricardo
- Janet

A goal, task or subtask can belong to one user or multiple users.

Required fields:

```json
{
  "id": "ricardo",
  "name": "Ricardo",
  "emoji": "👨‍💻",
  "color": "#2563eb"
}
```

Goals and tasks should support:

```json
"ownerIds": ["ricardo"],
"participantIds": ["ricardo", "janet"],
"assignedTo": ["janet"],
"finalOwnerId": null
```

This allows shared tasks at the beginning and then a final owner later.

---

## Goals

A goal can represent:

- a life goal
- business project
- work project
- research project
- health/longevity project
- repo improvement
- family/personal goal

Required goal fields:

```json
{
  "id": "jj-taco-2026",
  "type": "goal",
  "emoji": "🌮",
  "title": "Nace JJTaco",
  "summary": "Lo que empezó como un sueño entre José + Janet se convierte en una marca con identidad propia, sabor mexicano y potencial de expansión.",
  "domain": "business",
  "category": "food-business",
  "periodLabel": "2026–2027",
  "startDate": "2026-01-01",
  "targetDate": "2027-12-31",
  "completedDate": null,
  "status": "planned",
  "priority": "high",
  "ownerIds": ["ricardo", "janet"],
  "participantIds": ["ricardo", "janet"],
  "bases": ["recursos-biosfera", "movimiento-flujos", "gobernanza", "materia"],
  "tags": ["food", "brand", "operations"],
  "dependencies": [],
  "relatedGoals": [],
  "relatedResources": [],
  "coverImage": "assets/goals/jj-taco/cover.jpg",
  "images": [],
  "milestones": [],
  "tasks": [],
  "notes": ""
}
```

---

## Domains

The app must separate work, personal, business, research and repo work.

Suggested domains:

```text
personal
family
work
business
research
longevity
health
learning
finance
legal
travel
home
repo
civilization
```

Examples:

- `business`: JJTaco, snack carts, robotics company.
- `work`: tasks from Ricardo or Janet's jobs.
- `longevity`: devices to buy, health experiments, tracking goals.
- `repo`: tasks for TimeLine or Longevity Research System.
- `research`: books, papers, technical notes.

---

## Milestones

Goals should have multiple milestones.

Example:

```json
{
  "id": "jj-taco-first-sales",
  "title": "Primeras ventas",
  "targetDate": "2026-06-30",
  "completedDate": null,
  "status": "planned",
  "ownerIds": ["ricardo", "janet"],
  "summary": "Validar producto, precio, operación y respuesta de clientes.",
  "images": [],
  "tasks": []
}
```

---

## Tasks and subtasks

Goals and milestones can contain tasks.

Tasks can be assigned to one or multiple users.

Example:

```json
{
  "id": "task-jj-taco-menu",
  "title": "Definir menú inicial",
  "status": "planned",
  "priority": "high",
  "assignedTo": ["ricardo", "janet"],
  "finalOwnerId": null,
  "startDate": "2026-02-01",
  "targetDate": "2026-03-01",
  "completedDate": null,
  "subtasks": []
}
```

---

## Ideas inbox

The app needs an inbox for ideas that are not yet classified.

Example use case:

> We just thought about doing snack carts. Where is best to add it?

Possible recommendations:

1. Add as an inbox idea.
2. Add as a new business goal.
3. Add as a milestone inside JJTaco.
4. Add as a task under an existing business goal.
5. Add as a resource or research note.

Example:

```json
{
  "id": "idea-snack-carts",
  "type": "idea",
  "emoji": "🛒",
  "title": "Snack carts",
  "summary": "Idea de negocio con carritos de snacks para eventos, fiestas y puntos móviles.",
  "createdDate": "2026-06-01",
  "createdBy": "ricardo",
  "suggestedDomain": "business",
  "suggestedBases": ["recursos-biosfera", "movimiento-flujos", "gobernanza", "materia"],
  "status": "inbox",
  "decisionStatus": "needs-review",
  "linkedGoalId": null,
  "notes": "Pendiente decidir si va dentro de JJTaco, como línea separada o como nueva empresa."
}
```

---

## Resources / Knowledge log

The app should allow saving important information found along the way.

Examples:

- book for building construction
- photo of a food cart
- supplier link
- legal note
- research paper
- YouTube video
- course
- product/device
- article
- technical reference

Example:

```json
{
  "id": "resource-building-book-001",
  "type": "resource",
  "resourceType": "book",
  "title": "Book title",
  "author": "Author",
  "summary": "Book useful for learning construction, permits, design and infrastructure.",
  "notes": "Important ideas from the book and how it may help the first building goal.",
  "sourceUrl": "",
  "photo": "assets/resources/building-book-001.jpg",
  "createdDate": "2026-06-01",
  "createdBy": "ricardo",
  "relatedGoals": ["first-building-2028"],
  "relatedBases": ["materia", "energia", "resiliencia"],
  "tags": ["construction", "book", "building"],
  "status": "active"
}
```

Resource types:

```text
book
article
paper
video
course
website
photo
note
conversation
supplier
product
tool
legal-info
technical-reference
```

---

## Photos and images

Images should be supported for:

- goals
- milestones
- tasks
- resources
- users
- reviews

Image format:

```json
{
  "src": "assets/goals/jj-taco/logo-draft.jpg",
  "caption": "Primer concepto visual de la marca",
  "date": "2026-02-01",
  "uploadedBy": "ricardo",
  "tags": ["logo", "brand"]
}
```

---

## Main view: horizontal timeline

The main view must be a horizontal timeline.

Requirements:

- horizontal scroll
- columns or blocks by year/period
- cards inside each period
- desktop horizontal layout
- mobile swipe support
- compact view
- expanded view
- visual chips for users, domains, bases and status

---

## Detail view

Clicking a card should open a detail panel/modal with:

- title
- summary
- dates
- users involved
- domain/category
- bases
- cover image
- gallery
- milestones
- tasks/subtasks
- related resources
- related ideas
- decisions
- notes
- dependencies

---

## Updated filters

The app should support these filters.

### Core filters

1. Text search — title, summary, notes, tags.
2. Year / period.
3. Date range.
4. Owner user.
5. Participant user.
6. Assigned user.
7. Shared vs individual.
8. Domain — work, personal, business, research, longevity, repo, etc.
9. Category — robotics, construction, medicine, food-business, legal, finance, etc.
10. Civilization base.
11. Status.
12. Priority.
13. With photos / without photos.
14. With resources / without resources.
15. With milestones / without milestones.
16. Overdue milestones.
17. Completed milestones.
18. Overdue tasks.
19. Shared tasks.
20. Tasks without final owner.
21. Inbox ideas.
22. Ideas pending decision.
23. Resource type.
24. Goals with decisions.
25. Goals without assigned bases.
26. Goals by decade.
27. Goals connected to many bases.
28. Related repo — TimeLine, Longevity Research System or other.

### Quick views

```text
My tasks
Janet tasks
Shared tasks
Work
Personal
Business
Research
Longevity
Repos
Inbox
Overdue
This year
Next 90 days
Without owner
Without milestones
With photos
Knowledge log
```

---

## Required views

### 1. Horizontal timeline

Main long-term visual view.

### 2. Kanban

Columns:

```text
Inbox → Planned → Active → Paused → Completed → Revised / Cancelled
```

### 3. User view

Show goals/tasks for:

- Ricardo
- Janet
- both
- future users

### 4. Domain view

Group by:

- work
- personal
- business
- research
- longevity
- repo
- family

### 5. Bases view

Show the 12 bases and related goals.

### 6. Knowledge log

Show books, notes, links, photos, suppliers, products, courses and papers.

### 7. Dashboard

Show:

- goals by base
- goals by user
- goals by domain
- overdue tasks
- overdue milestones
- inbox ideas
- goals without resources
- goals without milestones
- neglected bases

---

## Assistant-friendly editing rules

Because ChatGPT will help update this app, follow these rules:

1. Use stable IDs.
2. Never rely on array position to identify items.
3. Every goal, milestone, task, resource, idea and decision needs an `id`.
4. New uncertain ideas go first to `ideas`.
5. Important changes should be recorded in `decisions`.
6. If the user asks where to add an idea, suggest one of:
   - new goal
   - milestone inside existing goal
   - task inside existing goal
   - resource
   - inbox idea
   - discard / parking lot
7. If approved, update `data/app-data.json`.
8. Keep editing centralized and simple.

---

## Privacy note

If work tasks, personal photos, health/longevity notes or sensitive family information are added, it is better to keep the repo private or avoid sensitive details.

Do not store:

- passwords
- private work/confidential data
- sensitive medical records
- bank details
- immigration document numbers

Use general summaries when information is sensitive.

---

## Development roadmap

### Version 0.1

- `data/app-data.json` as source of truth.
- Horizontal timeline.
- Goals with users, dates, milestones and bases.
- Basic detail panel.

### Version 0.2

- Core filters.
- User view.
- Domain view.
- Bases view.

### Version 0.3

- Tasks and subtasks.
- Shared tasks.
- Tasks without final owner.
- Overdue task detection.

### Version 0.4

- Photos.
- Galleries.
- Knowledge log.
- Resources linked to goals.

### Version 0.5

- Ideas inbox.
- Decision log.
- Convert idea into goal/milestone/task/resource.

### Version 0.6

- Dashboard.
- Neglected bases.
- Goals without milestones.
- Goals without resources.
- Overdue milestones.

### Version 1.0

- Stable app.
- Responsive horizontal timeline.
- GitHub Pages deployment.
- Easy editing through `data/app-data.json`.
