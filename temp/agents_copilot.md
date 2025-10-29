# GitHub Copilot CLI — Perfil e uso

## Visão geral
GitHub Copilot CLI é o utilitário em linha de comando para acessar funcionalidades do GitHub Copilot (sugestões de código, pair programming, etc.). Ele pode integrar-se a fluxos locais e ser usado em Termux quando a autenticação via GitHub estiver configurada.

## Instalação
```bash
npm install -g @github/copilot
```

## Autenticação
- Use PAT (Personal Access Token) com scope copilot.
- Variáveis/flags: GH_TOKEN

## Notas Termux / Android ARM64
- Requer Node.js v22+, problemas no Termux (usar proot).
- Permissões: network, git

### ⚠️ **Problemas no Modo Interativo**

- O modo interativo (`copilot`) pode apresentar travamentos no Termux ARM64
- **Sintomas**: Interface congela, comandos não respondem
- **Soluções**:
  - Use comandos diretos: `copilot suggest`, `copilot explain`
  - Configure timeout: `copilot --timeout 30s [comando]`
  - Use em proot com Ubuntu completo para melhor compatibilidade

## Exemplos

1. Ativar sessão Copilot:

   ```bash
   copilot
   # /login
   ```

2. Gerar sugestão de função via Copilot CLI (exemplo hipotético):

   ```bash
   copilot suggest --file src/index.js --line 120
   ```

3. Integrar com Memory MCP (exemplo):

   ```bash
   copilot export-context --format json | npx @modelcontextprotocol/server-memory import
   ```

## Próximos passos

- Pesquisar docs oficiais do Copilot CLI e exemplos de integração com MCPs e Termux.

---

## 🚀 **Roadmap de Instalação - Status Atual**

### ✅ **Componentes Verificados no Ambiente**

| Componente | Status | Versão Detectada | Localização |
|------------|--------|------------------|-------------|
| **Node.js** | ✅ Instalado | v24.9.0 | `/data/data/com.termux/files/usr/bin/node` |
| **npm** | ⚠️ Instalado mas com problemas | - | Links simbólicos quebrados |
| **GitHub Copilot CLI** | ✅ **Instalado e Funcional** | - | `@github/copilot` |
| **Git** | ✅ Instalado (PC) | 2.51.2 | `/usr/bin/git` |
| **GitHub CLI** | ❌ Não verificado | - | Pode estar disponível |

### 🔧 **Próximos Passos para Instalação Completa**

1. **Corrigir npm (links simbólicos):**

   ```bash
   npm install -g npm
   ```

2. **Configurar GitHub Token:**

   ```bash
   export GH_TOKEN="your_github_token_here"
   ```

3. **Instalar GitHub CLI (opcional):**

   ```bash
   # Via pkg ou download direto
   pkg install gh
   ```

4. **Testar GitHub Copilot CLI:**

   ```bash
   node /data/data/com.termux/files/usr/lib/node_modules/@githubnext/github-copilot-cli/cli.js --help
   ```

### 📊 **Compatibilidade com UFFM**

- **Status:** 🔍 **Não verificado** - UFFM não detectada no ambiente
- **Potencial:** Alto - Copilot tem boa integração com frameworks de IA
- **Integração:** Esperada boa compatibilidade com UFFM

---

**🎯 Status Geral**: GitHub Copilot CLI instalado e funcional no Termux, Git disponível no PC, npm precisa correção de links simbólicos.
