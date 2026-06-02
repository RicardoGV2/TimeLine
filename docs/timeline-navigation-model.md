# Timeline Navigation Model

## Purpose

TimeLine should connect long-term strategy with monthly execution.

The app should not show every detail at once. It should use progressive zoom:

```text
Global timeline → Year expanded view → Goal / milestone detail
```

This keeps the app useful for both vision and execution.

---

## Level 1 — Global timeline by years

The default view is a horizontal timeline organized by years or strategic periods.

Example:

```text
2026–2027 | 2028 | 2029 | 2030 | 2032 | 2035 | 2038 | 2042 | 2045 | 2050 | 2055+
```

This view should show only the major goals.

Example:

```text
2026–2027
🌮 Nace JJTaco
💻 Primera empresa tecnológica
🤖 Robótica aplicada

2028
🏗️ Primer edificio
🛠️ Laboratorio de prototipos
⚡ Energía y resiliencia en edificios
```

### Purpose

Use this level to understand the complete long-term roadmap.

### What appears here

- major goals
- strategic periods
- high-level domains
- users involved
- bases covered
- progress summary

---

## Level 2 — Click year to expand by months

When the user clicks a year or period, the app should focus on that selected year and show columns from January to December.

Example:

```text
Selected year: 2028

January | February | March | April | May | June | July | August | September | October | November | December
```

This monthly view should show execution-level items:

- milestones
- tasks
- subtasks
- resources added that month
- decisions made that month
- goals starting that month
- goals ending that month
- overdue items

---

## Rule: goals stay at year level, milestones/tasks go into months

Major goals should live mainly in the global yearly timeline.

Monthly columns should focus on execution.

Example:

```text
Global timeline:
2026–2027
🌮 Nace JJTaco

Expanded year/month view:
January 2026
☐ Define brand concept

February 2026
☐ Research suppliers
☐ Recipe tests

March 2026
☐ Define initial menu

June 2026
☐ First sales

December 2027
☐ Repeatable model documented
```

This prevents the app from becoming too crowded.

---

## Goal duration bars

If a goal lasts multiple months, the expanded view can show a duration bar across months.

Example:

```text
January 2026                                      December 2027
🌮 Nace JJTaco ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Milestones should still appear inside the relevant month.

---

## Level 3 — Click goal, milestone or task to open detail panel

Clicking any card should open a detail panel.

The detail panel should show:

- title
- summary
- dates
- users
- domain
- category
- bases
- milestones
- tasks/subtasks
- resources
- photos
- decisions
- notes
- dependencies

---

## Monthly view layout

Conceptual layout:

```text
2028 EXPANDED

January        February       March          April          May            June
───────        ────────       ─────          ─────          ───            ────
🏗️ Permits     🛠️ Prototype   ⚡ Energy      🏗️ Supplier    🛠️ Testing     🏗️ Review
📘 Book note    🤖 Sensor      📎 Quote       📷 Site photo   ✅ Decision    📊 Budget
```

---

## Monthly item types

Monthly columns can contain several item types:

| Type | Example |
|---|---|
| Milestone | `☐ First sales` |
| Task | `☐ Contact supplier` |
| Subtask | `☐ Compare prices` |
| Resource | `📘 Construction book` |
| Decision | `✅ Choose modular approach` |
| Photo | `📷 Site visit` |
| Review | `🧭 Monthly review` |

Each item should keep a reference to its parent goal or milestone.

---

## Filters required for zoom navigation

The app should support filters related to the zoom model:

1. **View level** — global, year, month.
2. **Selected year**.
3. **Selected month**.
4. **Due this month**.
5. **Starting this month**.
6. **Completed this month**.
7. **Overdue this month**.
8. **Milestones only**.
9. **Tasks only**.
10. **Resources added this month**.
11. **Decisions made this month**.
12. **User** — Ricardo, Janet or both.
13. **Domain** — work, business, personal, research, longevity, repo.
14. **Base** — one or more of the 12 bases.
15. **Status**.
16. **Priority**.

---

## Navigation behavior

### Default

Open the global yearly timeline.

### Click year

Expand that year into January–December view.

### Click month

Optionally focus only that month, showing all goals, tasks, milestones, resources and decisions linked to it.

### Click item

Open the detail panel.

### Back behavior

The app should support:

```text
Goal detail → Month view → Year expanded view → Global timeline
```

---

## UX principle

Years are for strategy.

Months are for execution.

Detail panels are for management.

Do not overload the global timeline with tasks. Keep the global timeline strategic and the monthly view operational.
