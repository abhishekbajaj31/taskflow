import { Injectable, inject } from '@angular/core';
import { Observable, combineLatest } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Project, Task } from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class ProjectsService {
  private api = inject(ApiService);

  // cache these so we don't refetch every time
  private users$ = this.api.getUsers().pipe(shareReplay(1));
  private todos$ = this.api.getTodos().pipe(shareReplay(1));

  getProjects(): Observable<Project[]> {
    return combineLatest([this.users$, this.todos$]).pipe(
      map(([users, todos]) =>
        users.map(user => {
          const userTodos = todos.filter(t => t.userId === user.id);
          return {
            ...user,
            taskCount: userTodos.length,
            completedTaskCount: userTodos.filter(t => t.completed).length,
            pendingTaskCount: userTodos.filter(t => !t.completed).length
          } as Project;
        })
      )
    );
  }

  getProjectWithTasks(userId: number): Observable<{ project: Project; tasks: Task[] }> {
    return combineLatest([this.users$, this.api.getTodosByUser(userId)]).pipe(
      map(([users, todos]) => {
        const user = users.find(u => u.id === userId);
        if (!user) throw new Error('Project not found');

        const tasks: Task[] = todos.map(t => ({
          ...t,
          status: t.completed ? 'completed' : 'pending'
        }));

        const project: Project = {
          ...user,
          taskCount: tasks.length,
          completedTaskCount: tasks.filter(t => t.completed).length,
          pendingTaskCount: tasks.filter(t => !t.completed).length
        };

        return { project, tasks };
      })
    );
  }
}
