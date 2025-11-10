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
import { Usuario, PessoaFisicaDTO } from '../../../models/usuario.model';
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
      next: (usuario: any) => {
        console.log('✅ Usuário carregado:', usuario);
        console.log('📋 Campos disponíveis:', Object.keys(usuario));
        
        // Separa nome e sobrenome se vier concatenado
        let nome = '';
        let sobrenome = '';
        
        if (usuario.sobrenome) {
          // Backend retorna nome e sobrenome separados
          nome = usuario.nome || '';
          sobrenome = usuario.sobrenome || '';
        } else if (usuario.nome) {
          // Backend retorna nome completo concatenado
          const nomeCompleto = usuario.nome.split(' ');
          nome = nomeCompleto[0];
          sobrenome = nomeCompleto.slice(1).join(' ') || '';
        }
        
        // Formata CPF se vier sem formatação
        let cpfFormatado = usuario.cpf || '';
        if (cpfFormatado && cpfFormatado.length === 11 && !cpfFormatado.includes('.')) {
          cpfFormatado = cpfFormatado.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
        }
        
        // Converte data se necessário
        let dataNascimento = usuario.dataNascimento || '';
        if (dataNascimento && typeof dataNascimento === 'string') {
          // Se vier como string ISO (YYYY-MM-DD), converte para Date object
          dataNascimento = new Date(dataNascimento + 'T00:00:00');
        }
        
        console.log('📝 Preenchendo formulário com:', {
          nome,
          sobrenome,
          email: usuario.email,
          cpf: cpfFormatado,
          dataNascimento,
          perfis: usuario.perfis
        });
        
        // Perfil: pega o primeiro do array ou usa USER como padrão
        const perfilSelecionado = Array.isArray(usuario.perfis) && usuario.perfis.length > 0
          ? usuario.perfis[0]
          : Perfil.USER;
        
        this.usuarioForm.patchValue({
          nome: nome,
          sobrenome: sobrenome,
          email: usuario.email || '',
          cpf: cpfFormatado,
          dataNascimento: dataNascimento,
          perfis: perfilSelecionado
        });
        
        // Em modo edição, senha não é obrigatória
        this.usuarioForm.get('senha')?.clearValidators();
        this.usuarioForm.get('senha')?.updateValueAndValidity();
        
        console.log('✅ Formulário preenchido. Valores atuais:', this.usuarioForm.value);
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
      
      // Garante que perfis seja sempre um array
      const perfis = Array.isArray(this.usuarioForm.value.perfis) 
        ? this.usuarioForm.value.perfis 
        : [this.usuarioForm.value.perfis];
      
      const dto: any = {
        nome: this.usuarioForm.value.nome.trim(),
        sobrenome: this.usuarioForm.value.sobrenome.trim(),
        email: this.usuarioForm.value.email.trim().toLowerCase(),
        cpf: cpfSemFormatacao,
        dataNascimento: dataFormatada,
        perfis: perfis
      };

      // Adiciona senha apenas se estiver preenchida (criar ou editar com nova senha)
      if (this.usuarioForm.value.senha) {
        dto.senha = this.usuarioForm.value.senha;
      }

      console.log('📤 Enviando dados:', dto);

      if (this.isEditMode && this.usuarioId) {
        // Atualizar usuário
        this.usuarioService.update(this.usuarioId, dto).subscribe({
          next: () => {
            console.log('✅ Usuário atualizado com sucesso');
            this.snackBar.open('Usuário atualizado com sucesso!', 'OK', { duration: 3000 });
            this.router.navigate(['/admin/usuarios']);
          },
          error: (error) => this.handleError(error, 'Erro ao atualizar usuário')
        });
      } else {
        // Criar novo usuário
        this.usuarioService.create(dto).subscribe({
          next: (usuario) => {
            console.log('✅ Usuário criado com sucesso:', usuario);
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

  onCancel(): void {
    this.router.navigate(['/admin/usuarios']);
  }

  voltar(): void {
    this.location.back();
  }
}
