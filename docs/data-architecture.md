# Data Architecture Decision

## Decision

Use a **hybrid data architecture** instead of one giant JSON file.

This app will be maintained frequently by Ricardo, Janet and ChatGPT. The structure must be easy to edit, safe to modify, and scalable as goals, tasks, resources, photos and decisions grow.

## Recommended structure

```text
data/
  config.json
  goals/
    business.json
    work.json
    personal.json
    longevity.json
    research.json
    repos.json
  ideas.json
  resources.json
  decisions.json
  reviews.json
```

## Why not one file?

A single `app-data.json` is simple at the beginning, but it becomes risky:

- it grows too large;
- every edit touches the same file;
- merge conflicts become more likely;
- a small JSON syntax error can break everything;
- unrelated areas get mixed together;
- it becomes harder for ChatGPT to make small safe changes.

## Why not too many files?

A file per goal or task would be too fragmented at this stage. It would make changes slower and harder to reason about.

## Why hybrid is best

Hybrid means each major domain has its own file:

- business goals stay in `data/goals/business.json`;
- work goals stay in `data/goals/work.json`;
- personal goals stay in `data/goals/personal.json`;
- longevity goals stay in `data/goals/longevity.json`;
- repo tasks stay in `data/goals/repos.json`;
- resources stay in `data/resources.json`;
- ideas stay in `data/ideas.json`;
- decisions stay in `data/decisions.json`.

This keeps the app organized while still making it easy for ChatGPT to edit the correct file.

## Editing rule

New uncertain ideas go to `data/ideas.json` first.

Example:

> Snack carts

This should first become an idea. Later it can be promoted into:

- a new business goal;
- a milestone inside JJTaco;
- a task inside another business goal;
- a resource/research note;
- or a discarded/parked idea.

## Stable IDs

Every item must have a stable ID:

```json
"id": "idea-snack-carts-2026"
```

Do not rely on array position. ChatGPT should always edit by ID.

## Future migration

If the app becomes very large, goals can later be split further:

```text
data/goals/business/jj-taco.json
data/goals/business/snack-carts.json
data/goals/research/fundamental-knowledge.json
```

Do not do this until the current structure becomes difficult to maintain.
