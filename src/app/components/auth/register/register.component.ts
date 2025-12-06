import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@services/auth.service';
import { CadastroPFRequest } from '@models/auth.model';
import { CpfMaskDirective } from '../../../directives/cpf-mask.directive';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    RouterLink,
    CpfMaskDirective
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loading = false;
  errorMessage = '';
  successMessage = '';
  hidePassword = true;
  hideConfirmPassword = true;
  maxDate: string = this.buildMaxDate(18);

  form: FormGroup = this.fb.group({
    nome: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    cpf: ['', [Validators.required, Validators.pattern(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/)]],
    dataNascimento: ['', [Validators.required, this.minAgeValidator(18)]],
    senha: ['', [Validators.required, Validators.minLength(6)]],
    confirmarSenha: ['', [Validators.required, Validators.minLength(6)]]
  });

  onSubmit(): void {
    if (this.form.invalid || this.passwordsDoNotMatch()) {
      this.form.markAllAsTouched();
      this.errorMessage = this.passwordsDoNotMatch() ? 'As senhas não conferem' : '';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const payload: CadastroPFRequest = {
      nome: this.form.value.nome!,
      email: this.form.value.email!,
      senha: this.form.value.senha!,
      cpf: this.form.value.cpf!.replace(/\D/g, ''),
      dataNascimento: this.form.value.dataNascimento!,
      enderecosIds: [],
      telefonesIds: [],
      cartoesIds: []
    };

    this.authService.registerPF(payload).subscribe({
      next: () => this.handleSuccess(),
      error: (error: unknown) => this.handleError(error)
    });
  }

  passwordsDoNotMatch(): boolean {
    return this.form.value.senha !== this.form.value.confirmarSenha;
  }

  private minAgeValidator(minYears: number) {
    return (control: any) => {
      const value = control.value;
      if (!value) return null;
      const birth = new Date(value);
      const today = new Date();
      const age =
        today.getFullYear() -
        birth.getFullYear() -
        (today < new Date(today.getFullYear(), birth.getMonth(), birth.getDate()) ? 1 : 0);
      return age >= minYears ? null : { minAge: true };
    };
  }

  private handleSuccess(): void {
    this.loading = false;
    this.successMessage = 'Conta criada com sucesso! Faça login para continuar.';
    setTimeout(() => this.router.navigate(['/login']), 1000);
  }

  private handleError(error: unknown): void {
    this.loading = false;
    if (error && typeof error === 'object' && 'message' in (error as any)) {
      this.errorMessage = (error as any).message || 'Erro ao criar conta';
    } else {
      this.errorMessage = 'Erro ao criar conta';
    }
  }

  private buildMaxDate(minYears: number): string {
    const today = new Date();
    today.setFullYear(today.getFullYear() - minYears);
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${today.getFullYear()}-${month}-${day}`;
  }
}
