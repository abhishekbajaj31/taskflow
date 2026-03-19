import { Injectable, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Task, TaskFormData, Todo } from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class TasksService {
  private readonly api = inject(ApiService);

  // Local signal-based state for newly created tasks (client-side only)
  private localTasks = signal<Task[]>([]);

  getLocalTasks(): Task[] {
    return this.localTasks();
  }

  createTask(userId: number, formData: TaskFormData): Observable<Task> {
    const todo: Partial<Todo> = {
      userId,
      title: formData.title,
      completed: formData.status === 'completed'
    };
    return this.api.createTodo(todo).pipe(
      map(created => ({
        ...created,
        // JSONPlaceholder returns id=201 for all new todos, generate locally unique
        id: Date.now(),
        userId,
        status: formData.status
      } as Task)),
      tap(task => {
        this.localTasks.update(tasks => [task, ...tasks]);
      })
    );
  }

  clearLocalTasks(): void {
    this.localTasks.set([]);
  }
}
