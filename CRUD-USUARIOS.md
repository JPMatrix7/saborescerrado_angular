# ✅ CRUD de Usuários Implementado

## 📋 Resumo

CRUD completo de usuários implementado conforme o prompt fornecido, com todas as funcionalidades, validações e integração com a API backend.

---

## 🎯 Funcionalidades Implementadas

### ✅ Listagem de Usuários (`/admin/usuarios`)

**Componente:** `usuario-list.component.ts/html/css`

**Funcionalidades:**
- ✅ Tabela responsiva com colunas:
  - ID
  - Nome Completo
  - Email
  - CPF (mascarado: 123.456.789-01)
  - Perfil (Badge colorido: Admin = azul, User = verde)
  - Status (Ativo/Inativo)
  - Data de Cadastro (formatado: DD/MM/YYYY HH:mm)
  - Ações (Editar, Deletar)

- ✅ **Paginação:**
  - Seletor de itens por página (10, 25, 50)
  - Botões Anterior/Próximo
  - Indicador de página atual e total
  - Consumo da API: `GET /usuario/{page}/{pageSize}`

- ✅ **Botão "Novo Usuário"** no topo

- ✅ **Confirmação de Deleção:**
  - Dialog nativo: "Tem certeza que deseja desativar o usuário X?"
  - Soft delete via `PATCH /usuario/delete/{id}`

- ✅ **Fallback para dados estáticos** se API estiver offline

---

### ✅ Formulário de Criação (`/admin/usuarios/form`)

**Componente:** `usuario-form.component.ts/html/css`

**Campos do Formulário:**

1. **Nome*** (input text)
   - Validação: obrigatório, 3-100 caracteres
   - Placeholder: "João"

2. **Sobrenome*** (input text)
   - Validação: obrigatório, 3-100 caracteres
   - Placeholder: "Silva"

3. **Email*** (input email)
   - Validação: obrigatório, formato email válido
   - Placeholder: "joao.silva@email.com"
   - Ícone: envelope

4. **CPF*** (input text com máscara)
   - Validação: obrigatório, CPF válido (algoritmo brasileiro)
   - Máscara automática: 999.999.999-99
   - Placeholder: "123.456.789-01"
   - **Importante:** Remove formatação antes de enviar (apenas números)
   - Ícone: badge

5. **Data de Nascimento*** (datepicker)
   - Validação: obrigatório, data passada (não pode ser futuro)
   - Formato para API: YYYY-MM-DD (ISO 8601)
   - Material Datepicker

6. **Senha*** (input password - apenas ao criar)
   - Validação: obrigatório, mínimo 6 caracteres
   - Placeholder: "Mínimo 6 caracteres"
   - Botão mostrar/ocultar senha (ícone de olho)
   - **Campo desabilitado no modo edição**

7. **Perfil*** (select single)
   - Opções: Admin, User
   - Valor padrão: User
   - Validação: obrigatório
   - Ícone: security

**Botões:**
- **Cancelar** - Volta para listagem
- **Salvar** - Envia dados para API

**Layout:**
- Campos em linha dupla (responsivo)
- Nome e Sobrenome lado a lado
- CPF e Data de Nascimento lado a lado
- Demais campos em largura total

---

### ✅ Formulário de Edição (`/admin/usuarios/form/:id`)

**Diferenças do modo criação:**
- ✅ Carrega dados do usuário via `GET /usuario/id/{id}`
- ✅ Separa nome completo em nome e sobrenome
- ✅ **Campo senha não aparece** (use endpoint separado se necessário)
- ✅ Atualiza via `PUT /usuario/{id}` + `PATCH /usuario/perfis/{id}`

---

## 🔒 Validações Implementadas

### Frontend (TypeScript)

```typescript
// Nome e Sobrenome
Validators.required
Validators.minLength(3)
Validators.maxLength(100)

// Email
Validators.required
Validators.email

// CPF
Validators.required
CustomValidators.cpf() // Algoritmo brasileiro completo

// Data Nascimento
Validators.required
validadorDataPassada // Não pode ser futuro

// Senha
Validators.required (apenas ao criar)
Validators.minLength(6)
```

### Backend (Validações Esperadas)

- **CPF:** Formato e algoritmo brasileiro
- **Email:** Formato válido e único
- **Nome/Sobrenome:** Mínimo 3, máximo 100 caracteres
- **Senha:** Mínimo 6 caracteres
- **Data Nascimento:** Data passada

---

## 📡 Integração com API

### UsuarioService (`usuario.service.ts`)

**Métodos Implementados:**

```typescript
// Listar paginado
getAll(page: number, pageSize: number): Observable<Usuario[]>
// GET /usuario/{page}/{pageSize}

// Buscar por ID
getById(id: number): Observable<Usuario>
// GET /usuario/id/{id}

// Criar usuário
create(dto: PessoaFisicaDTO): Observable<Usuario>
// POST /usuario

// Atualizar completo
update(id: number, dto: PessoaFisicaDTO): Observable<void>
// PUT /usuario/{id}

// Atualizar perfis
updatePerfis(id: number, perfis: Perfil[]): Observable<void>
// PATCH /usuario/perfis/{id}

// Deletar (soft delete)
delete(id: number): Observable<void>
// PATCH /usuario/delete/{id}

// Contar total
count(): Observable<number>
// GET /usuario/count

// Métodos adicionais
updateNome(id, nome): Observable<void>
updateEmail(id, email): Observable<void>
updateSenha(id, senha): Observable<void>
resetarSenha(id): Observable<void>
```

---

## 📝 Estrutura de Dados

### Interface Usuario

```typescript
interface Usuario {
  id?: number;
  nome: string;
  email: string;
  senha?: string; // Não retornado pela API
  perfis?: Perfil[];
  ativo?: boolean;
  datainclusao?: string;
  enderecos?: Endereco[];
  cartoes?: Cartao[];
  telefones?: Telefone[];
  favoritos?: any[];
  compras?: any[];
}
```

### Interface PessoaFisicaDTO

```typescript
interface PessoaFisicaDTO {
  nome: string;           // 3-100 caracteres
  sobrenome: string;      // 3-100 caracteres
  email: string;          // email válido
  senha?: string;         // Obrigatório apenas na criação, mínimo 6 caracteres
  cpf: string;            // 11 dígitos sem formatação
  dataNascimento: string; // ISO 8601: YYYY-MM-DD
}
```

### Enum Perfil

```typescript
enum Perfil {
  ADMIN = 'ADMIN',
  USER = 'USER'
}
```

---

## 🎨 Componentes UI Utilizados

- **Angular Material 18+**
- `mat-table` - Tabela de dados
- `mat-paginator` - Paginação
- `mat-form-field` - Campos de formulário
- `mat-button` - Botões
- `mat-icon` - Ícones
- `mat-chip` - Badges de perfil e status
- `mat-datepicker` - Seletor de data
- `mat-snack-bar` - Notificações toast
- `mat-card` - Cards de conteúdo
- `mat-tooltip` - Tooltips

---

## 🔄 Fluxo de Criação

1. Usuário clica em **"Novo Usuário"**
2. Abre formulário em branco
3. Preenche todos os campos (incluindo senha)
4. Clica em **"Salvar"**
5. Frontend valida dados
6. Remove formatação do CPF (apenas números)
7. Formata data para ISO 8601
8. Envia `POST /usuario` com `PessoaFisicaDTO`
9. Backend valida CPF, email, etc.
10. Se OK: retorna usuário criado (201)
11. Se perfil diferente de USER: envia `PATCH /usuario/perfis/{id}`
12. Frontend mostra mensagem de sucesso
13. Redireciona para listagem

---

## 🔄 Fluxo de Edição

1. Usuário clica em **"Editar"** na tabela
2. Abre formulário preenchido com dados do usuário
3. Campo senha **NÃO aparece**
4. Edita campos desejados
5. Clica em **"Salvar"**
6. Frontend valida dados
7. Remove formatação do CPF
8. Formata data para ISO 8601
9. Envia `PUT /usuario/{id}` com `PessoaFisicaDTO` (sem senha)
10. Envia `PATCH /usuario/perfis/{id}` separadamente
11. Backend valida e atualiza
12. Frontend mostra mensagem de sucesso
13. Redireciona para listagem

---

## ⚠️ Tratamento de Erros

### Erros Possíveis:

**400 Bad Request** - Validação
- Backend retorna violações de validação
- Frontend mapeia erros para os campos específicos
- Exemplo: CPF inválido, email já cadastrado

**404 Not Found**
- Usuário não encontrado ao editar
- Mensagem: "Usuário não encontrado"

**500 Internal Server Error**
- Erro interno do servidor
- Mensagem: "Erro ao processar requisição. Tente novamente."

**Offline/Network Error**
- API indisponível
- Fallback para dados estáticos (3 usuários)
- Mensagem: "Erro ao carregar usuários"

---

## 📱 Responsividade

- ✅ Tabela scrollável horizontal em mobile
- ✅ Formulário empilha campos em telas pequenas
- ✅ Botões com tamanho adequado para touch
- ✅ Máscaras funcionam em mobile
- ✅ Paginação adaptativa

---

## 🎨 Máscaras Implementadas

### CPF
- **Formato:** 999.999.999-99
- **Função:** `formatarCpf(event)`
- **Comportamento:** Formata automaticamente enquanto digita
- **Envio para API:** Remove formatação (apenas números)

### Data
- **Exibição:** DD/MM/YYYY HH:mm (listagem)
- **Input:** Material Datepicker
- **API:** YYYY-MM-DD (ISO 8601)

---

## 🚀 Como Usar

### Iniciar Aplicação

```bash
npm start
```

### Acessar CRUD de Usuários

```
http://localhost:4200/admin/usuarios
```

### Testar Funcionalidades

1. **Criar Usuário:**
   - Clique em "Novo Usuário"
   - Preencha todos os campos
   - Valide CPF: use um válido (ex: 12345678909)
   - Clique em "Salvar"

2. **Editar Usuário:**
   - Clique no ícone de lápis na linha do usuário
   - Altere os campos desejados
   - Note que senha não aparece
   - Clique em "Salvar"

3. **Deletar Usuário:**
   - Clique no ícone de lixeira
   - Confirme a ação
   - Usuário será marcado como inativo (soft delete)

4. **Navegar Páginas:**
   - Use os botões de paginação
   - Altere o número de itens por página

---

## ✅ Checklist de Implementação

- [x] Criar `usuario.service.ts` com todos os métodos
- [x] Criar interfaces TypeScript (`Usuario`, `PessoaFisicaDTO`, `Perfil`)
- [x] Criar `usuario-list.component.ts/html/css` (listagem)
- [x] Criar `usuario-form.component.ts/html/css` (formulário)
- [x] Implementar paginação na listagem
- [x] Implementar validações no formulário
- [x] Adicionar máscaras (CPF)
- [x] Implementar tratamento de erros
- [x] Adicionar confirmação de deleção
- [x] Integrar com API backend
- [x] Validação de CPF (algoritmo brasileiro)
- [x] Validação de data passada
- [x] Campo senha apenas na criação
- [x] Separação de nome e sobrenome
- [x] Formatação de data ISO 8601
- [x] Badges coloridos para perfil e status
- [x] Responsividade completa
- [x] Fallback para dados estáticos
- [x] Snackbar para mensagens de sucesso/erro
- [x] Botão voltar em todas as telas

---

## 🎉 Resultado Final

CRUD completo de usuários totalmente funcional com:
- ✅ Listagem paginada com filtros visuais
- ✅ Formulário de criação com todas as validações
- ✅ Formulário de edição (sem campo senha)
- ✅ Soft delete com confirmação
- ✅ Validação de CPF completa
- ✅ Máscaras e formatações adequadas
- ✅ Tratamento de erros robusto
- ✅ Interface responsiva e profissional
- ✅ Integração completa com API backend

**O CRUD está pronto para uso em produção! 🚀**
