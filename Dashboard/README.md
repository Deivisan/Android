# 🚀 Dashboard Android 16 - Setup Guide

## 📋 Visão Geral

Dashboard universal para monitoramento e controle de dispositivos Android via ADB e SSH (Termux).  
Compatível com **Windows** e **Linux**.

### ✨ Features Principais
- 📱 Monitor amento em tempo real (bateria, RAM, CPU)
- 🔗 Conexão via ADB + SSH (Termux)
- 📸 Termux:API integration (câmera, sensores, clipboard, mídia)
- 🌐 Interface React moderna com glassmorphism
- 🔄 Socket.IO para comunicação real-time

---

## 🔧 Pré-requisitos

### Windows
- ✅ Node.js v24+ instalado
- ✅ Platform Tools (ADB)
- ✅ SSH key configurada
- ✅ Dispositivo Android com Termux

### Linux
- ✅ Node.js v24+
- ✅ adb (android-tools)
- ✅ SSH key configurada
- ✅ Dispositivo Android com Termux

---

## 📦 Instalação

### 1. Clone o Repositório

```bash
git clone https://github.com/Deivisan/Android.git
cd Android/Dashboard
```

### 2. Configurar Environment Variables

#### Windows:
```powershell
# Copiar templates
copy .env.example .env
copy server\.env.example server\.env
copy client\.env.example client\.env

# Editar server/.env com suas configurações
```

#### Linux:
```bash
cp .env.example .env
cp server/.env.example server/.env
cp client/.env.example client/.env
```

### 3. Instalar Dependências

```bash
cd server && npm install
cd ../client && npm install
```

### 4. Configurar SSH Key

```bash
# Gerar chave (Windows):
ssh-keygen -t ed25519 -C "PC-to-Termux" -f C:\Users\T08828702540\.ssh\id_termux_nopass -N ""

# Gerar chave (Linux):
ssh-keygen -t ed25519 -C "PC-to-Termux" -f ~/.ssh/id_termux_nopass -N ""

# Copiar chave pública para Termux via ADB
```

### 5. ADB Port Forwarding

```bash
adb forward tcp:8022 tcp:8022
```

---

## 🚀 Executar

### Server
```bash
cd server
node index.js
```

### Client
```bash
cd client
npm run dev
```

Acesse: http://localhost:5173

---

## 📚 Documentação Completa

Ver SETUP_FULL.md para guia detalhado com troubleshooting.
