require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');

const app = express();
app.use(express.json());
app.use(helmet());
app.use(cors());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Middleware simples de verificação RBAC
const checkRole = (allowedRoles) => async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token não fornecido' });

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return res.status(401).json({ error: 'Sessão inválida' });

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || !allowedRoles.includes(profile.role)) {
    return res.status(403).json({ error: 'Acesso negado: Permissão insuficiente' });
  }

  req.user = user;
  req.role = profile.role;
  next();
};

// Endpoint Público: Submissão de Demanda + Chamada para Microserviço de IA
app.post('/api/public/submit-demand', async (req, res) => {
  const { title, department, description, contact_email } = req.body;

  try {
    // 1. Salva formulário público
    const { data: form, error: formError } = await supabase
      .from('project_public_forms')
      .insert([{ title, department, description, contact_email, status: 'Em_Analise_IA' }])
      .select()
      .single();

    if (formError) throw formError;

    // 2. Aciona o serviço Python/Gemini
    const aiResponse = await axios.post(`${process.env.PYTHON_AI_SERVICE_URL}/api/v1/ai/analyze-demand`, {
      title,
      description,
      department
    });

    const aiData = aiResponse.data;

    // 3. Cria registro inicial do Projeto/Ideia
    const { data: project, error: projError } = await supabase
      .from('projects')
      .insert([{
        public_form_id: form.id,
        title,
        description,
        department,
        type: aiData.type,
        complexity_score: aiData.complexity_score,
        estimated_hours: aiData.estimated_hours,
        estimated_cost: aiData.estimated_cost,
        status: 'Aguardando_Aprovacao'
      }])
      .select()
      .single();

    if (projError) throw projError;

    res.status(201).json({ message: 'Demanda processada com sucesso pela IA', project });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint Protegido: Listagem para Dashboard
app.get('/api/projects', checkRole(['user', 'developer', 'product_owner', 'admin']), async (req, res) => {
  const { data, error } = await supabase.from('projects').select('*');
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Backend rodando na porta ${PORT}`));