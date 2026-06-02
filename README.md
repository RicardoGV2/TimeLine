# TimeLine

TimeLine is a living roadmap app for goals, milestones, tasks, ideas, resources, decisions and reviews.

It is designed for long-term planning, but also for monthly execution.

## Main concept

```text
Global timeline → Year expanded view → Goal / milestone detail
```

- **Global timeline** shows major goals by year or strategic period.
- **Year expanded view** shows January–December columns for milestones, tasks, resources and decisions.
- **Detail panel** shows dates, users, bases, milestones, tasks, resources and decisions.

## Current features

- Horizontal timeline by year/period.
- Click year to expand into monthly execution view.
- Click goal/milestone/task to open detail panel.
- Filters by user, domain, base, status, priority and search text.
- Multiple users: Ricardo and Janet.
- Multiple domains: work, business, personal, family, research, longevity, health, learning, finance, legal, travel, home and repos.
- 12 civilization bases.
- Ideas inbox.
- Knowledge/resources log.
- Decisions log.
- GitHub Pages deployment workflow.

## Data architecture

The app uses a hybrid data structure:

```text
data/
  config.json
  goals/
    business.json
    personal.json
    work.json
    longevity.json
    research.json
    repos.json
  ideas.json
  resources.json
  decisions.json
  reviews.json
```

This keeps edits safer than one giant JSON file while still being simple enough for ChatGPT to maintain.

## Deployment

This repo includes a GitHub Pages workflow:

```text
.github/workflows/pages.yml
```

In GitHub Pages settings, use:

```text
Source: GitHub Actions
```

Then push to `main`. The workflow will deploy the site automatically.

Expected URL:

```text
https://ricardogv2.github.io/TimeLine/
```

## Privacy note

Do not store passwords, confidential work details, sensitive medical records, bank details, immigration numbers or private documents in this repo.

Use high-level summaries for sensitive work, health and personal information.
