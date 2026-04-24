import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = typeof window !== 'undefined'
    ? window.localStorage.getItem('auth_token') || window.localStorage.getItem('token')
    : null;

  if (!token || req.url.includes('/api/auth/')) {
    return next(req);
  }

  return next(req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  }));
};
