import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AccountService } from '../services/account.service';
import { map, of } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const accountService = inject(AccountService);
  const router = inject(Router);

  if (accountService.currentUser()) {
    return of(true);
  } else {
    // in auth gurad we need not subscribe to observable ..route guard automatically do it for us
    return accountService.getAuthState().pipe(
      map(auth => {
        console.log(auth.isAuthenticated)
        if (auth.isAuthenticated) {
          return true;
        } else {
          router.navigate(['/account/login'], { queryParams: { returnUrl: state.url } })
          return false;
        }
      })
    )
  }
};
