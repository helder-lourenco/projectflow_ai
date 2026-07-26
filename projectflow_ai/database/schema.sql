-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.project_public_forms (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  department text NOT NULL,
  description text NOT NULL,
  contact_email text NOT NULL,
  status text DEFAULT 'Pendente'::text CHECK (status = ANY (ARRAY['Pendente'::text, 'Em_Analise_IA'::text, 'Aprovado_PO'::text, 'Rejeitado'::text])),
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  ai_extracted_data jsonb,
  raw_ai_log text,
  source_document_url text,
  search_id character varying UNIQUE,
  CONSTRAINT project_public_forms_pkey PRIMARY KEY (id)
);
CREATE TABLE public.projects (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  public_form_id uuid,
  title text NOT NULL,
  description text,
  department text NOT NULL,
  type text DEFAULT 'Ideia'::text CHECK (type = ANY (ARRAY['Projeto'::text, 'Ideia'::text])),
  status text DEFAULT 'Aguardando_Aprovacao'::text CHECK (status = ANY (ARRAY['Aguardando_Aprovacao'::text, 'Em_Andamento'::text, 'Concluido'::text, 'Cancelado'::text])),
  priority text DEFAULT 'Media'::text CHECK (priority = ANY (ARRAY['Baixa'::text, 'Media'::text, 'Alta'::text, 'Critica'::text])),
  complexity_score integer DEFAULT 20 CHECK (complexity_score >= 1 AND complexity_score <= 100),
  estimated_cost numeric DEFAULT 0.00,
  estimated_hours integer DEFAULT 0,
  assigned_po_id uuid,
  assigned_dev_id uuid,
  start_date date,
  end_date date,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  target_date date,
  pending_target_date date,
  ai_extracted_data jsonb,
  raw_ai_log text,
  source_document_url text,
  search_id character varying UNIQUE,
  CONSTRAINT projects_pkey PRIMARY KEY (id),
  CONSTRAINT projects_public_form_id_fkey FOREIGN KEY (public_form_id) REFERENCES public.project_public_forms(id)
);
CREATE TABLE public.project_approval_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  project_id uuid,
  requested_by uuid,
  request_type text NOT NULL,
  old_value text,
  new_value text,
  status text DEFAULT 'pending'::text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT project_approval_requests_pkey PRIMARY KEY (id),
  CONSTRAINT project_approval_requests_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id),
  CONSTRAINT project_approval_requests_requested_by_fkey FOREIGN KEY (requested_by) REFERENCES auth.users(id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  full_name text,
  department text,
  role text,
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);

-- ============================================================
-- AJUSTES NO SCHEMA EXISTENTE — ProjectFlow AI
-- Rode isso no SQL Editor do Supabase (não apaga dados)
-- ============================================================

-- 1. TRIGGER: updated_at automático para profiles
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 2. TRIGGER: updated_at para project_public_forms
ALTER TABLE project_public_forms ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT timezone('utc'::text, now());

DROP TRIGGER IF EXISTS project_public_forms_updated_at ON project_public_forms;
CREATE TRIGGER project_public_forms_updated_at
  BEFORE UPDATE ON project_public_forms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3. TRIGGER: updated_at para projects
ALTER TABLE projects ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT timezone('utc'::text, now());

DROP TRIGGER IF EXISTS projects_updated_at ON projects;
CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. ÍNDICES para performance nos filtros frequentes
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_department ON projects(department);
CREATE INDEX IF NOT EXISTS idx_projects_assigned_po ON projects(assigned_po_id);
CREATE INDEX IF NOT EXISTS idx_projects_assigned_dev ON projects(assigned_dev_id);
CREATE INDEX IF NOT EXISTS idx_projects_dates ON projects(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_public_forms_status ON project_public_forms(status);
CREATE INDEX IF NOT EXISTS idx_approval_requests_status ON project_approval_requests(status);
CREATE INDEX IF NOT EXISTS idx_approval_requests_project ON project_approval_requests(project_id);

-- 5. ROW LEVEL SECURITY (RLS) — ATIVAR EM TODAS AS TABELAS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_public_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_approval_requests ENABLE ROW LEVEL SECURITY;

-- 6. POLÍTICAS RLS

-- Profiles: todos leem; só o próprio edita; admin faz tudo
CREATE POLICY IF NOT EXISTS "profiles_select_all" ON profiles FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "profiles_update_self" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY IF NOT EXISTS "profiles_admin_all" ON profiles FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'administrador')
);

-- Project Public Forms: inserção pública (formulário sem login)
CREATE POLICY IF NOT EXISTS "forms_insert_public" ON project_public_forms FOR INSERT WITH CHECK (true);
-- Leitura: apenas admin e PO
CREATE POLICY IF NOT EXISTS "forms_select_admin_po" ON project_public_forms FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('administrador','po'))
);
-- Update: apenas admin e PO
CREATE POLICY IF NOT EXISTS "forms_update_admin_po" ON project_public_forms FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('administrador','po'))
);

-- Projects: admin vê tudo; PO vê projetos onde é assigned_po; dev vê onde é assigned_dev; outros veem do departamento
CREATE POLICY IF NOT EXISTS "projects_select_all" ON projects FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'administrador')
  OR assigned_po_id = auth.uid()
  OR assigned_dev_id = auth.uid()
  OR department = (SELECT department FROM profiles WHERE id = auth.uid())
);
CREATE POLICY IF NOT EXISTS "projects_insert_admin_po" ON projects FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('administrador','po'))
);
CREATE POLICY IF NOT EXISTS "projects_update_admin_po" ON projects FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('administrador','po'))
  OR assigned_dev_id = auth.uid()
);

-- Approval Requests: quem criou vê; admin e PO vêm tudo
CREATE POLICY IF NOT EXISTS "approval_select_owner" ON project_approval_requests FOR SELECT USING (
  requested_by = auth.uid()
  OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('administrador','po'))
);
CREATE POLICY IF NOT EXISTS "approval_insert_auth" ON project_approval_requests FOR INSERT WITH CHECK (
  auth.uid() = requested_by
);