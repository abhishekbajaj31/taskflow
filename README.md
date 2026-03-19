# TaskFlow

A production-ready Angular 17 SPA for managing projects and tasks, built as an assignment submission.

---

## Getting Started

```bash
npm install
npm start        # http://localhost:4200
npm test         # unit tests
npm run build    # production build
```

---

## Project Structure

```
src/
├── app/
│   ├── core/
│   │   ├── interceptors/
│   │   │   ├── error.interceptor.ts      # Error handling + SIMULATE_ERROR flag
│   │   │   └── loading.interceptor.ts    # Global loading bar
│   │   └── services/
│   │       ├── api.service.ts            # HTTP layer (users, todos, comments)
│   │       ├── projects.service.ts       # Combines users + todos via combineLatest
│   │       ├── tasks.service.ts          # Task creation + local signal store
│   │       ├── comments.service.ts       # /comments API → per-project activity
│   │       └── loading.service.ts        # Signal-based loading state
│   │
│   ├── shared/
│   │   ├── models/index.ts               # TypeScript interfaces
│   │   └── components/
│   │       ├── loading/                  # Skeleton loader (card / row / header)
│   │       ├── error/                    # Error state with retry button
│   │       ├── empty-state/              # Empty state display
│   │       ├── stats-chart/              # SVG bar chart (bonus)
│   │       └── task-form-modal/          # Reactive Form modal
│   │
│   └── features/
│       ├── projects/
│       │   ├── projects.routes.ts        # Lazy-loaded routes
│       │   └── pages/
│       │       ├── projects-list/        # /projects
│       │       └── project-tasks/        # /projects/:id/tasks
│       └── tasks/
│           └── components/
│               └── task-item/            # Reusable task row component
```

---

## Assignment Checklist

### Functional Requirements

#### Projects Page (`/projects`)
- [x] Lists all projects from `GET /users`
- [x] Shows project name, email, company metadata
- [x] Total tasks, completed tasks, pending tasks per project
- [x] Comment count per project (from `GET /comments`)
- [x] Completion % badge (color-coded: red/yellow/green)
- [x] Progress bar per card
- [x] "View tasks" navigation to tasks page
- [x] Search by name, email, company (debounced 300ms)

#### Tasks Page (`/projects/:id/tasks`)
- [x] Displays tasks from `GET /todos?userId=:id`
- [x] Each task shows title and Completed / Pending status
- [x] Filter tabs: All / Pending / Completed
- [x] Search by title (debounced 300ms)
- [x] Pagination (10 tasks per page)
- [x] Recent activity section using `GET /comments`

#### Task Creation Form
- [x] Modal with Reactive Forms
- [x] Title field — required, minLength(3), maxLength(200)
- [x] Status field — radio: Pending / Completed
- [x] Validation messages shown on touch
- [x] Character counter on title

---

### Technical Requirements

| Requirement | Implementation |
|---|---|
| Scalable structure | `core/` `shared/` `features/projects/` `features/tasks/` |
| RxJS `combineLatest` | Projects + comments loaded together |
| RxJS `shareReplay` | API responses cached |
| `debounceTime` + `distinctUntilChanged` | Both search inputs |
| `takeUntil` | Subscription cleanup in all components |
| Lazy-loaded routes | `loadChildren` + `loadComponent` |
| `withComponentInputBinding` | Route `:id` param as `@Input` |
| `ChangeDetectionStrategy.OnPush` | All components |
| `trackBy` equivalent | `@for (... track item.id)` (Angular 17) |
| HTTP interceptors (functional) | Loading + error interceptors |
| Error handling | User-friendly messages, retry button |
| Error simulation | Set `SIMULATE_ERROR = true` in `error.interceptor.ts` |
| Loading states | Skeleton screens (3 variants) |
| Empty states | Search, filter, no-data |

---

### Bonus Enhancements

| Bonus | Status |
|---|---|
| Unit tests | ✅ ApiService, ProjectsService, TasksService |
| Charts | ✅ SVG bar chart on projects page (completed vs pending) |
| Pagination | ✅ 10 tasks per page with page numbers |
| Angular Signals | ✅ All component state + TasksService local store |

---

## All 3 Public API Endpoints Used

| Endpoint | Purpose |
|---|---|
| `GET /users` | Projects list |
| `GET /todos` / `GET /todos?userId=:id` | Tasks (all + per project) |
| `GET /comments` | Comment counts on projects page, activity on tasks page |
| `POST /todos` | Create task (simulated — returns 201, not persisted) |

---

## Simulating an API Error

Open `src/app/core/interceptors/error.interceptor.ts` and set:

```ts
export const SIMULATE_ERROR = true;
```

Reload the app — the projects page will show the error state with a retry button.

Set it back to `false` to restore normal behaviour.
