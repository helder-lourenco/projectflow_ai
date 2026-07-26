Migração: Google Gemini → Kimi (Moonshot AI)
Por que Kimi?
Planilhas
Aspecto	Gemini	Kimi (Moonshot AI)
API	SDK próprio (google-genai)	Compatível com OpenAI (openai>=1.0)
Contexto	Até 1M tokens	Até 1M tokens (K3)
Preço	Free tier limitado	Pay-as-you-go, a partir de $1
Modelos	gemini-2.5-flash	kimi-k3, kimi-k2.6, kimi-k2.5
Suporte a PT-BR	Bom	Excelente
Raciocínio	Moderado	K3 com thinking mode nativo
Como Obter a API Key
Acesse https://platform.kimi.ai
Crie uma conta (email ou GitHub)
Faça login e vá em API Keys no menu lateral
Clique em Create API Key
Copie a chave (começa com sk-)
Faça um top-up (recarga) mínima de $1 para desbloquear o modelo K3
K2.6 e K2.5 funcionam sem recarga, mas com rate limits menores
Modelos Recomendados
Planilhas
Modelo	Uso Ideal	Custo (input/output)	Contexto
kimi-k2.6	Análise de demandas, classificação	$0.95 / $4.00 por 1M tokens	256K
kimi-k3	Raciocínio complexo, coding agents	$3.00 / $15.00 por 1M tokens	1M
kimi-k2.5	Tarefas gerais, chatbots	$0.60 / $3.00 por 1M tokens	256K
kimi-k2.7-code	Geração de código, refactoring	$0.95 / $4.00 por 1M tokens	256K
Para o ProjectFlow AI, recomendamos kimi-k2.6 — equilíbrio perfeito entre custo e qualidade para análise de demandas corporativas.
Instalação
bash
cd python

# 1. Criar ambiente virtual (recomendado)
python -m venv venv

# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# 2. Instalar dependências
pip install -r requirements.txt

# 3. Configurar variáveis de ambiente
cp .env.example .env
# Edite .env e preencha MOONSHOT_API_KEY

# 4. Rodar
python main.py
Testar a API
bash
curl -X POST http://localhost:8000/api/v1/ai/analyze-demand \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Portal de Gestão de Contratos",
    "description": "Plataforma para assinatura e acompanhamento de contratos",
    "department": "Jurídico"
  }'
Diferenças no Código (Gemini → Kimi)
Planilhas
Antes (Gemini)	Depois (Kimi)
from google import genai	from openai import OpenAI
client = genai.Client(api_key=...)	client = OpenAI(api_key=..., base_url="https://api.moonshot.ai/v1")
client.models.generate_content(...)	client.chat.completions.create(...)
response.text	response.choices[0].message.content
response.usage_metadata	response.usage
Troubleshooting
Erro: "Insufficient balance"
Faça um top-up mínimo de $1 em https://platform.kimi.ai/billing
Erro: "Rate limit exceeded"
O free tier permite poucas requisições por minuto
Faça top-up para aumentar os limites
Erro: "Invalid API Key"
Verifique se a chave começa com sk-
Certifique-se de que não há espaços ou quebras de linha