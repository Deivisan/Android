# Qwen CLI — Perfil e uso

## Visão geral
Qwen CLI é o cliente oficial para interagir com modelos Qwen (by Alibaba/Quora?) — confirme a origem ao pesquisar. Aqui documentamos instalação, configuração, uso em Termux/Android ARM64 e exemplos práticos.

## Instalação
- Recomendo instalar a versão @latest via npm quando disponível:

```bash
npm install -g @qwen-code/qwen-code
```

(Se o projeto for distribuído por outro gerenciador, adapte.)

## Configuração
- Variáveis de ambiente recomendadas (exemplos):
  - QWEN_API_KEY
  - QWEN_API_URL (opcional)

- Arquivo `.env` recomendado (não comitar):
```
QWEN_API_KEY=YOUR_QWEN_API_KEY_HERE
QWEN_API_URL=https://api.qwen.example
```

## Notas Termux / Android ARM64
- Requer Node.js disponível no Termux (pkg install nodejs)
- Se usar binários nativos, verifique arquitetura arm64/armv8
- Permissões: network
- Problemas conhecidos: node-pty falha no ARM64, use versão 0.0.11 ou Docker sandbox

### 🔧 **Compilação node-pty para ARM64**

```bash
# Instalar dependências de compilação
pkg install python clang make pkg-config libffi openssl

# Instalar node-gyp globalmente
npm install -g node-gyp

# Compilar node-pty especificamente para ARM64
cd /data/data/com.termux/files/usr/tmp
git clone https://github.com/microsoft/node-pty.git
cd node-pty

# Configurar para arquitetura ARM64
export npm_config_arch=arm64
export npm_config_platform=android

# Compilar e instalar
npm install
npm run build
npm link

# Verificar instalação
node -e "console.log(require('node-pty').spawn)"
```

**Solução alternativa (mais simples):**
```bash
# Usar versão pré-compilada se disponível
npm install node-pty@0.10.1 --target_arch=arm64
```

- Alternativa: usar Docker: docker run --rm -it ghcr.io/qwenlm/qwen-code:0.0.11
- Ou proot para simular ambiente Linux completo

## Exemplos de uso (snippets prontos)

1. Chamar modelo de chat:

   ```bash
   qwen chat --model qwen-1 --prompt "Escreva um resumo sobre Termux" --api-key "$QWEN_API_KEY"
   ```

2. Gerar completions via stdin:

   ```bash
   echo "Explique Playwright no Android" | qwen complete --model qwen-instruct --api-key "$QWEN_API_KEY"
   ```

3. Configuração rápida via JSON:

   ```json
   {
     "apiKey": "YOUR_QWEN_API_KEY",
     "defaultModel": "qwen-1",
     "timeout": 30000
   }
   ```

## Próximos passos

- Vou pesquisar a documentação oficial e checar a compatibilidade ARM64, permissões e examples reais.
- Adicionar integração com Memory MCP e exemplos de automação.

---

## 🚀 **Roadmap de Instalação - Status Atual**

### ✅ **Componentes Verificados no Ambiente**

| Componente | Status | Versão Detectada | Localização |
|------------|--------|------------------|-------------|
| **Node.js** | ✅ Instalado | v24.9.0 | `/data/data/com.termux/files/usr/bin/node` |
| **npm** | ⚠️ Instalado mas com problemas | - | Links simbólicos quebrados |
| **Qwen CLI** | ✅ **Instalado e Funcional** | - | `@qwen-code/qwen-code` |
| **node-pty** | ❌ Não instalado | - | Requer compilação ARM64 |
| **Python** | ❌ Não instalado | - | Precisa instalar via pkg |
| **Git** | ✅ Instalado (PC) | 2.51.2 | `/usr/bin/git` |

### 🔧 **Próximos Passos para Instalação Completa**

1. **Corrigir npm (links simbólicos):**

   ```bash
   # Os links simbólicos estão quebrados, pode precisar reinstalar
   npm install -g npm
   ```

2. **Compilar node-pty para ARM64:**
   - Seguir instruções de compilação acima
   - Testar com `node -e "require('node-pty')"`

3. **Instalar Python:**

   ```bash
   pkg install python
   ```

4. **Configurar API Key:**

   ```bash
   export QWEN_API_KEY="your_key_here"
   ```

5. **Testar Qwen CLI:**

   ```bash
   node /data/data/com.termux/files/usr/lib/node_modules/@qwen-code/qwen-code/cli.js --help
   ```

### 📊 **Compatibilidade com UFFM**

- **Status:** 🔍 **Não verificado** - UFFM não detectada no ambiente
- **Potencial:** Médio - Qwen pode ser compatível com frameworks universais
- **Integração:** Requer testes específicos com UFFM

---

**🎯 Status Geral**: Qwen CLI instalado e funcional, mas npm tem problemas de links simbólicos e node-pty precisa ser compilado para ARM64.
