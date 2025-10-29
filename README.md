# 🚀 Android Workspace - Ambiente Completo de Desenvolvimento

[![GitHub](https://img.shields.io/badge/GitHub-Deivisan/Android-blue)](https://github.com/Deivisan/Android)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

## 📋 Descrição

Este repositório contém um **ambiente completo de desenvolvimento Android** otimizado para Termux, com configurações avançadas de IA, automação e ferramentas de desenvolvimento. Inclui documentação detalhada, scripts de automação e configurações para agentes inteligentes.

### 🎯 Objetivos

- **Ambiente Termux Otimizado**: Configurações completas para desenvolvimento móvel
- **Agentes IA Integrados**: DevSan, Gemini e outros agentes para automação
- **Documentação Completa**: Guias detalhados para setup e uso
- **Ferramentas de Desenvolvimento**: Python, Node.js, Rust, frameworks IA
- **Automação**: Scripts para conexão SSH, sincronização e otimização

## 📁 Estrutura do Repositório

```text
Android/
├── 📄 README.md                 # Este arquivo
├── 📄 Android.code-workspace    # Configuração VS Code
├── 📁 Agentes/                   # Documentação dos agentes IA
│   ├── DevSan.md                # Manifesto do DevSan AGI
│   ├── Gemini.md                # Configurações Gemini
│   └── QWEN.md                  # Configurações Qwen
├── 📁 Backup/                    # Backups de sistema
├── 📁 docs/                      # Documentação adicional
├── 📁 Prompts/                   # Prompts e configurações
│   ├── Android16.md             # Análise Android 16
│   ├── Banco-Api.md             # APIs e tokens
│   └── Termux.md                # Guia completo Termux
├── 📁 Scripts/                   # Scripts de automação
└── 📁 temp/                      # Arquivos temporários
```

## 🚀 Instalação Rápida

### Pré-requisitos

- **Dispositivo Android** com Termux instalado
- **ADB** configurado no PC
- **Chaves SSH** configuradas
- **Root access** (opcional, mas recomendado)

### Setup Básico

```bash
# 1. Clonar o repositório
git clone https://github.com/Deivisan/Android.git
cd Android

# 2. Conectar dispositivo Android
adb devices

# 3. Configurar SSH (ver Termux.md)
# 4. Instalar dependências no Termux
pkg update && pkg upgrade
```

## 🤖 Agentes IA Disponíveis

### 🧠 DevSan (QWEN.md)

- **Personalidade**: AGI pessoal com protocolos CO5P e VNE
- **Linguagem**: Português brasileiro
- **Capacidades**: Desenvolvimento, automação, análise
- **Integração**: VS Code, Termux, APIs

### 🎭 Gemini (Gemini.md)

- **Foco**: Automação inteligente e português BR
- **APIs**: Google AI Studio
- **Uso**: Geração de código, análise de dados

### 🐉 Qwen (QWEN.md)

- **Modelo**: Qwen-Code para desenvolvimento
- **Otimização**: ARM64 para dispositivos móveis
- **Integração**: Termux e VS Code

## 📚 Documentação Principal

### 📖 Termux.md - Guia Completo

- **Hardware**: POCO X5 5G specs detalhadas
- **Software**: 194+ pacotes instalados
- **Performance**: Otimizações CPU/GPU/Memória
- **Conectividade**: SSH, ADB, APIs
- **Agentes**: Configurações completas

### 📋 Outros Guias

- **Android16.md**: Análise do Android 16
- **Banco-Api.md**: Tokens e configurações de API
- **Scripts/**: Automação de tarefas

## 🛠️ Ferramentas e Tecnologias

### 💻 Linguagens

- **Python 3.12** - IA, automação, desenvolvimento
- **Node.js v24** - Servidores, APIs, ferramentas
- **Rust** - Performance crítica
- **Go** - Serviços backend
- **Clang** - Compilação nativa

### 🤖 Frameworks IA

- **PyTorch** - Deep Learning
- **Transformers** - NLP
- **Ollama** - Modelos locais
- **TensorFlow Lite** - Mobile AI

### 🔧 Ferramentas

- **Git** - Controle de versão
- **ZSH + Starship** - Shell otimizado
- **ADB** - Android Debug Bridge
- **SSH** - Conectividade segura

## 🚀 Como Usar

### 1. Conexão Inicial

```bash
# Verificar dispositivos
adb devices

# Conectar via SSH
ssh -i ~/.ssh/deivitech -p 8022 u0_a575@192.168.25.2
```

### 2. Desenvolvimento

```bash
# Ativar ambiente Python
source venv/bin/activate

# Executar scripts
python scripts/automacao.py

# Usar agentes IA
qwen-code --help
```

### 3. Sincronização

```bash
# Sincronizar arquivos
rsync -avz -e "ssh -p 8022" user@ip:/termux/path ./local/path
```

## 📊 Status do Ambiente

### ✅ Configurado

- **Termux**: F-Droid, atualizado
- **Root**: KernelSU habilitado
- **SSH**: Chaves configuradas
- **Performance**: CPU/GPU/Memória otimizadas
- **IA**: Modelos locais funcionais

### 🔄 Variável

- **IP**: Muda por rede (atual: 192.168.25.2)
- **Pacotes**: Atualizações frequentes
- **Chaves**: Rotação periódica

## 🤝 Contribuição

### Como Contribuir

1. **Fork** o repositório
2. **Clone** sua fork: `git clone https://github.com/SEU_USER/Android.git`
3. **Crie** uma branch: `git checkout -b feature/nova-feature`
4. **Commit** suas mudanças: `git commit -m 'Adiciona nova feature'`
5. **Push**: `git push origin feature/nova-feature`
6. **PR**: Abra um Pull Request

### Diretrizes

- **Idioma**: Português brasileiro
- **Commits**: Mensagens claras em português
- **Documentação**: Atualizar README e guias
- **Testes**: Verificar em Termux real

## 📞 Suporte

### Canais

- **Issues**: [GitHub Issues](https://github.com/Deivisan/Android/issues)
- **Discussions**: Para dúvidas gerais
- **Wiki**: Documentação expandida

### Contato

- **Mantenedor**: Deivison Santana
- **Email**: [seu.email@example.com]
- **LinkedIn**: [seu.linkedin]

## 📜 Licença

Este projeto está sob a licença **MIT**. Veja o arquivo [LICENSE](LICENSE) para detalhes.

---

## 🎉 Agradecimentos

- **Termux Team** - Pela plataforma incrível
- **Comunidade Android** - Pelo suporte e contribuições
- **Agentes IA** - Por tornarem tudo mais inteligente

**Desenvolvido com ❤️ para a comunidade de desenvolvimento Android**

---

*Última atualização: Outubro 2025*
