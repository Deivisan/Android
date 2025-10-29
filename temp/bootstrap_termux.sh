#!/usr/bin/env bash
# bootstrap_termux.sh — helpers para criar .env.gpg e unit examples (Termux)
# Uso: bash bootstrap_termux.sh --setup-env

set -euo pipefail

ENV_DIR="$HOME/.config/windsurf"
ENV_FILE="$ENV_DIR/.env"
GPG_FILE="$ENV_DIR/.env.gpg"
PASSPHRASE_FILE="$ENV_DIR/.env.passphrase"

mkdir -p "$ENV_DIR"
chmod 700 "$ENV_DIR"

function create_env_template() {
  cat > "$ENV_FILE" <<'EOF'
# EXEMPLO: Substitua pelos seus valores reais
GOOGLE_API_KEY=YOUR_GOOGLE_API_KEY
OPENROUTER_API_KEY=YOUR_OPENROUTER_API_KEY
GITHUB_PERSONAL_ACCESS_TOKEN=YOUR_GITHUB_TOKEN
TAVILY_API_KEY=YOUR_TAVILY_KEY
N8N_BASE_URL=http://localhost:5678
EOF
  chmod 600 "$ENV_FILE"
  echo "Arquivo de template criado: $ENV_FILE"
}

function encrypt_env() {
  if [[ ! -f "$ENV_FILE" ]]; then
    echo "Arquivo $ENV_FILE não existe. Rode --setup-env primeiro." >&2
    exit 1
  fi
  if [[ ! -f "$PASSPHRASE_FILE" ]]; then
    echo "Gerando passphrase aleatória..."
    head -c 32 /dev/urandom | base64 > "$PASSPHRASE_FILE"
    chmod 600 "$PASSPHRASE_FILE"
  fi
  gpg --symmetric --cipher-algo AES256 --batch --passphrase-file "$PASSPHRASE_FILE" -o "$GPG_FILE" "$ENV_FILE"
  chmod 600 "$GPG_FILE"
  echo "Arquivo encriptado criado: $GPG_FILE"
}

function decrypt_env() {
  if [[ ! -f "$GPG_FILE" ]]; then
    echo "Arquivo $GPG_FILE não encontrado." >&2
    exit 1
  fi
  gpg --quiet --batch --decrypt --passphrase-file "$PASSPHRASE_FILE" -o "$ENV_FILE" "$GPG_FILE"
  chmod 600 "$ENV_FILE"
  echo "Arquivo de ambiente decriptado em: $ENV_FILE"
}

case "${1:-}" in
  --setup-env)
    create_env_template
    encrypt_env
    ;;
  --decrypt)
    decrypt_env
    ;;
  --help|*)
    cat <<'HELP'
Uso: bootstrap_termux.sh [--setup-env | --decrypt | --help]
  --setup-env   -> cria template .env, gera passphrase e cria .env.gpg
  --decrypt     -> decripta .env.gpg para .env usando passphrase salvo
  --help        -> mostra esta ajuda
HELP
    ;;
esac
