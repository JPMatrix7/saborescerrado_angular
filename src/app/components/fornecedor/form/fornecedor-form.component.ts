import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { ActivatedRoute, Router } from '@angular/router';
import { FornecedorService } from '../../../services/fornecedor.service';
import { Fornecedor } from '../../../models/fornecedor.model';

@Component({
  selector: 'app-fornecedor-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule
  ],
  templateUrl: './fornecedor-form.component.html',
  styleUrl: './fornecedor-form.component.css'
})
export class FornecedorFormComponent implements OnInit {
  fornecedorForm!: FormGroup;
  isEditMode = false;
  fornecedorId?: number;

  constructor(
    private fb: FormBuilder,
    private fornecedorService: FornecedorService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.createForm();
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.fornecedorId = +params['id'];
        this.loadFornecedor(this.fornecedorId);
      }
    });
  }

  createForm(): void {
    this.fornecedorForm = this.fb.group({
      razaoSocial: ['', [Validators.required, Validators.minLength(3)]],
      nomeFantasia: ['', [Validators.required]],
      cnpj: ['', [Validators.required]],
      telefone: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  loadFornecedor(id: number): void {
    this.fornecedorService.findById(id).subscribe({
      next: (fornecedor) => {
        this.fornecedorForm.patchValue(fornecedor);
      },
      error: (error) => console.error('Erro ao carregar fornecedor:', error)
    });
  }

  onSubmit(): void {
    if (this.fornecedorForm.valid) {
      const fornecedor: Fornecedor = this.fornecedorForm.value;

      if (this.isEditMode && this.fornecedorId) {
        this.fornecedorService.update(this.fornecedorId, fornecedor).subscribe({
          next: () => this.router.navigate(['/admin/fornecedores']),
          error: (error) => console.error('Erro ao atualizar fornecedor:', error)
        });
      } else {
        this.fornecedorService.create(fornecedor).subscribe({
          next: () => this.router.navigate(['/admin/fornecedores']),
          error: (error) => console.error('Erro ao criar fornecedor:', error)
        });
      }
    }
  }

  onCancel(): void {
    this.router.navigate(['/admin/fornecedores']);
  }
}
