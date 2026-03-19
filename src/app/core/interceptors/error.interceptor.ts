import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

// set this to true to test error handling UI
export const SIMULATE_ERROR = false;

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  if (SIMULATE_ERROR && req.url.includes('/users')) {
    return throwError(() => new HttpErrorResponse({ status: 500 }));
  }

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      let message = 'Something went wrong.';
      if (err.status === 0) message = 'No internet connection.';
      else if (err.status === 404) message = 'Not found.';
      else if (err.status >= 500) message = 'Server error, try again later.';
      console.error('HTTP error:', err.status, req.url);
      return throwError(() => new Error(message));
    })
  );
};
