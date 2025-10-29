# Banco-Api — Reconstrução focada em Android ARM64 / Termux

> Observação: este documento é um rascunho criado a partir de `Prompts/Banco-Api.md`. Não modifica o arquivo original — apenas extrai e organiza informações para uso em Termux (ARM64).

## 1) Credenciais e variáveis detectadas (extraídas)
A partir do `Prompts/Banco-Api.md` foram encontradas as seguintes variáveis/entradas (lista de nomes, sem expor valores aqui):

- N8N_BASE_URL (URL local do n8n)
- GOOGLE_API_KEY (várias chaves listadas)
- OPENROUTER_API_KEY
- GITHUB_PERSONAL_ACCESS_TOKEN
- TAVILY_API_KEY
- CONTEXT7 / CONTEXT7_API_KEY (mencionado em mcp.json)
- Variáveis para MCPs e placeholders (CONTEXT7_API_KEY, FASTMCP_LOG_LEVEL, etc.)

> Classificação preliminar:
- Sensíveis (secret): GOOGLE_API_KEY, OPENROUTER_API_KEY, GITHUB_PERSONAL_ACCESS_TOKEN, TAVILY_API_KEY, CONTEXT7_API_KEY
- Menos sensíveis / config: N8N_BASE_URL, FASTMCP_LOG_LEVEL, PLAYWRIGHT_BROWSERS

## 2) Quais MCPs podem usar cada credencial
- Memory MCP (`@modelcontextprotocol/server-memory`): não requer chave externa, usa arquivo local para persistência.
- Tavily MCP (`tavily-mcp`): requer `TAVILY_API_KEY` para buscas web.
- Context7 / Upstash MCP (`@upstash/context7-mcp`): requer `CONTEXT7_API_KEY`.
- Git MCP (`@cyanheads/git-mcp-server`) / GitHub integration: usa `GITHUB_PERSONAL_ACCESS_TOKEN`.
- OpenRouter / Outros proxies (OpenRouter): usa `OPENROUTER_API_KEY` para acessar múltiplos modelos.
- Google Gemini: `GOOGLE_API_KEY` ou `GOOGLE_APPLICATION_CREDENTIALS` (service account) para acesso via REST/SDK.

## 3) Recomendações de armazenamento seguro (Termux/ARM64)
- Nunca commitar `Banco-Api.md` nem arquivos `.env` com chaves reais.
- Usar `~/.config/windsurf/.env` ou `~/.config/banco-api/.env` com permissão 600:

```bash
mkdir -p ~/.config/windsurf
cat > ~/.config/windsurf/.env <<'EOF'
# EXEMPLOS - Substitua pelos seus valores
GOOGLE_API_KEY=YOUR_GOOGLE_API_KEY
OPENROUTER_API_KEY=YOUR_OPENROUTER_KEY
GITHUB_PERSONAL_ACCESS_TOKEN=YOUR_GITHUB_TOKEN
TAVILY_API_KEY=YOUR_TAVILY_KEY
N8N_BASE_URL=http://localhost:5678
EOF
chmod 600 ~/.config/windsurf/.env
```

- Alternativa mais segura: armazenar segredos em arquivo encriptado (gpg symmetric) e desembaralhar em runtime:

```bash
# criptografar
gpg --symmetric --cipher-algo AES256 ~/.config/windsurf/.env
# decriptar para usar
gpg --quiet --batch --decrypt --passphrase-file ~/.config/windsurf/.env.passphrase \
  -o ~/.config/windsurf/.env ~/.config/windsurf/.env.gpg
```

- Para agentes que rodam continuamente (pm2/nohup/systemd), use environment files (systemd `EnvironmentFile=`) com permissão restrita.

## 4) Esquema JSON recomendado (Banco-API) — versão 1.0
Exemplo de arquivo de configuração `~/.config/windsurf/banco-api.json` (sem valores reais):

```json
{
  "version": "1.0",
  "services": {
    "n8n": { "base_url": "http://localhost:5678" },
    "google": {
      "auth_type": "api_key",
      "api_keys": ["GOOGLE_API_KEY_1"],
      "service_account_file": null
    },
    "openrouter": { "api_key_env": "OPENROUTER_API_KEY" },
    "github": { "pat_env": "GITHUB_PERSONAL_ACCESS_TOKEN" },
    "tavily": { "api_key_env": "TAVILY_API_KEY" }
  },
  "mcpDefaults": {
    "memory": { "path": "/data/memory.db" },
    "playwright": { "headless": true }
  },
  "security": {
    "store": "env", 
    "encryptedFiles": ["~/.config/windsurf/.env.gpg"]
  }
}
```

- Política: apps/agentes devem ler chaves via env (preferível) ou via `banco-api.json` referenciando nomes de variáveis de ambiente.

## 5) Fluxos práticos para uso com agentes (exemplos)
1) Workflow rápido (Termux) — rodar Tavily MCP + Memory e testar:

```bash
# exportar chaves temporariamente (evitar no histórico)
export TAVILY_API_KEY=$(gpg --quiet --batch --decrypt --passphrase-file ~/.config/windsurf/.env.passphrase ~/.config/windsurf/tavily.gpg)
# iniciar memory MCP
npx -y @modelcontextprotocol/server-memory &
# testar tavily (modo local)
TAVILY_API_KEY=$TAVILY_API_KEY npx -y tavily-mcp --search "Termux Playwright"
```

2) Uso com Playwright remoto (recomendado para Android):
- Guardar `OPENROUTER_API_KEY` e `GOOGLE_API_KEY` como variáveis no serviço remoto (VPS) e apontar Termux para o endpoint remoto via SSH/WS.

## 6) Rotação de chaves e SSH
- Regenerar tokens quando comprometidos.
- SSH: para rotação de chaves (sem senha) — gerar nova par de chaves e distribuir com `ssh-copy-id` ou copiar chave pública para `~/.ssh/authorized_keys` dos destinos.

Exemplo (Termux / zsh):

```bash
# gerar chave (ed25519 recomendada)
ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519 -C "deivisan@device" -N ""
# copiar para servidor remoto
ssh-copy-id -i ~/.ssh/id_ed25519.pub user@server
```

Se preferir com passphrase, use ssh-agent e `ssh-add` para desbloquear no login.

## 7) Próximos passos / entregáveis
- Mapear todas as chaves concretas do `Prompts/Banco-Api.md` e classificar por serviço (feito - nomes).
- Gerar scripts seguros de bootstrap para Termux (gerar `.env.gpg`, systemd unit examples via proot if necessário).
- Expandir integrações passo-a-passo para Qwen, Gemini, Copilot, Grok e Playwright (criar markdowms individuais em /temp).  

---

> Observação de segurança final: o arquivo `Prompts/Banco-Api.md` contém tokens sensíveis — considere regenerá-los após mover para storage seguro e evitar exibir valores em arquivos de texto não encriptados.
