# Playwright no Android/Termux — Guia prático

## Visão geral
Automação com Playwright em Android/Termux não é trivial — Playwright tem binários de browsers e dependências nativas. Aqui documentamos estratégias: usar Playwright remoto, headless Chromium via termux-chroot/xvfb, ou usar WebKit/Chromium embutido.

## Estratégias viáveis
1. Playwright remoto: rodar Playwright em servidor remoto (VPS/colab) e controlar via API/SSH.
2. Headless Chromium local: instalar Chromium no Termux (via apt/pkg ou proot) e usar Playwright com `PWDEBUG=0`.
3. Browserless/Playwright-cloud: usar um serviço remoto (browserless.io ou self-hosted) e chamar via API.

## Notas Termux (ARM64)
- Chromium/Chromium-browser pode não estar disponível facilmente; usar `pkg install chromium` quando disponível.
- Alternativa: usar `playwright` apenas como cliente, apontando para um navegador remoto via WS endpoint.
- Permissões: network, storage

## Exemplo 1 — Playwright remoto (mais simples no Android)
```bash
# Start server (remoto)
# Na máquina remota
npx playwright run-server --port 9222

# No Termux (cliente)
playwright connect ws://meu-servidor:9222
```

## Exemplo 2 — Headless Chromium local (hipotético)
```bash
pkg install chromium
npm install -g playwright
# Forçar uso do chromium local
PLAYWRIGHT_BROWSERS_PATH=0 npx playwright install --with-deps chromium
```

## Exemplo 3 — Usar Browserless (API)
```bash
curl -X POST https://browserless.example/api/execute -d '{"script":"..."}'
```

## Próximos passos
- Testar em seu dispositivo ARM64 e coletar logs de falhas; prefiro configurar um servidor Playwright remoto e controlar pelo Termux.
