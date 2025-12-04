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
import { UsuarioListComponent } from './components/usuario/list/usuario-list.component';
import { UsuarioFormComponent } from './components/usuario/form/usuario-form.component';
import { PedidoListComponent } from './components/pedido/list/pedido-list.component';
import { SaborListComponent } from './components/sabor/list/sabor-list.component';
import { SaborFormComponent } from './components/sabor/form/sabor-form.component';
import { AdminTemplateComponent } from './components/template/admin-template.component';
import { VisitanteTemplateComponent } from './components/visitante/template/visitante-template.component';
import { VisitanteHomeComponent } from './components/visitante/home/visitante-home.component';
import { VisitanteProductsComponent } from './components/visitante/produtos/visitante-products.component';

export const routes: Routes = [
  {
    path: '',
    component: VisitanteTemplateComponent,
    children: [
      { path: '', component: VisitanteHomeComponent },
      { path: 'produtos', component: VisitanteProductsComponent }
    ]
  },
  {
    path: 'admin',
    component: AdminTemplateComponent,
    children: [
      { path: 'home', component: HomeComponent },
      { path: 'produtos', component: ProdutoListComponent },
      { path: 'produtos/form', component: ProdutoFormComponent },
      { path: 'produtos/form/:id', component: ProdutoFormComponent },
      { path: 'categorias', component: CategoriaListComponent },
      { path: 'categorias/form', component: CategoriaFormComponent },
      { path: 'categorias/form/:id', component: CategoriaFormComponent },
      { path: 'fornecedores', component: FornecedorListComponent },
      { path: 'fornecedores/form', component: FornecedorFormComponent },
      { path: 'fornecedores/form/:id', component: FornecedorFormComponent },
      { path: 'estados', component: EstadoListComponent },
      { path: 'estados/form', component: EstadoFormComponent },
      { path: 'estados/form/:id', component: EstadoFormComponent },
      { path: 'cidades', component: CidadeListComponent },
      { path: 'cidades/form', component: CidadeFormComponent },
      { path: 'cidades/form/:id', component: CidadeFormComponent },
      { path: 'usuarios', component: UsuarioListComponent },
      { path: 'usuarios/form', component: UsuarioFormComponent },
      { path: 'usuarios/form/:id', component: UsuarioFormComponent },
      { path: 'pedidos', component: PedidoListComponent },
      { path: 'sabores', component: SaborListComponent },
      { path: 'sabores/form', component: SaborFormComponent },
      { path: 'sabores/form/:id', component: SaborFormComponent }
    ]
  },
  { path: '**', redirectTo: '' }
];
