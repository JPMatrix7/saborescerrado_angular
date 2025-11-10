/**
 * EXEMPLOS DE USO DOS VALIDADORES CUSTOMIZADOS
 * 
 * Para usar nos seus componentes de formulário, siga os exemplos abaixo:
 */

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CustomValidators } from '../validators/custom-validators';

// ============================================
// EXEMPLO 1: Formulário de Pessoa Física
// ============================================
export class ExemploFormularioPessoaFisica {
  form!: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      // Nome completo com validação
      nome: ['', [
        Validators.required,
        CustomValidators.nomeCompleto() // Valida nome e sobrenome
      ]],

      // CPF com validação
      cpf: ['', [
        Validators.required,
        CustomValidators.cpf() // Valida CPF brasileiro
      ]],

      // Data de nascimento (mínimo 18 anos)
      dataNascimento: ['', [
        Validators.required,
        CustomValidators.dataNascimento(18) // Idade mínima de 18 anos
      ]],

      // Telefone com DDD
      telefone: ['', [
        Validators.required,
        CustomValidators.telefone() // Valida formato brasileiro
      ]],

      // Email
      email: ['', [
        Validators.required,
        Validators.email
      ]],

      // Senha forte
      senha: ['', [
        Validators.required,
        CustomValidators.senhaForte()
      ]]
    });
  }
}

// ============================================
// EXEMPLO 2: Formulário de Pessoa Jurídica
// ============================================
export class ExemploFormularioPessoaJuridica {
  form!: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      // Razão Social
      razaoSocial: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(100)
      ]],

      // Nome Fantasia
      nomeFantasia: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(100)
      ]],

      // CNPJ com validação
      cnpj: ['', [
        Validators.required,
        CustomValidators.cnpj() // Valida CNPJ brasileiro
      ]],

      // Telefone comercial
      telefoneComercial: ['', [
        Validators.required,
        CustomValidators.telefone()
      ]],

      // Email corporativo
      email: ['', [
        Validators.required,
        Validators.email
      ]]
    });
  }
}

// ============================================
// EXEMPLO 3: Como exibir erros no template HTML
// ============================================

/*
<mat-form-field appearance="outline" class="full-width">
  <mat-label>CPF</mat-label>
  <input matInput formControlName="cpf" placeholder="000.000.000-00" mask="000.000.000-00">
  <mat-hint>Digite apenas números</mat-hint>
  <mat-error *ngIf="form.get('cpf')?.hasError('required')">
    CPF é obrigatório
  </mat-error>
  <mat-error *ngIf="form.get('cpf')?.hasError('cpfInvalido')">
    {{ form.get('cpf')?.errors?.['cpfInvalido']?.message }}
  </mat-error>
</mat-form-field>

<mat-form-field appearance="outline" class="full-width">
  <mat-label>CNPJ</mat-label>
  <input matInput formControlName="cnpj" placeholder="00.000.000/0000-00" mask="00.000.000/0000-00">
  <mat-hint>Digite apenas números</mat-hint>
  <mat-error *ngIf="form.get('cnpj')?.hasError('required')">
    CNPJ é obrigatório
  </mat-error>
  <mat-error *ngIf="form.get('cnpj')?.hasError('cnpjInvalido')">
    {{ form.get('cnpj')?.errors?.['cnpjInvalido']?.message }}
  </mat-error>
</mat-form-field>

<mat-form-field appearance="outline" class="full-width">
  <mat-label>Telefone</mat-label>
  <input matInput formControlName="telefone" placeholder="(00) 90000-0000" mask="(00) 00000-0000">
  <mat-hint>DDD + número com 8 ou 9 dígitos</mat-hint>
  <mat-error *ngIf="form.get('telefone')?.hasError('required')">
    Telefone é obrigatório
  </mat-error>
  <mat-error *ngIf="form.get('telefone')?.hasError('telefoneInvalido')">
    {{ form.get('telefone')?.errors?.['telefoneInvalido']?.message }}
  </mat-error>
</mat-form-field>

<mat-form-field appearance="outline" class="full-width">
  <mat-label>Nome Completo</mat-label>
  <input matInput formControlName="nome" placeholder="João da Silva">
  <mat-hint>Nome e sobrenome (3-100 caracteres)</mat-hint>
  <mat-error *ngIf="form.get('nome')?.hasError('required')">
    Nome é obrigatório
  </mat-error>
  <mat-error *ngIf="form.get('nome')?.hasError('nomeInvalido')">
    {{ form.get('nome')?.errors?.['nomeInvalido']?.message }}
  </mat-error>
</mat-form-field>

<mat-form-field appearance="outline" class="full-width">
  <mat-label>Senha</mat-label>
  <input matInput formControlName="senha" type="password">
  <mat-hint>Mínimo 8 caracteres com letras, números e símbolos</mat-hint>
  <mat-error *ngIf="form.get('senha')?.hasError('required')">
    Senha é obrigatória
  </mat-error>
  <mat-error *ngIf="form.get('senha')?.hasError('senhaFraca')">
    {{ form.get('senha')?.errors?.['senhaFraca']?.message }}
  </mat-error>
</mat-form-field>

<mat-form-field appearance="outline" class="full-width">
  <mat-label>Data de Nascimento</mat-label>
  <input matInput formControlName="dataNascimento" type="date">
  <mat-hint>Idade mínima: 18 anos</mat-hint>
  <mat-error *ngIf="form.get('dataNascimento')?.hasError('required')">
    Data de nascimento é obrigatória
  </mat-error>
  <mat-error *ngIf="form.get('dataNascimento')?.hasError('dataInvalida')">
    {{ form.get('dataNascimento')?.errors?.['dataInvalida']?.message }}
  </mat-error>
  <mat-error *ngIf="form.get('dataNascimento')?.hasError('idadeInvalida')">
    {{ form.get('dataNascimento')?.errors?.['idadeInvalida']?.message }}
  </mat-error>
</mat-form-field>
*/

// ============================================
// EXEMPLO 4: Validação ao submeter formulário
// ============================================

/*
onSubmit(): void {
  if (this.form.valid) {
    // Limpar e formatar dados antes de enviar
    const dados = {
      nome: this.form.value.nome.trim(),
      cpf: this.form.value.cpf.replace(/\D/g, ''), // Remove máscaras
      cnpj: this.form.value.cnpj.replace(/\D/g, ''),
      telefone: this.form.value.telefone.replace(/\D/g, ''),
      email: this.form.value.email.trim().toLowerCase()
    };

    // Enviar para o backend
    this.service.salvar(dados).subscribe({
      next: (response) => {
        console.log('Salvo com sucesso!', response);
        this.router.navigate(['/lista']);
      },
      error: (error) => {
        console.error('Erro ao salvar:', error);
      }
    });
  } else {
    // Marcar todos os campos como touched para mostrar erros
    Object.keys(this.form.controls).forEach(key => {
      this.form.get(key)?.markAsTouched();
    });
    console.error('Formulário inválido. Verifique os campos.');
  }
}
*/

// ============================================
// FORMATOS ACEITOS PELOS VALIDADORES
// ============================================

/*
CPF: 
  - Aceita com ou sem máscara
  - Exemplos válidos: "12345678901", "123.456.789-01"
  - Valida dígitos verificadores

CNPJ:
  - Aceita com ou sem máscara
  - Exemplos válidos: "12345678000195", "12.345.678/0001-95"
  - Valida dígitos verificadores

Telefone:
  - Formato: (XX) 9XXXX-XXXX ou (XX) XXXX-XXXX
  - DDD obrigatório (11-99)
  - Celular: 11 dígitos (DDD + 9 + 8 dígitos)
  - Fixo: 10 dígitos (DDD + 8 dígitos)
  - Exemplos: "(11) 98765-4321", "(11) 3456-7890"

Nome:
  - Mínimo: 3 caracteres
  - Máximo: 100 caracteres
  - Deve ter pelo menos nome e sobrenome
  - Apenas letras e espaços (aceita acentos)
  - Exemplos: "João Silva", "Maria da Silva Santos"

Senha Forte:
  - Mínimo: 8 caracteres
  - Deve conter:
    * Pelo menos uma letra maiúscula (A-Z)
    * Pelo menos uma letra minúscula (a-z)
    * Pelo menos um número (0-9)
    * Pelo menos um caractere especial (!@#$%^&*()_+-=[]{}|;:'"<>?,.)
  - Exemplo: "Senha@123"

Data de Nascimento:
  - Não pode ser futura
  - Idade mínima configurável (padrão: 18 anos)
  - Idade máxima: 120 anos
  - Formato: YYYY-MM-DD
*/
