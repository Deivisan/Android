# Grok Code Fast — Perfil e uso

## Visão geral
Grok Code Fast é um modelo de xAI para codificação, MoE 314B, 256K context, agentic coding.

## Instalação
- API via xAI, pricing $0.20/M input, $1.50/M output tokens.

## Modos
- Agentic coding, geração de código.

## Notas Termux
- Via API, compatível.

## Exemplos (snippets)
1) API call:
```bash
curl -X POST https://api.x.ai/v1/chat/completions \
  -H "Authorization: Bearer $XAI_API_KEY" \
  -d '{"model": "grok-code-fast-1", "messages": [{"role": "user", "content": "Write a Python function"}]}'
```

## Próximos passos
- Pesquisar documentação oficial e forma de integração com MCPs (auto-approve, safe-mode).
