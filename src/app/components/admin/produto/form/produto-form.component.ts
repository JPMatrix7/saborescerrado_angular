import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { ProdutoService } from '@services/produto.service';
import { CategoriaService } from '@services/categoria.service';
import { FornecedorService } from '@services/fornecedor.service';
import { SaborService } from '@services/sabor.service';
import { EmbalagemService } from '@services/embalagem.service';
import { SafraService } from '@services/safra.service';
import { Produto } from '@models/produto.model';
import { Categoria } from '@models/categoria.model';
import { Fornecedor } from '@models/fornecedor.model';
import { Sabor, Embalagem, SafraLicor } from '@models/licor.model';
import { TipoLicor } from '@models/enums.model';

@Component({
  selector: 'app-produto-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './produto-form.component.html',
  styleUrl: './produto-form.component.css'
})
export class ProdutoFormComponent implements OnInit {
  produtoForm!: FormGroup;
  categorias = signal<Categoria[]>([]);
  fornecedores = signal<Fornecedor[]>([]);
  sabores = signal<Sabor[]>([]);
  embalagens = signal<Embalagem[]>([]);
  safras = signal<SafraLicor[]>([]);
  tiposLicor = Object.values(TipoLicor);
  isEditMode = false;
  produtoId?: number;

  constructor(
    private fb: FormBuilder,
    private produtoService: ProdutoService,
    private categoriaService: CategoriaService,
    private fornecedorService: FornecedorService,
    private saborService: SaborService,
    private embalagemService: EmbalagemService,
    private safraService: SafraService,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location
  ) {
    this.createForm();
  }

  ngOnInit(): void {
    this.loadCategorias();
    this.loadFornecedores();
    this.loadSabores();
    this.loadEmbalagens();
    this.loadSafras();
    
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.produtoId = +params['id'];
        this.loadProduto(this.produtoId);
      }
    });
  }

  createForm(): void {
    this.produtoForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      descricao: [''],
      preco: [0, [Validators.required, Validators.min(0)]],
      estoque: [0, [Validators.required, Validators.min(0)]],
      teorAlcoolico: [0, [Validators.required, Validators.min(0)]],
      tipo: [TipoLicor.FRUTADO, Validators.required],
      categoriaId: [null, Validators.required],
      fornecedorId: [null, Validators.required],
      saborId: [null],
      embalagemId: [null],
      safraId: [null],
      imagemUrl: [''],
      ativo: [true]
    });
  }

  loadCategorias(): void {
    this.categoriaService.findAll().subscribe({
      next: (data) => this.categorias.set(data),
      error: (error: unknown) => console.error('Erro ao carregar categorias:', error)
    });
  }

  loadFornecedores(): void {
    this.fornecedorService.findAll().subscribe({
      next: (data) => this.fornecedores.set(data),
      error: (error: unknown) => console.error('Erro ao carregar fornecedores:', error)
    });
  }

  loadSabores(): void {
    this.saborService.findAll().subscribe({
      next: (data) => this.sabores.set(data),
      error: (error: unknown) => console.error('Erro ao carregar sabores:', error)
    });
  }

  loadEmbalagens(): void {
    this.embalagemService.findAll().subscribe({
      next: (data) => this.embalagens.set(data),
      error: (error: unknown) => console.error('Erro ao carregar embalagens:', error)
    });
  }

  loadSafras(): void {
    this.safraService.findAll().subscribe({
      next: (data) => this.safras.set(data),
      error: (error: unknown) => console.error('Erro ao carregar safras:', error)
    });
  }

  loadProduto(id: number): void {
    this.produtoService.findById(id).subscribe({
      next: (produto) => {
        this.produtoForm.patchValue({
          nome: produto.nome,
          descricao: produto.descricao,
          preco: produto.preco,
          estoque: produto.estoque,
          teorAlcoolico: produto.teorAlcoolico,
          tipo: produto.tipo || TipoLicor.FRUTADO,
          categoriaId: produto.categorias?.[0]?.id,
          fornecedorId: produto.parceiroComercial?.id,
          saborId: produto.sabor?.id,
          embalagemId: produto.embalagem?.id,
          safraId: produto.safra?.id,
          imagemUrl: produto.imagens?.[0] || '',
          ativo: produto.visivel
        });
      },
      error: (error: unknown) => console.error('Erro ao carregar produto:', error)
    });
  }

  onSubmit(): void {
    if (this.produtoForm.valid) {
      const formValue = this.produtoForm.value;
      
      // DTO conforme esperado pela API
      const licorDTO: any = {
        nome: formValue.nome,
        descricao: formValue.descricao || '',
        preco: formValue.preco,
        estoque: formValue.estoque,
        teorAlcoolico: formValue.teorAlcoolico,
        visivel: formValue.ativo,
        tipo: formValue.tipo,
        
        // IDs das entidades relacionadas
        sabor: formValue.saborId,
        embalagem: formValue.embalagemId,
        safralicor: formValue.safraId,
        parceiroComercial: formValue.fornecedorId,
        
        // Arrays de IDs
        categoriasIds: formValue.categoriaId ? [formValue.categoriaId] : [],
        ingredientesIds: [],
        premiacoesIds: []
      };

      console.log('DTO enviado para API:', JSON.stringify(licorDTO, null, 2));

      if (this.isEditMode && this.produtoId) {
        this.produtoService.update(this.produtoId, licorDTO).subscribe({
          next: (response) => {
            console.log('✅ Produto atualizado:', response);
            this.router.navigate(['/admin/produtos']);
          },
          error: (error: unknown) => {
            console.error('❌ Erro ao atualizar produto:', error);
            console.error('Status:', error.status);
            console.error('Mensagem:', error.error);
            alert(`Erro ao atualizar: ${error.error?.message || error.message}`);
          }
        });
      } else {
        this.produtoService.create(licorDTO).subscribe({
          next: (response) => {
            console.log('✅ Produto criado:', response);
            this.router.navigate(['/admin/produtos']);
          },
          error: (error: unknown) => {
            console.error('❌ Erro ao criar produto:', error);
            console.error('Status:', error.status);
            console.error('Mensagem:', error.error);
            alert(`Erro ao criar: ${error.error?.message || error.message}`);
          }
        });
      }
    } else {
      console.error('❌ Formulário inválido');
      Object.keys(this.produtoForm.controls).forEach(key => {
        const control = this.produtoForm.get(key);
        if (control?.invalid) {
          console.error(`Campo inválido: ${key}`, control.errors);
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/admin/produtos']);
  }

  voltar(): void {
    this.location.back();
  }
}
