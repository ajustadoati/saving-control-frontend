import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('authToken'); // Obtiene el token desde el localStorage

    // Si existe el token, clona la solicitud y agrega el encabezado de autorización
    if (token) {
      const cloned = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`  // Añade el token en el encabezado Authorization
        }
      });
      return next.handle(cloned);  // Pasa la solicitud clonada con el token
    } else {
      return next.handle(req);  // Si no hay token, pasa la solicitud original
    }
  }
}
