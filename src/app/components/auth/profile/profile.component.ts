import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { AuthService } from '@services/auth.service';
import { UsuarioService } from '@services/usuario.service';
import { Usuario } from '@models/usuario.model';
import { UsuarioAuth } from '@models/auth.model';
import { CpfMaskDirective } from '../../../directives/cpf-mask.directive';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    CpfMaskDirective
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private usuarioService = inject(UsuarioService);
  private router = inject(Router);

  user: UsuarioAuth | null = null;
  userDetails: Usuario | null = null;
  loading = false;
  message = '';
  error = '';
  hidePassword = true;
  hideConfirmPassword = true;
  maxDate: string = this.buildMaxDate(18);

  form: FormGroup = this.fb.group({
    nome: ['', [Validators.required, Validators.minLength(2)]],
    sobrenome: ['', [Validators.required, Validators.minLength(2)]],
    email: [{ value: '', disabled: true }],
    cpf: [{ value: '', disabled: true }],
    dataNascimento: ['', [Validators.required, this.minAgeValidator(18)]],
    senha: [''],
    confirmarSenha: ['']
  });

  ngOnInit(): void {
    this.user = this.authService.getUser();
    if (this.user?.id) {
      this.usuarioService.getById(this.user.id).subscribe({
        next: (details) => {
          this.userDetails = details;
          this.form.patchValue({
            nome: details.nome,
            sobrenome: details.sobrenome,
            email: details.email,
            cpf: details.cpf,
            dataNascimento: details.dataNascimento?.substring(0, 10) || ''
          });
        },
        error: (err) => {
          this.error = (err as any)?.message || 'Erro ao carregar dados do perfil.';
        }
      });
    }
  }

  onSubmit(): void {
    if (!this.user || !this.userDetails) {
      this.error = 'Faça login para editar seus dados.';
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const senha = this.form.value.senha;
    const confirmarSenha = this.form.value.confirmarSenha;
    if ((senha || confirmarSenha) && senha !== confirmarSenha) {
      this.error = 'As senhas não conferem.';
      return;
    }

    const dto = {
      nome: this.form.value.nome!,
      sobrenome: this.form.value.sobrenome!,
      email: this.userDetails.email,
      cpf: this.userDetails.cpf,
      dataNascimento: this.form.value.dataNascimento!,
      senha: senha || undefined
    };

    this.loading = true;
    this.message = '';
    this.error = '';

    this.usuarioService.update(this.userDetails.id!, dto).subscribe({
      next: () => {
        this.loading = false;
        this.message = 'Dados atualizados com sucesso.';
        this.authService.updateStoredUser({ nome: dto.nome });
        if (senha && this.userDetails?.id) {
          this.usuarioService.updateSenha(this.userDetails.id, senha).subscribe();
        }
      },
      error: (err: unknown) => this.handleError(err)
    });
  }

  private handleError(err: unknown): void {
    this.loading = false;
    this.error = (err as any)?.message || 'Erro ao atualizar dados.';
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
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

  private buildMaxDate(minYears: number): string {
    const today = new Date();
    today.setFullYear(today.getFullYear() - minYears);
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${today.getFullYear()}-${month}-${day}`;
  }
}
