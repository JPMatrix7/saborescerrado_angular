import { Routes } from '@angular/router';
import { HomeComponent } from './components/admin/home/home.component';
import { ProdutoListComponent } from './components/admin/produto/list/produto-list.component';
import { ProdutoFormComponent } from './components/admin/produto/form/produto-form.component';
import { CategoriaListComponent } from './components/admin/categoria/list/categoria-list.component';
import { CategoriaFormComponent } from './components/admin/categoria/form/categoria-form.component';
import { FornecedorListComponent } from './components/admin/fornecedor/list/fornecedor-list.component';
import { FornecedorFormComponent } from './components/admin/fornecedor/form/fornecedor-form.component';
import { EstadoListComponent } from './components/admin/estado/list/estado-list.component';
import { EstadoFormComponent } from './components/admin/estado/form/estado-form.component';
import { CidadeListComponent } from './components/admin/cidade/list/cidade-list.component';
import { CidadeFormComponent } from './components/admin/cidade/form/cidade-form.component';
import { UsuarioListComponent } from './components/usuario/list/usuario-list.component';
import { UsuarioFormComponent } from './components/usuario/form/usuario-form.component';
import { PedidoListComponent } from './components/admin/pedido/list/pedido-list.component';
import { SaborListComponent } from './components/admin/sabor/list/sabor-list.component';
import { SaborFormComponent } from './components/admin/sabor/form/sabor-form.component';
import { AdminTemplateComponent } from './components/admin/template/admin-template.component';
import { VisitanteTemplateComponent } from './components/visitante/template/visitante-template.component';
import { VisitanteHomeComponent } from './components/visitante/home/visitante-home.component';
import { VisitanteProductsComponent } from './components/visitante/produtos/visitante-products.component';
import { VisitanteProductDetailComponent } from './components/visitante/produtos/visitante-product-detail.component';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { ProfileComponent } from './components/auth/profile/profile.component';
import { MeusPedidosComponent } from './components/visitante/pedidos/meus-pedidos.component';
import { CarrinhoPageComponent } from './components/visitante/carrinho/carrinho-page.component';
import { adminGuard, authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: VisitanteTemplateComponent,
    children: [
      { path: '', component: VisitanteHomeComponent },
      { path: 'produtos', component: VisitanteProductsComponent },
      { path: 'produtos/:id', component: VisitanteProductDetailComponent },
      { path: 'carrinho', component: CarrinhoPageComponent },
      { path: 'perfil', component: ProfileComponent, canMatch: [authGuard] },
      { path: 'meus-pedidos', component: MeusPedidosComponent, canMatch: [authGuard] }
    ]
  },
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegisterComponent },
  {
    path: 'admin',
    component: AdminTemplateComponent,
    canMatch: [adminGuard],
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
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
