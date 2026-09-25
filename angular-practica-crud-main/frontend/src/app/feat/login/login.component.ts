import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../service/auth.service';
import { LoginResponse } from '../../interface/auth.interface';
import { filter, finalize, timeout } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loading = false;
  error = '';
  formulario: FormGroup;
  errorLogin = '';
  enviado = false;
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
      this.formulario = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  }

iniciarSesion(): void {
  console.log('Se ha pulsado iniciar sesión');

  this.enviado = true;
  this.errorLogin = '';
  this.formulario.markAllAsTouched();

  if (this.formulario.invalid) {
    console.log('Formulario inválido:', this.formulario.errors);
    console.log('Errores de email:', this.formulario.get('email')?.errors);
    console.log('Errores de password:', this.formulario.get('password')?.errors);

    return;
  }

  this.loading = true;

  this.authService.login(this.formulario.getRawValue())
    .pipe(
      finalize(() => {
        this.loading = false;
      })
    )
    .subscribe({
      next: (respuesta: LoginResponse) => {
        if (!respuesta?.user) {
          this.errorLogin =
            'El correo electrónico o la contraseña no son correctos.';
          return;
        }

        this.authService.guardarUsuario(respuesta.user);
        this.router.navigateByUrl('/home');
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error de login:', error);

        if (error.status === 401 || error.status === 403) {
          this.errorLogin =
            'El correo electrónico o la contraseña no son correctos.';
          return;
        }

        this.errorLogin = 'No se pudo iniciar sesión.';
      }
    });
}




}
