import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { UserService } from '../Service/UserService';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const userService = inject(UserService);
  const token = userService.getToken();

  if (!token || req.url.includes('/api/auth/')) {
    return next(req).pipe(
      catchError((error) => {
        if (error.status === 401) {
          userService.clearSession();
        }

        return throwError(() => error);
      })
    );
  }

  return next(req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  })).pipe(
    catchError((error) => {
      if (error.status === 401) {
        userService.clearSession();
      }

      return throwError(() => error);
    })
  );
};
