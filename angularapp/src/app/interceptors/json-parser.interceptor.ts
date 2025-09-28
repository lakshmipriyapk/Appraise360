import { HttpInterceptorFn } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const jsonParserInterceptor: HttpInterceptorFn = (req, next) => {
  // Add proper headers to ensure JSON response
  const jsonReq = req.clone({
    setHeaders: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  });

  return next(jsonReq).pipe(
    catchError((error) => {
      console.error('HTTP Error:', error);
      
      if (error.status === 200 && error.error instanceof ProgressEvent) {
        // This is likely a JSON parsing error
        console.error('JSON parsing error - backend returned non-JSON response');
        return throwError(() => new Error('Backend returned invalid JSON response'));
      }
      
      return throwError(() => error);
    })
  );
};
