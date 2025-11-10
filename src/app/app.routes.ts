import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { ProdutoListComponent } from './components/produto/list/produto-list.component';
import { ProdutoFormComponent } from './components/produto/form/produto-form.component';
import { CategoriaListComponent } from './components/categoria/list/categoria-list.component';
import { CategoriaFormComponent } from './components/categoria/form/categoria-form.component';
import { FornecedorListComponent } from './components/fornecedor/list/fornecedor-list.component';
import { FornecedorFormComponent } from './components/fornecedor/form/fornecedor-form.component';
import { EstadoListComponent } from './components/estado/list/estado-list.component';
import { EstadoFormComponent } from './components/estado/form/estado-form.component';
import { CidadeListComponent } from './components/cidade/list/cidade-list.component';
import { CidadeFormComponent } from './components/cidade/form/cidade-form.component';
import { AdminTemplateComponent } from './components/template/admin-template.component';

export const routes: Routes = [
  { path: '', redirectTo: '/admin/home', pathMatch: 'full' },
  
  // Rotas com template administrativo
  {
    path: 'admin',
    component: AdminTemplateComponent,
    children: [
      { path: 'home', component: HomeComponent },
      
      // Rotas de Produtos
      { path: 'produtos', component: ProdutoListComponent },
      { path: 'produtos/form', component: ProdutoFormComponent },
      { path: 'produtos/form/:id', component: ProdutoFormComponent },
      
      // Rotas de Categorias
      { path: 'categorias', component: CategoriaListComponent },
      { path: 'categorias/form', component: CategoriaFormComponent },
      { path: 'categorias/form/:id', component: CategoriaFormComponent },
      
      // Rotas de Fornecedores
      { path: 'fornecedores', component: FornecedorListComponent },
      { path: 'fornecedores/form', component: FornecedorFormComponent },
      { path: 'fornecedores/form/:id', component: FornecedorFormComponent },
      
      // Rotas de Estados
      { path: 'estados', component: EstadoListComponent },
      { path: 'estados/form', component: EstadoFormComponent },
      { path: 'estados/form/:id', component: EstadoFormComponent },
      
      // Rotas de Cidades
      { path: 'cidades', component: CidadeListComponent },
      { path: 'cidades/form', component: CidadeFormComponent },
      { path: 'cidades/form/:id', component: CidadeFormComponent },
    ]
  }
];
