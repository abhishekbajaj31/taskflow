import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { User, Todo, Comment, Task } from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiBaseUrl;

  private handleError(error: HttpErrorResponse): Observable<never> {
    let message = 'An unexpected error occurred.';
    if (error.status === 0) {
      message = 'Network error. Please check your internet connection.';
    } else if (error.status === 404) {
      message = 'The requested resource was not found.';
    } else if (error.status >= 500) {
      message = 'Server error. Please try again later.';
    }
    return throwError(() => new Error(message));
  }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.base}/users`).pipe(
      catchError(this.handleError)
    );
  }

  getUser(id: number): Observable<User> {
    return this.http.get<User>(`${this.base}/users/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  getTodos(): Observable<Todo[]> {
    return this.http.get<Todo[]>(`${this.base}/todos`).pipe(
      catchError(this.handleError)
    );
  }

  getTodosByUser(userId: number): Observable<Todo[]> {
    return this.http.get<Todo[]>(`${this.base}/todos?userId=${userId}`).pipe(
      catchError(this.handleError)
    );
  }

  getComments(): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.base}/comments`).pipe(
      catchError(this.handleError)
    );
  }

  // Simulated POST - JSONPlaceholder returns 201 but doesn't persist
  createTodo(todo: Partial<Todo>): Observable<Todo> {
    return this.http.post<Todo>(`${this.base}/todos`, todo).pipe(
      catchError(this.handleError)
    );
  }
}
