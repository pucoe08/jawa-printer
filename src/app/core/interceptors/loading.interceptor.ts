import { HttpInterceptorFn } from '@angular/common/http';
import { delay, finalize } from 'rxjs';
import { BusyService } from '../services/busy.service';
import { inject } from '@angular/core';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const busyService = inject(BusyService);

  busyService.busy();

  return next(req).pipe(
    delay(500),
    finalize(() => {      //finalize will be called after observable has emitted last value 
      busyService.idle(); // i.e. either observable is complete, error or unsubscribed
    })
  );

};
