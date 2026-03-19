import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { User, Todo, Comment } from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiBaseUrl;

  private handleError(err: HttpErrorResponse): Observable<never> {
    let msg = 'Something went wrong, please try again.';

    if (err.status === 0) {
      msg = 'No internet connection.';
    } else if (err.status === 404) {
      msg = 'Resource not found.';
    } else if (err.status >= 500) {
      msg = 'Server error, try again later.';
    }

    return throwError(() => new Error(msg));
  }

  getUsers(): Observable<User[]> {
    return this.http
      .get<User[]>(`${this.baseUrl}/users`)
      .pipe(catchError(this.handleError));
  }

  getTodos(): Observable<Todo[]> {
    return this.http
      .get<Todo[]>(`${this.baseUrl}/todos`)
      .pipe(catchError(this.handleError));
  }

  getTodosByUser(userId: number): Observable<Todo[]> {
    return this.http
      .get<Todo[]>(`${this.baseUrl}/todos?userId=${userId}`)
      .pipe(catchError(this.handleError));
  }

  getComments(): Observable<Comment[]> {
    return this.http
      .get<Comment[]>(`${this.baseUrl}/comments`)
      .pipe(catchError(this.handleError));
  }

  // NOTE: JSONPlaceholder doesn't actually save this but returns 201
  createTodo(todo: Partial<Todo>): Observable<Todo> {
    return this.http
      .post<Todo>(`${this.baseUrl}/todos`, todo)
      .pipe(catchError(this.handleError));
  }
}
