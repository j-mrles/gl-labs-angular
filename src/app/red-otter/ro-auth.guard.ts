import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { RoAuthService } from './ro-auth.service';

export const roAuthGuard: CanActivateFn = () => {
  const auth = inject(RoAuthService);
  const router = inject(Router);

  if (auth.isLoggedIn) {
    return true;
  }
  router.navigate(['/red-otter/login']);
  return false;
};
