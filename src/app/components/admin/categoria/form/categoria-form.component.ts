import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoriaService } from '@services/categoria.service';
import { Categoria } from '@models/categoria.model';

@Component({
  selector: 'app-categoria-form',
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
  templateUrl: './categoria-form.component.html',
  styleUrl: './categoria-form.component.css'
})
export class CategoriaFormComponent implements OnInit {
  categoriaForm!: FormGroup;
  isEditMode = false;
  categoriaId?: number;

  constructor(
    private fb: FormBuilder,
    private categoriaService: CategoriaService,
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
        this.categoriaId = +params['id'];
        this.loadCategoria(this.categoriaId);
      }
    });
  }

  createForm(): void {
    this.categoriaForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      descricao: ['']
    });
  }

  loadCategoria(id: number): void {
    this.categoriaService.findById(id).subscribe({
      next: (categoria: Categoria) => {
        this.categoriaForm.patchValue(categoria);
      },
      error: (error: unknown) => console.error('Erro ao carregar categoria:', error)
    });
  }

  onSubmit(): void {
    if (this.categoriaForm.valid) {
      const categoria: Categoria = this.categoriaForm.value;

      if (this.isEditMode && this.categoriaId) {
        this.categoriaService.update(this.categoriaId, categoria).subscribe({
          next: () => this.router.navigate(['/admin/categorias']),
          error: (error: unknown) => console.error('Erro ao atualizar categoria:', error)
        });
      } else {
        this.categoriaService.create(categoria).subscribe({
          next: () => this.router.navigate(['/admin/categorias']),
          error: (error: unknown) => console.error('Erro ao criar categoria:', error)
        });
      }
    }
  }

  onCancel(): void {
    this.router.navigate(['/admin/categorias']);
  }

  voltar(): void {
    this.location.back();
  }
}
