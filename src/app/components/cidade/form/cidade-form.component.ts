import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { ActivatedRoute, Router } from '@angular/router';
import { CidadeService } from '../../../services/cidade.service';
import { EstadoService } from '../../../services/estado.service';
import { Cidade, Estado } from '../../../models/endereco.model';

@Component({
  selector: 'app-cidade-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCardModule
  ],
  templateUrl: './cidade-form.component.html',
  styleUrl: './cidade-form.component.css'
})
export class CidadeFormComponent implements OnInit {
  cidadeForm!: FormGroup;
  estados = signal<Estado[]>([]);
  isEditMode = false;
  cidadeId?: number;

  constructor(
    private fb: FormBuilder,
    private cidadeService: CidadeService,
    private estadoService: EstadoService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.createForm();
  }

  ngOnInit(): void {
    this.loadEstados();
    
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.cidadeId = +params['id'];
        this.loadCidade(this.cidadeId);
      }
    });
  }

  createForm(): void {
    this.cidadeForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      estado: [null, [Validators.required]]
    });
  }

  loadEstados(): void {
    this.estadoService.findAll().subscribe({
      next: (data) => this.estados.set(data),
      error: (error) => console.error('Erro ao carregar estados:', error)
    });
  }

  loadCidade(id: number): void {
    this.cidadeService.findById(id).subscribe({
      next: (cidade) => {
        // Se o estado vier como objeto, extrair apenas o ID
        const estadoId = typeof cidade.estado === 'object' && cidade.estado ? cidade.estado.id : cidade.estado;
        this.cidadeForm.patchValue({
          nome: cidade.nome,
          estado: estadoId
        });
      },
      error: (error) => console.error('Erro ao carregar cidade:', error)
    });
  }

  onSubmit(): void {
    if (this.cidadeForm.valid) {
      const cidade: Cidade = {
        nome: this.cidadeForm.value.nome,
        estado: this.cidadeForm.value.estado // Envia apenas o ID do estado
      };

      if (this.isEditMode && this.cidadeId) {
        this.cidadeService.update(this.cidadeId, cidade).subscribe({
          next: () => this.router.navigate(['/admin/cidades']),
          error: (error) => console.error('Erro ao atualizar cidade:', error)
        });
      } else {
        this.cidadeService.create(cidade).subscribe({
          next: () => this.router.navigate(['/admin/cidades']),
          error: (error) => console.error('Erro ao criar cidade:', error)
        });
      }
    }
  }

  onCancel(): void {
    this.router.navigate(['/admin/cidades']);
  }
}
