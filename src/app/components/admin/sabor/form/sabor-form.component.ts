import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { SaborService } from '@services/sabor.service';
import { Sabor } from '@models/licor.model';

@Component({
  selector: 'app-sabor-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './sabor-form.component.html',
  styleUrl: './sabor-form.component.css'
})
export class SaborFormComponent implements OnInit {
  saborForm!: FormGroup;
  isEditMode = false;
  saborId?: number;

  constructor(
    private fb: FormBuilder,
    private saborService: SaborService,
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
        this.saborId = +params['id'];
        this.loadSabor(this.saborId);
      }
    });
  }

  createForm(): void {
    this.saborForm = this.fb.group({
      nome: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(100)
      ]]
    });
  }

  loadSabor(id: number): void {
    this.saborService.findById(id).subscribe({
      next: (sabor) => {
        this.saborForm.patchValue(sabor);
      },
      error: (error: unknown) => {
        console.error('Erro ao carregar sabor:', error);
        this.snackBar.open('Erro ao carregar sabor', 'OK', { duration: 3000 });
        this.router.navigate(['/admin/sabores']);
      }
    });
  }

  onSubmit(): void {
    if (this.saborForm.valid) {
      const sabor: Sabor = this.saborForm.value;

      if (this.isEditMode && this.saborId) {
        this.saborService.update(this.saborId, sabor).subscribe({
          next: () => {
            this.snackBar.open('Sabor atualizado com sucesso!', 'OK', { duration: 3000 });
            this.router.navigate(['/admin/sabores']);
          },
          error: (error: unknown) => {
            console.error('Erro ao atualizar sabor:', error);
            this.snackBar.open('Erro ao atualizar sabor', 'OK', { duration: 3000 });
          }
        });
      } else {
        this.saborService.create(sabor).subscribe({
          next: () => {
            this.snackBar.open('Sabor criado com sucesso!', 'OK', { duration: 3000 });
            this.router.navigate(['/admin/sabores']);
          },
          error: (error: unknown) => {
            console.error('Erro ao criar sabor:', error);
            this.snackBar.open('Erro ao criar sabor', 'OK', { duration: 3000 });
          }
        });
      }
    } else {
      this.saborForm.markAllAsTouched();
      this.snackBar.open('Por favor, corrija os erros no formulário', 'OK', { duration: 3000 });
    }
  }

  onCancel(): void {
    this.router.navigate(['/admin/sabores']);
  }

  voltar(): void {
    this.location.back();
  }
}
