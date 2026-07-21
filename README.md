# 🚀 ProjectFlow AI

> **Transformando a Gestão Tradicional de Projetos em um Ecossistema de Project Intelligence Corporativo.**

[![Licença: MIT](https://img.shields.io/badge/Licen%C3%A7a-MIT-blue.svg)](LICENSE)
[![Arquitetura: Microsserviços](https://img.shields.io/badge/Arquitetura-Microsservi%C3%A7os-emerald)](#-arquitetura-da-solu%C3%A7%C3%A3o)
[![Orquestração de IA: Gemini](https://img.shields.io/badge/Motor%20de%20IA-Google%20Gemini-purple)](https://deepmind.google/technologies/gemini/)
[![Frontend: React %7C Expo](https://img.shields.io/badge/Frontend-React%20%7C%20React%20Native-61dafb)](https://react.dev)
[![Backend: Node.js %7C FastAPI](https://img.shields.io/badge/Backend-Node.js%20%7C%20FastAPI-green)](https://nodejs.org)

---

## 📌 Visão Geral & Do que se trata o Projeto

O **ProjectFlow AI** é uma plataforma corporativa multiplataforma (Web e Mobile) desenvolvida para revolucionar e automatizar a governança, a priorização, a alocação de recursos e o acompanhamento do portfólio de projetos corporativos através do uso intensivo de Inteligência Artificial.

Diferente das ferramentas operacionais de gestão tradicionais (como Jira, Trello, Asana e Azure DevOps), o ProjectFlow AI evolui a gestão passiva de tarefas para um verdadeiro **Project Intelligence Center (PIC)**. Ele atua como um motor preditivo e consultivo capaz de auxiliar Product Owners, Gestores de TI/Inovação, PMOs e Diretores Executivos na tomada de decisão estratégica baseada em dados em tempo real.

---

## 🎯 Objetivos Estratégicos

* **Centralização de Portfólio:** Reunir e padronizar a gestão de todas as demandas, projetos e ideias da organização em uma única plataforma integrada.
* **Governança Autônoma com IA:** Automatizar o processo de triagem e governança, classificando requisições instantaneamente entre *Projeto* e *Ideia*.
* **Estimativas Preditivas e Precisas:** Calcular de forma automatizada estimativas de custo, prazo, esforço em horas, nível de complexidade e mapeamento de riscos.
* **Alocação Inteligente (*Matching* Profissional):** Sugerir os profissionais mais capacitados (PO, Gestor, Desenvolvedores) com base em aderência técnica, histórico, disponibilidade e desempenho.
* **Fluxos de Aprovação Dinâmicos:** Estabelecer alçadas de aprovação inteligentes baseadas em regras de negócio rígidas (matriz de custo, risco e complexidade).
* **Visibilidade Executiva (Analytics Center):** Fornecer dashboards operacionais e executivos unificados com cálculo automático de ROI previsto, gráficos dinâmicos e indicadores correlacionados.

---

## 🔥 Diferencial Competitivo & Comparativo de Mercado

O grande diferencial do **ProjectFlow AI** é utilizar a Inteligência Artificial não apenas como um assistente conversacional (chat), mas sim como um **mecanismo orquestrador de governança**, eliminando gargalos operacionais e viabilizando uma tomada de decisão ágil e analítica.

| Funcionalidades & Módulos | ProjectFlow AI | Mercado Tradicional (Jira, Asana, Azure) |
| :--- | :---: | :---: |
| **Governança Inteligente (AI PMO)** | 🟢 Nativa & Autônoma | 🔴 Limitada / Regras Manuais |
| **Classificação Automática de Demandas** | 🟢 Matriz de IA em Tempo Real | 🔴 Triagem Manual |
| **Matching Algorítmico de Profissionais** | 🟢 Ponderado por Competências | 🔴 Atribuição Manual |
| **Fluxos de Aprovação Dinâmicos** | 🟢 Baseado em Risco/Custo/Complexidade | 🔴 Hierarquia Estática |
| **Analytics Preditivo & Learning Engine** | 🟢 Histórico & Aprendizado Contínuo | 🟡 Agregações Básicas de Relatórios |
| **Geração Automática de Documentação** | 🟢 Motor Contextual de Documentos | 🔴 Criação Manual de Templates |

---

## 🏛 Arquitetura da Solução

O ProjectFlow AI foi projetado sob uma arquitetura de microsserviços desacoplada e escalável, garantindo alta disponibilidade, segurança robusta e baixa latência de resposta.

```text
                    ┌─────────────────────────────────────────┐
                    │            Camada de Cliente            │
                    │   React + Vite (Web) | Expo (Mobile)   │
                    └────────────────────┬────────────────────┘
                                         │
                                         ▼
                    ┌─────────────────────────────────────────┐
                    │         API Gateway / Backend           │
                    │            Node.js + Express            │
                    └────────────┬────────────────┬───────────┘
                                 │                │
            ┌────────────────────┘                └────────────────────┐
            ▼                                                          ▼
┌───────────────────────────┐                              ┌───────────────────────────┐
│     Orquestrador de IA    │                              │     Banco de Dados & Auth │
│  FastAPI + Python Engine  │                              │      Motor Supabase       │
│  (Gemini API Multi-Agente)│                              │  (PostgreSQL + RLS + Sec) │
└───────────────────────────┘                              └───────────────────────────┘
```

---

## 🤖 Rede Multi-Agente de IA

A inteligência da plataforma é dividida em agentes especializados executados no microserviço Python:

1. **Classification Agent:** Avalia e classifica a solicitação de entrada (*Ideia, Projeto, Inovação, Melhoria Contínua ou Sustentação*).
2. **Complexity Agent:** Mapeia e pontua o escopo em uma matriz algorítmica de 1 a 100 (*Muito Baixa* a *Crítica*).
3. **Cost Agent:** Estima custos financeiros, esforço em horas de desenvolvimento e prevê o ROI.
4. **Planning Agent:** Sugere cronogramas, matrizes de entregáveis, roadmaps e documentação funcional/técnica inicial.
5. **Matching Agent:** Ranqueia e sugere a melhor equipe para a execução com base nas competências cadastradas.
6. **Approval & Risk Agent:** Realiza análise preditiva de riscos e determina automaticamente a alçada de aprovação necessária.

---

## ⚡ Detalhamento Funcional das Regras de Negócio

### 1. Classificação Inteligente de Demandas
* **IDEIA:** Demandas com escopo indefinido, poucas informações ou que demandam refinamento funcional. São direcionadas ao *Innovation Center*.
* **PROJETO:** Demandas com escopo bem definido, objetivos claros e entregáveis mapeados. Avançam para o pipeline de estimativa e governança.

### 2. Matriz Algorítmica de Complexidade
* **1 a 20:** Complexidade Muito Baixa
* **21 a 40:** Complexidade Baixa
* **41 a 60:** Complexidade Média
* **61 a 80:** Complexidade Alta
* **81 a 100:** Complexidade Crítica

### 3. Algoritmo de Matching Ponderado
A alocação de profissionais utiliza um cálculo de relevância baseado nos seguintes pesos:
$$\text{Score de Aderência} = (40\% \times \text{Tecnologias}) + (30\% \times \text{Histórico de Projetos}) + (20\% \times \text{Disponibilidade}) + (10\% \times \text{Performance})$$

### 4. Matriz de Aprovação Dinâmica
* **Baixa Complexidade / Baixo Custo:** Aprovação direta do Product Owner (PO).
* **Média Complexidade:** Aprovação do PO + Gestor responsável.
* **Alta Complexidade:** Aprovação do PO + Gestor + Diretor.
* **Projetos Críticos:** Submissão e validação do Comitê Executivo.

---

## 🛡 Segurança & Governança de Dados

A plataforma implementa um modelo corporativo de segurança em camadas:
* **Autenticação & Autorização:** Supabase Auth com tokens JWT e controle de acesso baseado em papéis (RBAC - *User, Developer, Product Owner, Admin*).
* **Segurança na Camada de Dados:** Políticas rígidas de Row Level Security (RLS) diretamente no PostgreSQL do Supabase.
* **Proteção de Rede & Aplicação:** Implementação de Helmet, Limitação de Taxa (*Rate Limiting*), CORS restritivo e sanitização de dados.
* **Rastreabilidade:** Logs auditáveis contínuos (`audit_logs`) e monitoramento estruturado.

---

## 🗄 Estrutura do Banco de Dados

Modelagem relacional otimizada para suporte aos agentes de IA e governança:

* **Usuários & Perfil:** `profiles`, `developer_skills`, `po_specialties`
* **Projetos & Escopo:** `projects`, `project_tasks`, `project_status`, `project_public_forms`
* **Inteligência & Métricas:** `project_ai_analysis`, `project_metrics`, `project_history`
* **Operacional & Auditoria:** `project_comments`, `project_files`, `notifications`, `audit_logs`

---

## 📦 Organização dos Repositórios

O projeto adota uma estrutura modular separada por responsabilidades técnicas:

```text
├── projectflow-ai-docs        # Documentação Mestre de Arquitetura e APIs
├── projectflow-ai-backend     # API Gateway REST (Node.js + Express)
├── projectflow-ai-web         # Painel Executivo e Operacional Web (React + Vite)
├── projectflow-ai-mobile      # Aplicativo Mobile para Gestores (React Native + Expo)
├── projectflow-ai-python      # Microsserviço de IA Multi-Agente (FastAPI + Gemini)
└── projectflow-ai-database    # Scripts de Migração, Schemas e Políticas RLS (Supabase)
```

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
* **Node.js**: `v18.x` ou superior
* **Python**: `v3.10+`
* **Supabase CLI** ou Instância ativa do Supabase
* **Expo CLI** (opcional para desenvolvimento mobile)

### 1. Configuração do Backend (Node.js)
```bash
git clone https://github.com/seu-organizacao/projectflow-ai-backend.git
cd projectflow-ai-backend
npm install
```

### 2. Variáveis de Ambiente (`.env`)
```env
PORT=5000
SUPABASE_URL=https://sua-instancia.supabase.co
SUPABASE_ANON_KEY=sua-chave-anon
GEMINI_API_KEY=sua-chave-gemini-api
FASTAPI_AI_SERVICE_URL=http://localhost:8000
```

### 3. Execução do Microsserviço de IA (Python + FastAPI)
```bash
cd ../projectflow-ai-python
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 4. Inicialização do Backend e Frontend Web
```bash
# Na pasta projectflow-ai-backend
npm run dev

# Em outro terminal, na pasta projectflow-ai-web
npm install
npm run dev
```

---

## 🗺 Roadmap de Implementação

- [x] **Versão 1.0 - Core & Governança Inteligente:** Classificação automatizada por IA, Matching de profissionais, Agentes FastAPI com Gemini, RBAC e Dashboards Executivos.
- [ ] **Versão 2.0 - Learning Engine & PIC:** Aprendizado contínuo com histórico, análise de maturidade do projeto e motor de sugestões arquiteturais.
- [ ] **Versão 3.0 - Governança Preditiva Avançada:** Previsão autônoma de riscos do portfólio, balanceamento automático de carga e relatórios executivos sintetizados.

---

## 📄 Licença & Contato Comercial

Este projeto está sob a licença **MIT**. Para planos corporativos SaaS (*Starter, Professional, Enterprise, Corporate*), personalizações ou suporte especializado, entre em contato via **vendas@projectflow.ai**.

---
*Powered by ProjectFlow AI Engine — Inteligência que Impulsiona o Sucesso de Projetos.*
