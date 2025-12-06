import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { EstadoService } from '@services/estado.service';
import { Estado } from '@models/endereco.model';

@Component({
  selector: 'app-estado-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './estado-form.component.html',
  styleUrl: './estado-form.component.css'
})
export class EstadoFormComponent implements OnInit {
  estadoForm!: FormGroup;
  isEditMode = false;
  estadoId?: number;

  constructor(
    private fb: FormBuilder,
    private estadoService: EstadoService,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location
  ) {
    this.createForm();
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.estadoId = +params['id'];
        this.loadEstado(this.estadoId);
      }
    });
  }

  createForm(): void {
    this.estadoForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      sigla: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(2)]]
    });
  }

  loadEstado(id: number): void {
    this.estadoService.findById(id).subscribe({
      next: (estado: Estado) => {
        this.estadoForm.patchValue(estado);
      },
      error: (error: unknown) => console.error('Erro ao carregar estado:', error)
    });
  }

  onSubmit(): void {
    if (this.estadoForm.valid) {
      const estado: Estado = this.estadoForm.value;

      if (this.isEditMode && this.estadoId) {
        this.estadoService.update(this.estadoId, estado).subscribe({
          next: () => this.router.navigate(['/admin/estados']),
          error: (error: unknown) => console.error('Erro ao atualizar estado:', error)
        });
      } else {
        this.estadoService.create(estado).subscribe({
          next: () => this.router.navigate(['/admin/estados']),
          error: (error: unknown) => console.error('Erro ao criar estado:', error)
        });
      }
    }
  }

  onCancel(): void {
    this.router.navigate(['/admin/estados']);
  }

  voltar(): void {
    this.location.back();
  }
}
