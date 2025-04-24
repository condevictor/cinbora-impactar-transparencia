# Cinbora Transparecer

![Versão](https://img.shields.io/badge/versão-1.0.0-blue)

## Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Instalação e Configuração](#instalação-e-configuração)
- [Backend](#backend)
- [Frontend](#frontend)
- [Testes Automatizados](#testes-automatizados)
- [Acesso à Plataforma](#-acesso-à-plataforma)

## Sobre o Projeto

O **Cinbora Transparecer** é uma plataforma que visa promover a transparência e acessibilidade de dados das ONGs, permitindo que cidadãos acessem informações relevantes de forma clara e intuitiva.

A plataforma é fruto de uma parceria entre o CIN/UFPE e a Prefeitura do Recife, estando integrada ao projeto 'Bora Impactar', que visa ajudar as ONGs do Recife.

## Tecnologias Utilizadas

### Backend
- Node.js
- Express.js
- MongoDB
- Autenticação JWT

### Frontend
- React.js
- Redux
- Material UI
- Axios

### Ferramentas de Teste
- Jest
- React Testing Library
- Supertest

## 📁 Estrutura do Projeto

```
cinbora-impactar-transparencia/
├── backend/              # Código do servidor
├── frontend/             # Código da interface de usuário
├── docs/                 # Documentação adicional
└── README.md             # Este arquivo
```

## 🔧 Instalação e Configuração

### Pré-requisitos
- Node.js (v14+)
- NPM ou Yarn
- MongoDB

### Passos para Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/cinbora-impactar-transparencia.git
cd cinbora-impactar-transparencia
```

2. Instale as dependências do backend:
```bash
cd backend
npm install
```

3. Instale as dependências do frontend:
```bash
cd frontend
npm install
```

4. Configure as variáveis de ambiente:
   - Crie um arquivo `.env` no diretório `backend/` baseado no modelo `.env.example`

5. Inicie o servidor de desenvolvimento:

   Para o backend:
   ```bash
   cd backend
   npm run dev
   ```

   Para o frontend:
   ```bash
   cd frontend
   npm start
   ```

## ⚙️ Backend

### Funcionalidades Principais

- API RESTful para gerenciamento de dados
- Autenticação e autorização de usuários
- Integração com fontes de dados externas
- Persistência de dados em MongoDB

## 🎨 Frontend

### Páginas Principais

- **Página de ONGs**: Visualização de todas a ongs cadastradas
- **Página de Ações**: Contém as ações de cada ong detalhadas
- **Página da Ação**: Página específica para cada ação
- **Página de Login**: Página para acesso administrativo das ONGs

### Estados e Gerenciamento de Dados

Utilizamos Redux para gerenciamento de estado global e Context API para estados específicos de componentes.

## Testes Automatizados

### Testes de Backend

#### Testes Unitários e de Integração
- **Controllers**: Testes para todas as APIs e endpoints
  - UserController: testes para criação, edição, exclusão e listagem de usuários
  - OngController: testes para gerenciamento de ONGs e suas informações
  - ActionController: testes para as ações sociais e seus recursos
  - FileController: testes para upload, listagem e exclusão de arquivos
  - AuthController: testes para autenticação e autorização

#### Como executar os testes do backend
```bash
cd backend
npm run test
```

Para executar com cobertura:
```bash
cd backend
npm run test:coverage
```

### Testes de Frontend

#### Testes E2E com Cypress
Testes de ponta a ponta que simulam o comportamento do usuário na aplicação:
- Fluxo de login de usuário
- Edição de informações da ONG
- Navegação entre abas (Galeria, Balanço de Gastos, Documentos)
- Gerenciamento de ações sociais
- Visualização de histórico e informações da ONG

#### Como executar os testes do frontend
```bash
cd frontend
npm run cypress:open
```

Para executar em modo headless:
```bash
cd frontend
npm run cypress:run
```

## 🌐 Acesso à Plataforma

O **Cinbora Transparecer** já está disponível online! Você pode acessar nossa plataforma através do link:

[https://cinboraimpactar.cin.ufpe.br/cinboratransparecer](https://cinboraimpactar.cin.ufpe.br/cinboratransparecer)

Nossa iniciativa faz parte do projeto "Bora Impactar" da prefeitura, criado especialmente para apoiar ONGs e fortalecer o trabalho social em nossa comunidade. Através desta plataforma, buscamos criar pontes entre cidadãos e organizações, facilitando o acesso a informações importantes de forma transparente e acessível.

Estamos comprometidos em transformar a maneira como as pessoas interagem com dados públicos, tornando-os mais compreensíveis e úteis para todos.


Desenvolvido com ❤️ pela equipe do Cinbora Transparecer.
