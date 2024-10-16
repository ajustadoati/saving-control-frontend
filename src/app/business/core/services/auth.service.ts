import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private httpClient: HttpClient, private router: Router) {}
  
  private LOGIN_URL = 'http://ajustadoati.com:8083/api/auth/login';
  private tokenKey = 'authToken'

  login(username: string, password: string): Observable<any>{
    return this.httpClient.post<any> (this.LOGIN_URL, {username, password}).pipe(
      tap((response: { token: any; }) => {
        if (response.token){
          console.log(response.token);
          this.setToken(response.token);
        }
      })
    )

  }

  private setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token)
  }

  private getToken(): string | null {
    if (typeof window !== 'undefined' ){
      return localStorage.getItem(this.tokenKey);
    } else {
      return null;
    }
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token){
      return false;
    }
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000;
    return Date.now() < exp;
  

  }

  logout(): void {
    console.log("Exit application")
    localStorage.removeItem(this.tokenKey);
    this.router.navigate(['/login'])
  }


}
