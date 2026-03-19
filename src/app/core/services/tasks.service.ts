import { Injectable, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Task, TaskFormData } from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class TasksService {
  private api = inject(ApiService);

  // keep track of tasks created this session locally
  private localTasks = signal<Task[]>([]);

  getLocalTasks(): Task[] {
    return this.localTasks();
  }

  createTask(userId: number, data: TaskFormData): Observable<Task> {
    return this.api.createTodo({
      userId,
      title: data.title,
      completed: data.status === 'completed'
    }).pipe(
      map(res => ({
        ...res,
        id: Date.now(), // jsonplaceholder always returns 201 so use timestamp
        userId,
        status: data.status
      } as Task)),
      tap(task => this.localTasks.update(prev => [task, ...prev]))
    );
  }
}
