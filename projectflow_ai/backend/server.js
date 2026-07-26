require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
const { z } = require('zod');
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [new winston.transports.Console()]
});

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas requisições. Tente novamente mais tarde.' }
});
app.use('/api/', limiter);

app.use(express.json({ limit: '10mb' }));

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// ─── SCHEMAS ZOD ───
const demandSchema = z.object({
  title: z.string().min(3).max(200),
  department: z.string().min(1).max(100),
  description: z.string().max(2000).optional(),
  contact_email: z.string().email()
});

// ─── RBAC MIDDLEWARE ───
const checkRole = (allowedRoles) => async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token não fornecido' });

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return res.status(401).json({ error: 'Sessão inválida' });

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !allowedRoles.includes(profile.role)) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    req.user = user;
    req.role = profile.role;
    next();
  } catch (err) {
    logger.error('Erro no middleware de autenticação', { error: err.message });
    return res.status(500).json({ error: 'Erro interno de autenticação' });
  }
};

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'projectflow-backend', timestamp: new Date().toISOString() });
});

// ─── ENDPOINT PÚBLICO: Submissão de Demanda ───
app.post('/api/public/submit-demand', async (req, res) => {
  const parsed = demandSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Dados inválidos', details: parsed.error.format() });
  }

  const { title, department, description, contact_email } = parsed.data;

  try {
    // 1. Salva formulário (status: Em_Analise_IA — alinhado com seu CHECK constraint)
    const { data: form, error: formError } = await supabase
      .from('project_public_forms')
      .insert([{
        title,
        department,
        description: description || '',
        contact_email,
        status: 'Em_Analise_IA'
      }])
      .select()
      .single();

    if (formError) throw formError;

    // 2. Chama microserviço Python/Gemini
    let aiData = null;
    try {
      const aiResponse = await axios.post(
        `${process.env.PYTHON_AI_SERVICE_URL}/api/v1/ai/analyze-demand`,
        { title, description, department },
        { timeout: 30000 }
      );
      aiData = aiResponse.data;

      // Atualiza com ai_extracted_data (nome da sua coluna)
      await supabase
        .from('project_public_forms')
        .update({
          ai_extracted_data: aiData,
          status: 'Aprovado_PO'
        })
        .eq('id', form.id);
    } catch (aiErr) {
      logger.warn('Falha na análise da IA', { error: aiErr.message });
    }

    // 3. Cria projeto inicial (usando seus nomes de colunas)
    const { data: project, error: projError } = await supabase
      .from('projects')
      .insert([{
        public_form_id: form.id,
        title,
        description: description || '',
        department,
        type: aiData?.type || 'Ideia',
        complexity_score: aiData?.complexity_score || 20,
        estimated_hours: aiData?.estimated_hours || 0,
        estimated_cost: aiData?.estimated_cost || 0.00,
        status: 'Aguardando_Aprovacao',
        priority: 'Media'
      }])
      .select()
      .single();

    if (projError) throw projError;

    logger.info('Demanda processada', { formId: form.id, projectId: project.id });
    res.status(201).json({
      message: 'Demanda recebida e analisada com sucesso',
      project,
      aiAnalysis: aiData
    });
  } catch (err) {
    logger.error('Erro ao processar demanda', { error: err.message });
    res.status(500).json({ error: 'Erro interno ao processar demanda' });
  }
});

// ─── LISTAR PROJETOS ───
app.get('/api/projects', checkRole(['administrador', 'desenvolvedor', 'po', 'scrum master', 'teste']), async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*, project_public_forms(title, contact_email)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    logger.error('Erro ao listar projetos', { error: err.message });
    res.status(500).json({ error: 'Erro ao carregar projetos' });
  }
});

app.use((err, req, res, next) => {
  logger.error('Unhandled error', { message: err.message });
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Erro interno' : err.message
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  logger.info(`ProjectFlow Backend rodando na porta ${PORT}`);
});