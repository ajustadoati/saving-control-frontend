import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';



@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export default class LoginComponent {


  private fb          = inject( FormBuilder );
  private router      = inject( Router )

  public myForm: FormGroup = this.fb.group({
    user:    ['14447876', [ Validators.required]],
    password: ['mySecurePassword123', [ Validators.required, Validators.minLength(6) ]],
  });



  user: string = '';
  password: string = '';

  constructor(private authService: AuthService){ }

  login(): void {
    
    const { user, password } = this.myForm.value;
    console.log("login", user, password );
    this.authService.login(user, password).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => console.error('Login failed')
    })

  }

}
