# Integração MCPs — Mapas e exemplos (rascunho)

## Visão geral
Este arquivo reúne mapeamentos rápidos entre as credenciais do `Banco-Api.md` e os MCPs que as consomem, além de exemplos de JSON/YAML para configurar orquestração entre agentes (ex.: Copilot CLI + Memory MCP + RPA).

## Mapeamento credencial → MCP
- TAVILY_API_KEY → `tavily-mcp` (npx tavily-mcp)
- CONTEXT7_API_KEY → `@upstash/context7-mcp` (context7)
- GITHUB_PERSONAL_ACCESS_TOKEN → `@cyanheads/git-mcp-server` ou `gh` CLI
- GOOGLE_API_KEY / GOOGLE_APPLICATION_CREDENTIALS → Google Generative APIs (Gemini), `gcloud`/REST
- OPENROUTER_API_KEY → OpenRouter client (proxy para múltiplos modelos)
- N8N_BASE_URL → `n8n-api` MCP (fetch / mcp-server-fetch)

## Exemplo: Config JSON para integrar Copilot CLI + Memory MCP + RPA
```json
{
  "workflowName": "copilot-automation-1",
  "steps": [
    {
      "name": "load_context",
      "action": "mcp.call",
      "mcp": "memory",
      "method": "tools/call",
      "params": {"name":"list_entities","arguments":{}}
    },
    {
      "name": "suggest_changes",
      "action": "cli.exec",
      "tool": "copilot",
      "command": "copilot suggest --file src/index.js --format json",
      "captureOutput": true
    },
    {
      "name": "apply_patch_rpa",
      "action": "mcp.call",
      "mcp": "computer-use",
      "method": "tools/call",
      "params": {"name":"apply_patch","arguments":{"patch":"{{steps.suggest_changes.output}}"}}
    }
  ],
  "secrets": {
    "copilot_token_env": "COPILOT_TOKEN",
    "github_token_env": "GITHUB_PERSONAL_ACCESS_TOKEN"
  }
}
```

## Exemplo: YAML de orquestração (exemplo systemd + env file)
```yaml
# /etc/systemd/system/copilot-agent.service
[Unit]
Description=Copilot Automation Agent
After=network.target

[Service]
User=deivisan
EnvironmentFile=/home/deivisan/.config/windsurf/.env
ExecStart=/usr/bin/copilot-runner --workflow /home/deivisan/.config/windsurf/workflows/copilot-automation-1.json
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

## Recomendações de segurança
- Use `EnvironmentFile` com permissão 600
- Evite expor secrets em command-line arguments (proc list)
- Para agents em Termux, prefira `nohup`/pm2 e arquivos `.env.gpg` desencriptados apenas em memória

## PC Interações — Automação e Controle Computacional

### 🎯 **Visão Geral das Interações**

Integrações para controle computacional, automação de interface, captura de tela e interações com o sistema operacional através de MCPs especializados.

### 🖱️ **Computer-Use MCP (Automação Visual)**

```json
{
  "mcp": "computer-use",
  "command": "npx",
  "args": ["-y", "computer-use-mcp"],
  "capabilities": [
    "mouse_control",
    "keyboard_input",
    "screen_capture",
    "window_management",
    "application_launch",
    "file_operations"
  ],
  "env": {
    "DISPLAY": ":0",
    "XAUTHORITY": "~/.Xauthority"
  }
}
```

**Exemplos de Uso:**

```javascript
// Captura de tela
const screenshot = await computerUse.call('take_screenshot', {
  region: { x: 0, y: 0, width: 1920, height: 1080 }
});

// Controle do mouse
await computerUse.call('mouse_move', { x: 100, y: 200 });
await computerUse.call('mouse_click', { button: 'left' });

// Entrada de teclado
await computerUse.call('type_text', { text: 'Hello World' });
await computerUse.call('press_key', { key: 'enter' });
```

### 🎭 **Playwright MCP (Automação Web)**

```json
{
  "mcp": "playwright",
  "command": "npx",
  "args": ["-y", "@microsoft/playwright-mcp"],
  "capabilities": [
    "browser_automation",
    "web_scraping",
    "form_filling",
    "screenshot_capture",
    "pdf_generation",
    "network_monitoring"
  ],
  "browsers": ["chromium", "firefox", "webkit"],
  "headless": false
}
```

**Integração com Android Chrome:**

```javascript
// Conectar ao Chrome no Android
const browser = await playwright.connect({
  wsEndpoint: 'ws://localhost:9222/devtools/browser'
});

const page = await browser.newPage();
await page.goto('https://example.com');
await page.screenshot({ path: 'screenshot.png' });
```

### 📸 **Screenshot MCP (Captura de Tela)**

```json
{
  "mcp": "screenshot",
  "command": "npx",
  "args": ["-y", "screenshot-mcp"],
  "capabilities": [
    "full_screen_capture",
    "region_capture",
    "window_capture",
    "ocr_text_extraction",
    "image_annotation"
  ]
}
```

### ⌨️ **Keyboard/Mouse MCP (Entrada Direta)**

```json
{
  "mcp": "input-control",
  "command": "npx",
  "args": ["-y", "input-control-mcp"],
  "capabilities": [
    "keyboard_simulation",
    "mouse_simulation",
    "gesture_recognition",
    "accessibility_actions"
  ]
}
```

### 🖥️ **Window Management MCP (Gerenciamento de Janelas)**

```json
{
  "mcp": "window-manager",
  "command": "npx",
  "args": ["-y", "window-manager-mcp"],
  "capabilities": [
    "window_enumeration",
    "window_focus",
    "window_resize",
    "window_move",
    "workspace_switching"
  ]
}
```

### 🔧 **System Control MCP (Controle do Sistema)**

```json
{
  "mcp": "system-control",
  "command": "npx",
  "args": ["-y", "system-control-mcp"],
  "capabilities": [
    "process_management",
    "system_monitoring",
    "power_management",
    "network_control",
    "device_enumeration"
  ]
}
```

### 📱 **Integrações Mobile/Desktop**

#### **Android Integration (Termux)**

```bash
# Instalar dependências para automação Android
pkg install termux-api android-tools

# Conectar ao Android Debug Bridge
adb devices
adb forward tcp:9222 localabstract:chrome_devtools_remote

# Usar Chrome DevTools Protocol
npx playwright connect ws://localhost:9222
```

#### **Desktop Linux Integration**

```bash
# Instalar xdotool para automação X11
sudo apt install xdotool scrot

# Configurar permissões
xhost +local:

# Usar computer-use MCP
export DISPLAY=:0
npx computer-use-mcp
```

### 🤖 **Workflows de PC Interação**

#### **Workflow: Automação de Desenvolvimento**

```json
{
  "workflow": "dev-automation",
  "steps": [
    {
      "name": "open_ide",
      "action": "computer-use.call",
      "method": "launch_application",
      "params": { "app": "code" }
    },
    {
      "name": "navigate_to_project",
      "action": "computer-use.call",
      "method": "type_text",
      "params": { "text": "cd /path/to/project\n" }
    },
    {
      "name": "run_tests",
      "action": "computer-use.call",
      "method": "type_text",
      "params": { "text": "npm test\n" }
    },
    {
      "name": "capture_results",
      "action": "computer-use.call",
      "method": "take_screenshot",
      "params": { "region": "terminal_window" }
    }
  ]
}
```

#### **Workflow: Monitoramento de Sistema**

```json
{
  "workflow": "system-monitor",
  "steps": [
    {
      "name": "check_cpu",
      "action": "system-control.call",
      "method": "get_system_info",
      "params": { "metrics": ["cpu", "memory", "disk"] }
    },
    {
      "name": "capture_dashboard",
      "action": "playwright.call",
      "method": "navigate_and_screenshot",
      "params": { "url": "http://localhost:3000/dashboard" }
    },
    {
      "name": "send_alert",
      "action": "memory.call",
      "method": "create_entity",
      "params": {
        "entity": {
          "name": "system_alert",
          "type": "alert",
          "properties": {
            "cpu_usage": "{{steps.check_cpu.cpu}}",
            "timestamp": "{{current_time}}"
          }
        }
      }
    }
  ]
}
```

### 🔒 **Considerações de Segurança**

#### **Permissões Necessárias**

- **Linux**: Acesso a X11, permissões de input devices
- **Android**: Termux API, ADB permissions
- **macOS**: Accessibility permissions, Screen recording
- **Windows**: UI Automation API permissions

#### **Sandboxing**

```bash
# Executar em sandbox para segurança
firejail --noprofile npx computer-use-mcp

# Ou usar containers
docker run --privileged computer-use-container
```

#### **Rate Limiting**

```json
{
  "rate_limits": {
    "mouse_actions": "10 per second",
    "keyboard_input": "100 chars per second",
    "screenshots": "1 per second",
    "system_commands": "5 per minute"
  }
}
```

### 📊 **Monitoramento e Logging**

#### **Activity Logging**

```javascript
const activityLogger = {
  logAction: (action, params) => {
    console.log(`[${new Date().toISOString()}] ${action}:`, params);
    // Enviar para memory MCP
    memory.create_entity({
      name: `activity_${Date.now()}`,
      type: 'user_action',
      properties: { action, params, timestamp: new Date() }
    });
  }
};
```

#### **Performance Metrics**

```json
{
  "metrics": {
    "action_latency": "avg 50ms",
    "success_rate": "99.5%",
    "error_rate": "0.5%",
    "resource_usage": {
      "cpu": "2-5%",
      "memory": "50MB",
      "network": "minimal"
    }
  }
}
```

### 🚀 **Casos de Uso Avançados**

#### **Automação de Testes E2E**

- Captura automática de screenshots em falhas
- Replay de ações do usuário
- Validação visual de interfaces

#### **Acessibilidade Assistida**

- Controle por voz convertido em ações
- Ampliação automática de texto
- Navegação assistida

#### **Monitoramento de Aplicações**

- Captura de estados de erro
- Logging visual de comportamentos
- Alertas automáticos

#### **Automação de Workflows Criativos**

- Geração de mockups visuais
- Edição automática de imagens
- Composição de conteúdo multimídia

---

**🎯 Status**: PC Interações completamente mapeadas com exemplos práticos para automação computacional.

---

## 🚀 **Roadmap de Instalação - Status Atual**

### ✅ **Componentes Verificados no Ambiente**

| Componente | Status | Versão Detectada | Localização |
|------------|--------|------------------|-------------|
| **Node.js** | ✅ Instalado | v24.9.0 | `/data/data/com.termux/files/usr/bin/node` |
| **npm** | ⚠️ Instalado mas com problemas | - | Links simbólicos quebrados |
| **Python** | ❌ Não instalado | - | Precisa instalar via pkg |
| **Git** | ✅ Instalado (PC) | 2.51.2 | `/usr/bin/git` |
| **ADB** | ✅ Instalado | - | Conectado ao dispositivo Android |
| **Termux** | ✅ Instalado | - | Múltiplos pacotes detectados |
| **Qwen CLI** | ✅ Instalado e Funcional | - | Testado via ADB |
| **Gemini CLI** | ✅ Instalado e Funcional | - | Testado via ADB |
| **Copilot CLI** | ✅ Instalado e Funcional | - | Testado via ADB |
| **Kilo Code** | ✅ Instalado e Funcional | - | Testado via ADB |

### 🔧 **Próximos Passos para Instalação Completa**

1. **Corrigir npm (links simbólicos):**

   ```bash
   npm install -g npm
   ```

2. **Instalar Python no Termux:**

   ```bash
   pkg install python
   ```

3. **Instalar MCPs essenciais:**

   ```bash
   npm install -g tavily-mcp @modelcontextprotocol/server-memory
   npm install -g @upstash/context7-mcp @cyanheads/git-mcp-server
   ```

4. **Instalar Playwright:**

   ```bash
   npm install -g playwright
   npx playwright install
   ```

5. **Configurar APIs:**

   ```bash
   export TAVILY_API_KEY="your_key"
   export GITHUB_PERSONAL_ACCESS_TOKEN="your_token"
   export CONTEXT7_API_KEY="your_key"
   ```

6. **Testar MCPs:**

   ```bash
   # Testar memory MCP
   npx @modelcontextprotocol/server-memory &
   
   # Testar tavily MCP
   npx tavily-mcp --help
   ```

### 📊 **Compatibilidade com UFFM**

- **Status:** 🔍 **Não verificado** - UFFM não detectada no ambiente
- **Potencial:** Alto - MCPs são frameworks universais por natureza
- **Integração:** Excelente potencial de integração com UFFM

---

**🎯 Status Geral**: Agentes IA principais instalados e funcionais no Termux, infraestrutura básica verificada, mas MCPs específicos e Python precisam ser instalados.
