import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const staffAuthGuard: CanActivateFn = () => {
  const router = inject(Router);
  try {
    const hasToken =
      typeof window !== 'undefined' && !!sessionStorage.getItem('staff_id_token');
    if (hasToken) return true;
  } catch {
    // ignore
  }
  return router.createUrlTree(['/staff-login']);
};
