# Gemini CLI — Perfil e uso

## Visão geral
Gemini CLI refere-se ao cliente para os modelos Google Gemini (Google Cloud AI). Importante: o acesso costuma exigir API key do Google Cloud ou OAuth via service account.

## Instalação
- Via npm:

```bash
npm install -g @google/gemini-cli
```

## Configuração
- Variáveis de ambiente comuns:
  - GOOGLE_API_KEY
  - GOOGLE_APPLICATION_CREDENTIALS (path para keyfile JSON de service account)

- No Termux, salve credenciais em `~/.config/windsurf/.env` ou `~/.config/gcloud/credentials.json`.

## Notas Termux / Android ARM64
- Requer Node.js no Termux (pkg install nodejs).
- Compatível com Termux, usa OAuth para auth (abre browser), 1000 req/day free.
- Para headless (Termux), use API key diretamente.
- Limitações: algumas bibliotecas Google Cloud têm dependências nativas; prefira chamadas HTTP REST diretas quando em Termux.

### 📝 **Nota sobre node-pty**

- O Gemini CLI pode apresentar problemas com node-pty no ARM64
- **Solução**: Use a opção `--no-pty` ou configure variável de ambiente:

  ```bash
  export NODE_PTY=false
  gemini --no-pty [comandos]
  ```

- Alternativa: usar API REST diretamente para evitar dependências nativas

## Exemplos (snippets)

1. Chamar API REST (exemplo genérico):

   ```bash
   curl -s -X POST "https://generativelanguage.googleapis.com/v1beta2/models/gemini-1:generateText" \
     -H "Authorization: Bearer $GOOGLE_OAUTH_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"prompt":"Resuma Playwright no Android."}'
   ```

2. Usando API key (quando permitido):

   ```bash
   curl -s -X POST "https://api.googleapis.com/v1/...?key=$GOOGLE_API_KEY" -d '{"prompt":"..."}'
   ```

3. Config JSON de cliente:

   ```json
   {
     "type": "service_account",
     "project_id": "my-project",
     "private_key_id": "...",
     "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
   }
   ```

## Próximos passos

- Vou pesquisar endpoints oficiais da Google Generative AI (Gemini) e comandos CLI/SDK oficiais, além de exemplos otimizados para Termux/ARM64.

---

## 🚀 **Roadmap de Instalação - Status Atual**

### ✅ **Componentes Verificados no Ambiente**

| Componente | Status | Versão Detectada | Localização |
|------------|--------|------------------|-------------|
| **Node.js** | ✅ Instalado | v24.9.0 | `/data/data/com.termux/files/usr/bin/node` |
| **npm** | ⚠️ Instalado mas com problemas | - | Links simbólicos quebrados |
| **Gemini CLI** | ✅ **Instalado e Funcional** | - | `@google/gemini-cli` |
| **Google Generative AI SDK** | ✅ Instalado (PC) | - | Verificado via import |
| **Python** | ✅ Instalado (PC) | 3.14.0 | `/usr/bin/python3` |
| **google-generativeai (Python)** | ✅ Instalado (PC) | - | Verificado via import |

### 🔧 **Próximos Passos para Instalação Completa**

1. **Corrigir npm (links simbólicos):**

   ```bash
   npm install -g npm
   ```

2. **Instalar SDK Python no Termux:**

   ```bash
   pkg install python
   pip install google-generativeai
   ```

3. **Configurar API Key:**

   ```bash
   export GOOGLE_API_KEY="your_key_here"
   ```

4. **Testar Gemini CLI:**

   ```bash
   node /data/data/com.termux/files/usr/lib/node_modules/@google/gemini-cli/dist/index.js --help
   ```

### 📊 **Compatibilidade com UFFM**

- **Status:** 🔍 **Não verificado** - UFFM não detectada no ambiente
- **Potencial:** Alto - Gemini é compatível com frameworks universais de IA
- **Integração:** Boa integração esperada com UFFM devido à arquitetura Google

---

**🎯 Status Geral**: Gemini CLI instalado e funcional no Termux, SDK Python disponível no PC, npm precisa correção de links simbólicos.
