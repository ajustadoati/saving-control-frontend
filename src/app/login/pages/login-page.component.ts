import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  imports: [],
  templateUrl: './login-page.component.html',
  styles: './login-page.component.css'
})
export default class LoginPageComponent {

  private fb          = inject( FormBuilder );
  private router      = inject( Router )

  public myForm: FormGroup = this.fb.group({
    email:    ['ricroj', [ Validators.required, Validators.email ]],
    password: ['123456', [ Validators.required, Validators.minLength(6) ]],
  });


  login() {
    const { email, password } = this.myForm.value;
    console.log(" redirtecting to dasboard")
    this.router.navigateByUrl('dashboard')

  }
  
}
