import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { Router } from '@angular/router';
import { AuthService } from '@services/auth.service';
import { UsuarioService } from '@services/usuario.service';
import { TelefoneService } from '@services/telefone.service';
import { EnderecoService } from '@services/endereco.service';
import { EstadoService } from '@services/estado.service';
import { CidadeService } from '@services/cidade.service';
import { Usuario } from '@models/usuario.model';
import { UsuarioAuth } from '@models/auth.model';
import { Telefone, TelefonePayload } from '@models/telefone.model';
import { Cidade, Endereco, EnderecoDTO, Estado } from '@models/endereco.model';
import { CpfMaskDirective } from '../../../directives/cpf-mask.directive';
import { forkJoin } from 'rxjs';

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
    MatSelectModule,
    CpfMaskDirective
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private usuarioService = inject(UsuarioService);
  private telefoneService = inject(TelefoneService);
  private enderecoService = inject(EnderecoService);
  private estadoService = inject(EstadoService);
  private cidadeService = inject(CidadeService);
  private router = inject(Router);

  user: UsuarioAuth | null = null;
  userDetails: Usuario | null = null;
  loading = false; // personal data save
  savingTelefone = false;
  savingEndereco = false;
  loadingProfile = false;
  message = '';
  error = '';
  hidePassword = true;
  hideConfirmPassword = true;
  isEditing = false;
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

  telefoneForm: FormGroup = this.fb.group({
    id: [null],
    codigoArea: ['', [Validators.pattern(/^\d{2}$/)]],
    numero: ['', [Validators.pattern(/^9\d{8}$/)]]
  });

  enderecoForm: FormGroup = this.fb.group({
    id: [null],
    logradouro: [''],
    numero: [''],
    complemento: [''],
    bairro: [''],
    cep: ['', [Validators.pattern(/^\d{8}$/)]],
    estadoId: [null, Validators.required],
    cidadeId: [null, Validators.required]
  });

  estados: Estado[] = [];
  cidades: Cidade[] = [];
  cidadesFiltradas: Cidade[] = [];
  estadoSelecionado?: Estado;

  ngOnInit(): void {
    this.user = this.authService.getUser();
    this.loadEstadosECidades();
    this.loadProfile();
  }

  private loadProfile(): void {
    this.error = '';
    this.message = '';
    this.loadingProfile = true;
    this.usuarioService.getMe().subscribe({
      next: (details) => {
        this.userDetails = details;
        this.patchForm(details);
        this.patchTelefoneForm(details.telefones?.[0]);
        this.patchEnderecoForm(details.enderecos?.[0]);
        this.setReadOnlyMode();
        this.loadingProfile = false;
      },
      error: (err) => {
        this.loadingProfile = false;
        this.handleUnauthorized(err);
        this.error =
          (err as any)?.error?.message || (err as any)?.message || 'Erro ao carregar dados do perfil.';
        this.setReadOnlyMode();
      }
    });
  }

  private patchForm(details: Usuario): void {
    this.form.patchValue({
      nome: details.nome,
      sobrenome: details.sobrenome,
      email: details.email,
      cpf: details.cpf,
      dataNascimento: details.dataNascimento?.substring(0, 10) || ''
    });
    this.form.get('senha')?.reset();
    this.form.get('confirmarSenha')?.reset();
  }

  private patchTelefoneForm(telefone?: Telefone): void {
    this.telefoneForm.patchValue({
      id: telefone?.id ?? null,
      codigoArea: telefone?.codigoArea || telefone?.ddd || '',
      numero: telefone?.numero || ''
    });
  }

  private patchEnderecoForm(endereco?: Endereco): void {
    const cidadeId = this.getCidadeId(endereco);
    const estadoId = this.getEstadoId(endereco);

    this.enderecoForm.patchValue({
      id: endereco?.id ?? null,
      logradouro: endereco?.logradouro || '',
      numero: endereco?.numero || '',
      complemento: endereco?.complemento || '',
      bairro: endereco?.bairro || '',
      cep: endereco?.cep || '',
      estadoId: estadoId ?? null,
      cidadeId: cidadeId ?? null
    });

    this.onEstadoChange(estadoId, cidadeId, true);
  }

  startEdit(): void {
    if (!this.userDetails) return;
    this.message = '';
    this.error = '';
    this.isEditing = true;
    this.form.enable({ emitEvent: false });
    this.form.get('email')?.disable({ emitEvent: false });
    this.form.get('cpf')?.disable({ emitEvent: false });
    this.telefoneForm.enable({ emitEvent: false });
    this.enderecoForm.enable({ emitEvent: false });
  }

  onSubmit(): void {
    if (!this.user || !this.userDetails) {
      this.error = 'Faça login para editar seus dados.';
      return;
    }

    if (!this.isEditing) {
      this.error = 'Clique em "Editar perfil" para alterar seus dados.';
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.message = '';
    this.error = '';

    const senha = this.form.value.senha;
    const confirmarSenha = this.form.value.confirmarSenha;
    if ((senha || confirmarSenha) && senha !== confirmarSenha) {
      this.error = 'As senhas nao conferem.';
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

    this.usuarioService.update(this.userDetails.id!, dto).subscribe({
      next: () => {
        if (!this.userDetails) return;
        this.loading = false;
        this.message = 'Dados atualizados com sucesso.';
        this.authService.updateStoredUser({ nome: dto.nome });
        if (senha && this.userDetails?.id) {
          this.usuarioService.updateSenha(this.userDetails.id, senha).subscribe();
        }
        const updatedUser: Usuario = { ...this.userDetails, ...dto };
        this.userDetails = updatedUser;
        this.patchForm(updatedUser);
      },
      error: (err: unknown) => this.handleError(err)
    });
  }

  saveTelefone(): void {
    if (!this.userDetails) {
      this.error = 'Faça login para editar o telefone.';
      return;
    }
    if (!this.isEditing) {
      this.error = 'Clique em "Editar perfil" para alterar o telefone.';
      return;
    }

    const payload = this.buildTelefonePayload();
    if (!payload) return;

    if (this.telefoneForm.invalid) {
      this.telefoneForm.markAllAsTouched();
      return;
    }

    this.savingTelefone = true;
    this.message = '';
    this.error = '';

    const telefoneId = this.telefoneForm.value.id || this.userDetails.telefones?.[0]?.id;
    const request$ = telefoneId
      ? this.telefoneService.update(telefoneId, payload)
      : this.telefoneService.create(payload);

    request$.subscribe({
      next: (telefone) => {
        if (!this.userDetails) return;
        this.savingTelefone = false;
        this.message = 'Telefone atualizado com sucesso.';
        const telefoneAtualizado: Telefone = telefone || { ...payload, id: telefoneId };
        this.userDetails.telefones = [telefoneAtualizado];
        this.patchTelefoneForm(telefoneAtualizado);
      },
      error: (err: unknown) => {
        this.savingTelefone = false;
        this.handleUnauthorized(err);
        this.error = (err as any)?.friendlyMessage || (err as any)?.message || 'Erro ao salvar telefone.';
      }
    });
  }

  saveEndereco(): void {
    if (!this.userDetails) {
      this.error = 'Faça login para editar o endereço.';
      return;
    }
    if (!this.isEditing) {
      this.error = 'Clique em "Editar perfil" para alterar o endereço.';
      return;
    }

    const payload = this.buildEnderecoPayload();
    if (!payload) return;

    if (this.enderecoForm.invalid) {
      this.enderecoForm.markAllAsTouched();
      return;
    }

    this.savingEndereco = true;
    this.message = '';
    this.error = '';

    const enderecoId = this.enderecoForm.value.id || this.userDetails.enderecos?.[0]?.id;
    const request$ = enderecoId
      ? this.enderecoService.update(enderecoId, payload)
      : this.enderecoService.create(payload);

    request$.subscribe({
      next: (endereco) => {
        if (!this.userDetails) return;
        this.savingEndereco = false;
        this.message = 'Endereco atualizado com sucesso.';
        const enderecoAtualizado: Endereco = endereco || { ...payload, id: enderecoId };
        this.userDetails.enderecos = [enderecoAtualizado];
        this.patchEnderecoForm(enderecoAtualizado);
      },
      error: (err: unknown) => {
        this.savingEndereco = false;
        this.handleUnauthorized(err);
        this.error = (err as any)?.friendlyMessage || (err as any)?.message || 'Erro ao salvar endereco.';
      }
    });
  }

  cancelEdit(): void {
    if (!this.userDetails) return;
    this.patchForm(this.userDetails);
    this.patchTelefoneForm(this.userDetails.telefones?.[0]);
    this.patchEnderecoForm(this.userDetails.enderecos?.[0]);
    this.setReadOnlyMode();
    this.message = '';
    this.error = '';
  }

  private handleError(err: unknown): void {
    this.loading = false;
    this.handleUnauthorized(err);
    this.error = (err as any)?.friendlyMessage || (err as any)?.message || 'Erro ao atualizar dados.';
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

  private buildTelefonePayload(): TelefonePayload | null {
    const codigoArea = (this.telefoneForm.value.codigoArea || '').toString().replace(/\D/g, '');
    const numero = (this.telefoneForm.value.numero || '').toString().replace(/\D/g, '');
    const hasData = !!codigoArea || !!numero;

    if (!hasData) return null;
    if (!codigoArea || !numero) {
      this.error = 'Informe codigo de area e numero do telefone.';
      return null;
    }

    return { codigoArea, numero };
  }

  private buildEnderecoPayload(): EnderecoDTO | null {
    const { logradouro, numero, complemento, bairro, cidadeId, estadoId } = this.enderecoForm.value;
    const cep = (this.enderecoForm.value.cep || '').toString().replace(/\D/g, '');
    const hasData = !!logradouro || !!numero || !!bairro || !!cep || !!cidadeId || !!estadoId;

    if (!hasData) return null;
    if (!logradouro || !numero || !bairro || !cep || !cidadeId || !estadoId) {
      this.error = 'Preencha todos os campos de endereço (estado, cidade, cep, logradouro, numero e bairro).';
      return null;
    }

    return {
      logradouro,
      numero,
      complemento: complemento || undefined,
      bairro,
      cep,
      cidadeId: Number(cidadeId)
    };
  }

  private getCidadeId(endereco?: Endereco): number | undefined {
    if (!endereco) return undefined;
    if (endereco.cidade?.id) return endereco.cidade.id;
    return endereco.cidadeId;
  }

  private getEstadoId(endereco?: Endereco): number | undefined {
    if (!endereco) return undefined;
    if (endereco.cidade?.estadoId) return endereco.cidade.estadoId;
    if (endereco.cidade?.estado?.id) return endereco.cidade.estado.id;
    return undefined;
  }

  private setReadOnlyMode(): void {
    this.isEditing = false;
    this.form.disable({ emitEvent: false });
    this.telefoneForm.disable({ emitEvent: false });
    this.enderecoForm.disable({ emitEvent: false });
  }

  private loadEstadosECidades(): void {
    forkJoin({
      estados: this.estadoService.findAll(),
      cidades: this.cidadeService.findAll()
    }).subscribe({
      next: ({ estados, cidades }) => {
        this.estados = estados || [];
        this.cidades = (cidades || []).map((cidade) => ({
          ...cidade,
          estadoId: cidade.estadoId ?? cidade.estado?.id
        }));

        const { estadoId, cidadeId } = this.enderecoForm.value;
        if (estadoId) {
          this.onEstadoChange(estadoId, cidadeId, true);
        }
      },
      error: (err: unknown) => {
        this.handleUnauthorized(err);
        this.error =
          (err as any)?.friendlyMessage ||
          (err as any)?.message ||
          'Erro ao carregar estados e cidades.';
      }
    });
  }

  onEstadoChange(estadoId?: number | null, cidadeIdToSelect?: number | null, keepCidade = false): void {
    const parsedEstadoId = estadoId ? Number(estadoId) : undefined;

    if (!parsedEstadoId) {
      this.estadoSelecionado = undefined;
      this.cidadesFiltradas = [];
      if (!keepCidade) {
        this.enderecoForm.patchValue({ cidadeId: null });
      }
      return;
    }

    this.estadoSelecionado = this.estados.find((estado) => estado.id === parsedEstadoId);
    this.cidadesFiltradas = this.filtrarCidadesPorEstado(parsedEstadoId);

    if (cidadeIdToSelect) {
      const cidadeEncontrada = this.cidadesFiltradas.find((cidade) => cidade.id === Number(cidadeIdToSelect));
      this.enderecoForm.patchValue({ cidadeId: cidadeEncontrada?.id ?? null });
    } else if (!keepCidade) {
      this.enderecoForm.patchValue({ cidadeId: null });
    }
  }

  onCidadeChange(cidadeId: number): void {
    this.enderecoForm.patchValue({ cidadeId });
  }

  private filtrarCidadesPorEstado(estadoId?: number): Cidade[] {
    if (!estadoId) return [];
    return this.cidades.filter((cidade) => {
      const cidadeEstadoId = cidade.estadoId ?? cidade.estado?.id;
      return cidadeEstadoId === estadoId;
    });
  }

  private handleUnauthorized(err: any): void {
    if (err?.status === 401) {
      this.authService.logout();
      this.router.navigate(['/login']);
    }
  }
}
