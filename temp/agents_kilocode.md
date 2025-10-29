# Kilocode CLI — Perfil e uso

## Visão geral
Kilocode CLI é uma ferramenta/agent local para geração de código, baseada em Roo Code e Cline, open-source VS Code extension.

## Instalação
```bash
npm install -g @kilocode/cli
```

## Configuração
Variáveis de ambiente sugeridas:
- KILOCODE_API_KEY
- KILOCODE_CONFIG_PATH

## Notas Termux
- Requer Node.js, compatível com ARM64.
- Modos: architect, code, debug.
- Suporte a MCP servers para extensibilidade.

## Exemplos
```bash
# Modo interativo
kilocode

# Modo específico
kilocode --mode architect

# Autônomo
kilocode --auto "Implement feature X"
```

## Próximos passos
- Pesquisar documentação oficial e ajustar instruções.
