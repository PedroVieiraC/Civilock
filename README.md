# Civilock - Locadora de Equipamentos para Construção Civil

## 📋 Descrição do Projeto

Civilock (antes chamado Depósito Vieira) é um sistema web completo para gerenciamento de aluguel de equipamentos de construção, desenvolvido como trabalho da disciplina de Banco de Dados. O sistema permite que clientes aluguem equipamentos, administradores gerenciem o estoque e fornecedores, além de gerar relatórios detalhados sobre as operações.

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

### **Execução Rápida (Recomendado)**
```bash
# Dar permissão aos scripts (apenas na primeira vez)
chmod +x *.sh

# Iniciar o projeto (configura banco automaticamente se necessário)
./start.sh

# Parar o projeto
./stop.sh
```

> **📝 Nota:** O script `start.sh` automaticamente detecta se o banco de dados precisa ser configurado e executa `setup-database.sh` quando necessário.

### **Migração de Banco de Dados**
Se você já tem um banco de dados chamado "trabalho" e quer migrar para "Depósito Vieira":
```bash
# Migrar dados do banco antigo para o novo
./migrate-database.sh
```

### **Pré-requisitos**
- Node.js (v14 ou superior)
- PostgreSQL (v12 ou superior)
- Navegador web moderno

### **Configuração Manual**

#### **Configuração do Banco de Dados**
1. Instale o PostgreSQL
2. Crie o banco de dados: `createdb deposito_vieira`
3. Execute o script: `psql -d deposito_vieira -f bd.txt`
4. Copie `Back-end/server/.env.example` para `Back-end/server/.env` e preencha as credenciais (o `db.js` lê esse arquivo)

#### **Configuração do Backend**
```bash
cd Back-end/server
npm install
npm start
```
O servidor será executado em `http://localhost:3000`

#### **Configuração do Frontend**
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
├── setup-database.sh        # Script de configuração do banco
├── migrate-database.sh      # Script de migração do banco
├── start.sh                 # Script de inicialização
├── stop.sh                  # Script para parar o projeto
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

### **Aprimoramentos na Arquitetura do Backend**
- **Implementar Clean Architecture**: Separar entidades de domínio, casos de uso e infraestrutura
- **Adicionar Domain-Driven Design (DDD)**: Criar modelos de domínio com lógica de negócio rica
- **Implementar Padrão CQRS**: Separar responsabilidades de comando e consulta
- **Adicionar Injeção de Dependência**: Usar container IoC para melhor testabilidade
- **Implementar Padrão Unit of Work**: Melhor gerenciamento de transações
- **Adicionar Data Transfer Objects (DTOs)**: Validação e transformação adequada de dados
- **Implementar Interfaces de Repository**: Abstrair acesso a dados para melhor testabilidade
- **Adicionar Arquitetura Orientada a Eventos**: Usar eventos de domínio para comunicação desacoplada

### **Qualidade de Código e Testes**
- **Adicionar Testes Abrangentes**: Testes unitários, de integração e end-to-end
- **Implementar TypeScript**: Melhor segurança de tipos e experiência do desenvolvedor
- **Adicionar Documentação de Código**: Comentários JSDoc e documentação da API
- **Implementar Logging**: Logging estruturado com níveis e IDs de correlação
- **Adicionar Tratamento de Erros**: Tratamento centralizado de erros e exceções customizadas
- **Cobertura de Código**: Implementar relatórios de cobertura de código
- **Análise Estática de Código**: Integração com ESLint, Prettier e SonarQube

### **Modernização do Frontend**
- **Migrar para React**: Arquitetura baseada em componentes com hooks modernos
- **Implementar Gerenciamento de Estado**: Redux Toolkit ou Zustand para estado global
- **Adicionar TypeScript**: Segurança de tipos para desenvolvimento frontend
- **Biblioteca de Componentes**: Criar componentes de UI reutilizáveis
- **Design Responsivo**: Abordagem mobile-first aprimorada
- **Progressive Web App (PWA)**: Capacidades offline e experiência similar a app
- **Ferramentas de Build Modernas**: Vite ou Webpack para builds otimizados
- **Framework de Testes**: Jest e React Testing Library

### **Segurança e Performance**
- **Autenticação JWT**: Autenticação segura baseada em tokens
- **Controle de Acesso Baseado em Funções (RBAC)**: Sistema de permissões granulares
- **Rate Limiting da API**: Prevenir abuso e garantir uso justo
- **Validação de Entrada**: Validação abrangente no cliente e servidor
- **Prevenção de SQL Injection**: Consultas parametrizadas e uso de ORM
- **Implementação HTTPS**: Protocolo de comunicação segura
- **Otimização de Performance**: Estratégias de cache e indexação de banco
- **Integração CDN**: Otimização de entrega de assets estáticos

### **DevOps e Infraestrutura**
- **Containerização**: Containers Docker para deployment consistente
- **Pipeline CI/CD**: Testes e deployment automatizados
- **Configuração de Ambiente**: Gerenciamento adequado de variáveis de ambiente
- **Migrações de Banco**: Mudanças de schema versionadas
- **Monitoramento e Alertas**: Monitoramento de performance da aplicação
- **Load Balancing**: Capacidades de escalonamento horizontal
- **Estratégia de Backup**: Backups automatizados e recuperação de banco
- **Infrastructure as Code**: Terraform ou ferramentas similares

### **Funcionalidades Adicionais**
- **Notificações em Tempo Real**: Implementação WebSocket para atualizações ao vivo
- **Integração de Email**: Notificações automatizadas por email para aluguéis
- **Gateway de Pagamento**: Integração com processadores de pagamento
- **Aplicativo Mobile**: App React Native ou Flutter
- **Dashboard de Analytics**: Relatórios avançados com gráficos e insights
- **Suporte Multi-idioma**: Internacionalização (i18n)
- **Upload de Arquivos**: Sistema de gerenciamento de imagens de equipamentos
- **Trilha de Auditoria**: Rastrear todas as mudanças do sistema e ações do usuário
