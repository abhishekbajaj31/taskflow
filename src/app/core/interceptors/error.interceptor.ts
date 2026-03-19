import { HttpInterceptorFn, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

// Set to true to simulate a server error on the /users endpoint
// This demonstrates production-ready error handling as required by the assignment
export const SIMULATE_ERROR = false;

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  // Simulate an error for demo/testing purposes
  if (SIMULATE_ERROR && req.url.includes('/users')) {
    return throwError(() => new HttpErrorResponse({ status: 500, statusText: 'Simulated Server Error' }));
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let message = 'An unexpected error occurred.';

      if (error.status === 0) {
        message = 'Network error. Please check your internet connection.';
      } else if (error.status === 404) {
        message = 'The requested resource was not found.';
      } else if (error.status === 403) {
        message = 'You do not have permission to access this resource.';
      } else if (error.status >= 500) {
        message = 'Server error. Please try again later.';
      }

      console.error(`[HTTP ${error.status}]`, req.url, error.message);
      return throwError(() => new Error(message));
    })
  );
};
