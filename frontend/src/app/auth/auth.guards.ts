import { inject } from '@angular/core';
import { CanActivateChildFn, CanActivateFn, Router } from '@angular/router';
import { UserService } from '../Service/UserService';

function requireSession(redirectTo: string) {
  const router = inject(Router);
  const userService = inject(UserService);

  if (userService.hasValidSession()) {
    return true;
  }

  userService.clearSession();
  return router.createUrlTree([redirectTo]);
}

export const authGuard: CanActivateFn = () => requireSession('/login');

export const guestGuard: CanActivateFn = () => {
  const router = inject(Router);
  const userService = inject(UserService);

  if (!userService.hasValidSession()) {
    return true;
  }

  return router.createUrlTree(['/']);
};

export const adminGuard: CanActivateFn = () => {
  const router = inject(Router);
  const userService = inject(UserService);

  if (!userService.hasValidSession()) {
    userService.clearSession();
    return router.createUrlTree(['/login']);
  }

  if (userService.hasRole('ADMIN')) {
    return true;
  }

  return router.createUrlTree(['/']);
};

export const adminChildGuard: CanActivateChildFn = (childRoute, state) => adminGuard(childRoute, state);
