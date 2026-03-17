# Catálogo de Acessórios

Catálogo online de acessórios com integração ao WhatsApp.

## 🚀 Como usar

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar WhatsApp
Edite o arquivo `app/page.js` e altere o número do WhatsApp na linha 7:
```javascript
const whatsappNumber = '5511999999999'; // Formato: 55 + DDD + número
```

### 3. Adicionar produtos
Edite o arquivo `app/api/produtos/route.js` para adicionar seus produtos.

### 4. Rodar localmente
```bash
npm run dev
```
Acesse: http://localhost:3000

### 5. Deploy no Vercel
1. Crie uma conta em https://vercel.com
2. Instale o Vercel CLI: `npm i -g vercel`
3. Execute: `vercel`
4. Siga as instruções

Ou conecte seu repositório GitHub diretamente no painel do Vercel.

## 📝 Personalização

- **Produtos**: Acesse http://localhost:3000/admin (senha configurada no .env.local)
- **Imagens**: Use PostImages.org e copie o "Direct link"
- **Cores**: Edite `app/globals.css`
- **Textos**: Edite `app/page.js`
- **WhatsApp**: Altere o número em `app/page.js` linha 7
