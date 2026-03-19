import { Routes } from '@angular/router';

export const projectsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/projects-list/projects-list.component').then(
        m => m.ProjectsListComponent
      )
  },
  {
    path: ':id/tasks',
    loadComponent: () =>
      import('./pages/project-tasks/project-tasks.component').then(
        m => m.ProjectTasksComponent
      )
  }
];
