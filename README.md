# RitterConstruct - Sistema de Aluguel de Equipamentos de Construção

## 📋 Descrição do Projeto

RitterConstruct é um sistema web completo para gerenciamento de aluguel de equipamentos de construção, desenvolvido como trabalho da disciplina de Banco de Dados. O sistema permite que clientes aluguem equipamentos, administradores gerenciem o estoque e fornecedores, além de gerar relatórios detalhados sobre as operações.

## 🏗️ Arquitetura do Projeto

### **Padrão Arquitetural**: MVC (Model-View-Controller) com Camadas
- **Frontend**: Aplicação web responsiva com HTML5, CSS3, Bootstrap 5 e JavaScript
- **Backend**: API RESTful em Node.js com Express
- **Banco de Dados**: PostgreSQL com triggers e procedures

### **Estrutura de Camadas (Backend)**
```
├── Controllers/     # Controladores - Interface entre rotas e serviços
├── Services/        # Regras de negócio e validações
├── Repositories/    # Acesso aos dados (Data Access Layer)
├── Routes/          # Definição das rotas da API
└── Config/          # Configurações (banco de dados)
```

## 🛠️ Tecnologias Utilizadas

### **Frontend**
- **HTML5** - Estrutura das páginas
- **CSS3** - Estilização customizada
- **Bootstrap 5** - Framework CSS responsivo
- **JavaScript (ES6+)** - Interatividade e consumo da API
- **Bootstrap Icons** - Iconografia
- **Google Fonts** - Tipografia (Playfair Display)

### **Backend**
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **pg** - Driver PostgreSQL para Node.js
- **CORS** - Middleware para Cross-Origin Resource Sharing

### **Banco de Dados**
- **PostgreSQL** - Sistema de gerenciamento de banco de dados
- **Triggers** - Automação de processos (estoque, cálculos, pagamentos)
- **Procedures/Functions** - Lógica de negócio no banco

## 🎯 Funcionalidades Principais

### **Para Clientes**
- ✅ Cadastro e autenticação de usuários
- ✅ Visualização do catálogo de equipamentos
- ✅ Carrinho de compras interativo
- ✅ Sistema de aluguel com configuração de diárias e parcelas
- ✅ Histórico de aluguéis (ativos e finalizados)
- ✅ Filtros por status de aluguel

### **Para Administradores**
- ✅ Painel administrativo completo
- ✅ CRUD de equipamentos, clientes e fornecedores
- ✅ Gerenciamento de aluguéis ativos
- ✅ Sistema de relatórios gerenciais
- ✅ Controle de estoque automatizado

### **Relatórios Disponíveis**
- 📊 Cliente com maior valor em aluguéis
- 📊 Clientes que alugaram todos os equipamentos
- 📊 Equipamento mais alugado
- 📊 Receita total por mês
- 📊 Clientes com pagamentos atrasados
- 📊 Equipamentos com estoque abaixo da média
- 📊 Clientes com aluguéis ativos

## 🗄️ Modelo de Dados

### **Principais Entidades**
- **CLIENTE** - Dados dos clientes (CPF, nome, endereço, contato)
- **FORNECEDOR** - Informações dos fornecedores (CNPJ, nome fantasia, contato)
- **EQUIPAMENTO** - Catálogo de equipamentos (nome, descrição, valor diária, estoque)
- **ALUGUEL** - Registros de aluguéis (datas, parcelas, cliente)
- **ALUGUEISATIVOS** - Equipamentos atualmente alugados
- **REGISTRODEALUGUEIS** - Histórico de aluguéis finalizados
- **PAGAMENTO** - Controle financeiro e parcelas

### **Recursos Avançados do Banco**
- **Triggers Automáticos**:
  - Cálculo automático de valores de aluguel
  - Controle de estoque (baixa/retorno)
  - Geração automática de pagamentos
  - Transferência para histórico ao finalizar

## 🚀 Como Executar

### **Pré-requisitos**
- Node.js (v14 ou superior)
- PostgreSQL (v12 ou superior)
- Navegador web moderno

### **Configuração do Banco de Dados**
1. Instale o PostgreSQL
2. Execute o script `bd.txt` para criar as tabelas e triggers
3. Configure as credenciais em `Back-end/server/config/db.js`

### **Configuração do Backend**
```bash
cd Back-end/server
npm install
npm start
```
O servidor será executado em `http://localhost:3000`

### **Configuração do Frontend**
1. Abra o arquivo `Front-end/index.html` em um navegador
2. Ou use um servidor local (Live Server, http-server, etc.)

## 📁 Estrutura de Arquivos

```
trabalho/
├── Back-end/
│   └── server/
│       ├── package.json
│       ├── server.js
│       ├── config/db.js
│       ├── controllers/      # Controladores da API
│       ├── services/         # Lógica de negócio
│       ├── repositories/     # Acesso aos dados
│       └── routes/           # Rotas da API
├── Front-end/
│   ├── index.html           # Página principal
│   ├── css/                 # Estilos customizados
│   ├── html/                # Páginas adicionais
│   └── js/                  # Scripts JavaScript
├── Diagramas/               # Documentação visual
├── bd.txt                   # Script do banco de dados
└── README.md
```

## 📱 Interface do Usuário

### **Design Responsivo**
- Layout adaptável para desktop, tablet e mobile
- Componentes Bootstrap para consistência visual
- Navegação intuitiva com navbar fixa
- Cards interativos para exibição de equipamentos

### **Páginas Principais**
- **Inicial** - Landing page com apresentação
- **Equipamentos** - Catálogo com busca e filtros
- **Carrinho** - Gestão de itens selecionados
- **Aluguéis** - Histórico e status dos aluguéis
- **Admin** - Painel administrativo completo
- **Login/Cadastro** - Autenticação de usuários

## 🔄 API Endpoints

### **Principais Rotas**
```
/api/cliente          # CRUD de clientes
/api/equipamento      # CRUD de equipamentos
/api/fornecedor       # CRUD de fornecedores
/api/aluguel          # Gestão de aluguéis
/api/alugueisAtivos   # Aluguéis em andamento
/api/pagamento        # Controle financeiro
/api/relatorio        # Relatórios gerenciais
```

## 👥 Equipe de Desenvolvimento

- **Disciplina**: Banco de Dados
- **Instituição**: [Sua Instituição]
- **Período**: 2024

## 📝 Licença

Este projeto foi desenvolvido para fins acadêmicos como parte da disciplina de Banco de Dados.

---

## 🎨 Preview

O sistema oferece uma interface moderna e intuitiva, com foco na experiência do usuário e eficiência operacional. A aplicação demonstra conceitos avançados de banco de dados, incluindo triggers, procedures e relatórios complexos.

## 🔧 Melhorias Futuras

- Implementação de autenticação JWT
- Sistema de notificações em tempo real
- Dashboard com gráficos interativos
- Integração com sistemas de pagamento
- API para aplicativos móveis
