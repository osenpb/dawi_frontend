import { HttpEvent, HttpEventType, HttpHandlerFn, HttpRequest } from "@angular/common/http";
import { inject } from "@angular/core";
import { Observable, tap } from "rxjs";
import { LoggerService } from "../services/logger.service";


export function loggingInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  const logger = inject(LoggerService);
  return next(req).pipe(tap(event => {
    if (event.type === HttpEventType.Response) {
      logger.log(req.url, 'returned a response with status', event.status);
    }
  }));
}
