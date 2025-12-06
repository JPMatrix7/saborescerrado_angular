import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterLink } from '@angular/router';
import { AuthService } from '@services/auth.service';
import { LoginRequest } from '@models/auth.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    RouterLink
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  loading = false;
  errorMessage = '';
  hidePassword = true;
  
  form: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.required, Validators.minLength(6)]]
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { email, senha } = this.form.value;
    this.loading = true;
    this.errorMessage = '';

    const body: LoginRequest = { email: email!, senha: senha! };

    this.authService.login(body).subscribe({
      next: () => {
        this.loading = false;
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
        
        // Debug: Verificar dados do usuário
        const user = this.authService.getUser();
        console.log('Usuário logado:', user);
        console.log('É admin?', this.authService.isAdmin());
        console.log('Perfis:', user?.perfis);
        
        // Redireciona baseado no perfil do usuário
        if (returnUrl) {
          this.router.navigate([returnUrl]);
        } else if (this.authService.isAdmin()) {
          console.log('Redirecionando para /admin');
          this.router.navigate(['/admin']);
        } else {
          console.log('Redirecionando para /perfil');
          this.router.navigate(['/perfil']);
        }
      },
      error: (error: unknown) => {
        this.loading = false;
        this.errorMessage = 'Credenciais inválidas. Verifique os dados e tente novamente.';
        console.error('Erro de login:', error);
      }
    });
  }
}
