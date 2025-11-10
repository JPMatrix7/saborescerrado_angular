import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Usuario, PessoaFisicaDTO, UsuarioCreateDTO, UsuarioUpdateDTO } from '../../../models/usuario.model';
import { Perfil } from '../../../models/enums.model';
import { CustomValidators } from '../../../validators/custom-validators';
import { UsuarioService } from '../../../services/usuario.service';

@Component({
  selector: 'app-usuario-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatSelectModule,
    MatIconModule,
    MatSnackBarModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './usuario-form.component.html',
  styleUrl: './usuario-form.component.css'
})
export class UsuarioFormComponent implements OnInit {
  usuarioForm!: FormGroup;
  isEditMode = false;
  usuarioId?: number;
  hidePassword = true;

  perfisDisponiveis = [
    { value: Perfil.ADMIN, label: 'Admin' },
    { value: Perfil.USER, label: 'Usuário' }
  ];

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location,
    private snackBar: MatSnackBar
  ) {
    this.createForm();
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.usuarioId = +params['id'];
        this.loadUsuario(this.usuarioId);
      }
    });
  }

  createForm(): void {
    this.usuarioForm = this.fb.group({
      nome: ['', [
        Validators.required, 
        Validators.minLength(3),
        Validators.maxLength(100)
      ]],
      sobrenome: ['', [
        Validators.required, 
        Validators.minLength(3),
        Validators.maxLength(100)
      ]],
      email: ['', [
        Validators.required, 
        Validators.email
      ]],
      cpf: ['', [
        Validators.required,
        CustomValidators.cpf()
      ]],
      dataNascimento: ['', [
        Validators.required,
        this.validadorDataPassada
      ]],
      senha: ['', [
        Validators.required, 
        Validators.minLength(6)
      ]],
      perfis: [Perfil.USER, Validators.required]
    });
  }

  // Validador customizado para data passada
  validadorDataPassada(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    
    const dataInformada = new Date(control.value);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    if (dataInformada >= hoje) {
      return { dataFutura: true };
    }
    
    return null;
  }

  loadUsuario(id: number): void {
    this.usuarioService.getById(id).subscribe({
      next: (usuario: Usuario) => {
        console.log('✅ Usuário carregado:', usuario);
        
        // Formata CPF se vier sem formatação (11 dígitos)
        let cpfFormatado = usuario.cpf || '';
        if (cpfFormatado && cpfFormatado.length === 11 && !cpfFormatado.includes('.')) {
          cpfFormatado = cpfFormatado.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
        }
        
        // Converte data string para Date object para o datepicker
        let dataNascimento = usuario.dataNascimento ? new Date(usuario.dataNascimento) : null;
        
        // Pega primeiro perfil do array
        const perfilSelecionado = Array.isArray(usuario.perfis) && usuario.perfis.length > 0
          ? usuario.perfis[0]
          : Perfil.USER;
        
        console.log('📝 Preenchendo formulário:', {
          nome: usuario.nome,
          sobrenome: usuario.sobrenome,
          email: usuario.email,
          cpf: cpfFormatado,
          dataNascimento,
          perfis: perfilSelecionado
        });
        
        this.usuarioForm.patchValue({
          nome: usuario.nome,
          sobrenome: usuario.sobrenome,
          email: usuario.email,
          cpf: cpfFormatado,
          dataNascimento: dataNascimento,
          perfis: perfilSelecionado
        });
        
        // Em modo edição, senha não é obrigatória
        this.usuarioForm.get('senha')?.clearValidators();
        this.usuarioForm.get('senha')?.updateValueAndValidity();
        
        console.log('✅ Formulário preenchido');
      },
      error: (error) => {
        console.error('❌ Erro ao carregar usuário:', error);
        this.snackBar.open('Erro ao carregar usuário', 'OK', { duration: 3000 });
        this.router.navigate(['/admin/usuarios']);
      }
    });
  }

  onSubmit(): void {
    if (this.usuarioForm.valid) {
      // Remove formatação do CPF (apenas números)
      const cpfSemFormatacao = this.usuarioForm.value.cpf.replace(/\D/g, '');
      
      // Formata data para ISO 8601 (YYYY-MM-DD)
      const dataNascimento = new Date(this.usuarioForm.value.dataNascimento);
      const dataFormatada = dataNascimento.toISOString().split('T')[0];
      
      // Converte perfil único para array
      const perfis = Array.isArray(this.usuarioForm.value.perfis) 
        ? this.usuarioForm.value.perfis 
        : [this.usuarioForm.value.perfis];

      if (this.isEditMode && this.usuarioId) {
        // ========== EDIÇÃO (PUT) ==========
        const updateDto: UsuarioUpdateDTO = {
          nome: this.usuarioForm.value.nome.trim(),
          sobrenome: this.usuarioForm.value.sobrenome.trim(),
          email: this.usuarioForm.value.email.trim().toLowerCase(),
          cpf: cpfSemFormatacao,
          dataNascimento: dataFormatada
        };

        // Adiciona senha APENAS se foi preenchida
        if (this.usuarioForm.value.senha && this.usuarioForm.value.senha.trim()) {
          updateDto.senha = this.usuarioForm.value.senha;
        }

        console.log('📤 PUT /usuario/' + this.usuarioId, updateDto);

        this.usuarioService.update(this.usuarioId, updateDto).subscribe({
          next: () => {
            console.log('✅ Usuário atualizado com sucesso');
            this.snackBar.open('Usuário atualizado com sucesso!', 'OK', { duration: 3000 });
            this.router.navigate(['/admin/usuarios']);
          },
          error: (error) => this.handleError(error, 'Erro ao atualizar usuário')
        });
      } else {
        // ========== CRIAÇÃO (POST) ==========
        const createDto: UsuarioCreateDTO = {
          nome: this.usuarioForm.value.nome.trim(),
          sobrenome: this.usuarioForm.value.sobrenome.trim(),
          email: this.usuarioForm.value.email.trim().toLowerCase(),
          cpf: cpfSemFormatacao,
          dataNascimento: dataFormatada,
          senha: this.usuarioForm.value.senha, // Obrigatório na criação
          perfis: perfis // Envia perfis na criação
        };

        console.log('📤 POST /usuario', createDto);

        this.usuarioService.create(createDto).subscribe({
          next: (usuario) => {
            console.log('✅ Usuário criado:', usuario);
            this.snackBar.open('Usuário criado com sucesso!', 'OK', { duration: 3000 });
            this.router.navigate(['/admin/usuarios']);
          },
          error: (error) => this.handleError(error, 'Erro ao criar usuário')
        });
      }
    } else {
      // Marca todos os campos como touched para mostrar os erros
      Object.keys(this.usuarioForm.controls).forEach(key => {
        this.usuarioForm.get(key)?.markAsTouched();
      });
      
      console.error('❌ Formulário inválido. Erros:');
      Object.keys(this.usuarioForm.controls).forEach(key => {
        const control = this.usuarioForm.get(key);
        if (control?.invalid) {
          console.error(`  - ${key}:`, control.errors);
        }
      });
      
      this.snackBar.open('Por favor, corrija os erros no formulário', 'OK', { duration: 3000 });
    }
  }

  handleError(error: any, mensagemPadrao: string): void {
    console.error('❌ Erro:', error);
    
    // Tratamento de erros de validação do backend
    if (error.status === 400 && error.error?.violations) {
      console.error('Violações de validação:', error.error.violations);
      
      error.error.violations.forEach((violation: any) => {
        const control = this.usuarioForm.get(violation.field);
        if (control) {
          control.setErrors({ backend: violation.message });
        }
      });
      
      this.snackBar.open('Corrija os erros de validação', 'OK', { duration: 4000 });
    } else if (error.status === 404) {
      this.snackBar.open('Usuário não encontrado', 'OK', { duration: 3000 });
    } else {
      this.snackBar.open(mensagemPadrao, 'OK', { duration: 3000 });
    }
  }

  // Função helper para formatar CPF enquanto digita
  formatarCpf(event: any): void {
    let valor = event.target.value.replace(/\D/g, '');
    
    if (valor.length <= 11) {
      valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
      valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
      valor = valor.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
      event.target.value = valor;
      this.usuarioForm.patchValue({ cpf: valor }, { emitEvent: false });
    }
  }

  // Função helper para formatar Data enquanto digita
  formatarData(event: any): void {
    const input = event.target as HTMLInputElement;
    let valor = input.value.replace(/\D/g, '');
    
    // Limita a 8 dígitos (DDMMAAAA)
    if (valor.length > 8) {
      valor = valor.slice(0, 8);
    }
    
    // Aplica formatação DD/MM/AAAA
    if (valor.length >= 5) {
      valor = valor.replace(/(\d{2})(\d{2})(\d{0,4})/, '$1/$2/$3');
    } else if (valor.length >= 3) {
      valor = valor.replace(/(\d{2})(\d{0,2})/, '$1/$2');
    }
    
    // Se o usuário digitou 8 dígitos, tentar criar um objeto Date válido
    const apenasDigitos = valor.replace(/\D/g, '');
    if (apenasDigitos.length === 8) {
      const dia = parseInt(apenasDigitos.slice(0, 2));
      const mes = parseInt(apenasDigitos.slice(2, 4));
      const ano = parseInt(apenasDigitos.slice(4, 8));
      
      // Validar se é uma data válida
      const dataObj = new Date(ano, mes - 1, dia);
      const dataValida = dataObj.getDate() === dia && 
                         dataObj.getMonth() === mes - 1 && 
                         dataObj.getFullYear() === ano;
      
      if (dataValida) {
        // Atualizar o FormControl com o objeto Date válido
        this.usuarioForm.patchValue({ dataNascimento: dataObj }, { emitEvent: false });
        // Manter o texto formatado no input
        input.value = valor;
        return;
      }
    }
    
    // Apenas formatar o texto sem atualizar o FormControl se ainda não temos data completa
    input.value = valor;
  }

  onCancel(): void {
    this.router.navigate(['/admin/usuarios']);
  }

  voltar(): void {
    this.location.back();
  }
}
