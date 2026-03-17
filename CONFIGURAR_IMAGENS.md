# Como Configurar Upload de Imagens

## Problema
O Vercel não permite salvar arquivos permanentemente no servidor. As imagens enviadas são perdidas após o deploy.

## Solução: Cloudinary (Gratuito)

### Passo 1: Criar conta no Cloudinary
1. Acesse: https://cloudinary.com/users/register/free
2. Crie uma conta gratuita
3. Após login, você verá o Dashboard

### Passo 2: Pegar as credenciais
No Dashboard do Cloudinary, você verá:
- **Cloud Name** (exemplo: dxyz123abc)
- **API Key** (exemplo: 123456789012345)
- **API Secret** (clique em "Reveal" para ver)

### Passo 3: Configurar no projeto
Abra o arquivo `.env.local` e preencha:

```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=seu_cloud_name_aqui
CLOUDINARY_API_KEY=sua_api_key_aqui
CLOUDINARY_API_SECRET=seu_api_secret_aqui
```

### Passo 4: Instalar dependências
```bash
npm install
```

### Passo 5: Testar localmente
```bash
npm run dev
```

Acesse http://localhost:3000/admin e teste o upload de imagens.

### Passo 6: Deploy no Vercel
No painel do Vercel, adicione as variáveis de ambiente:
1. Vá em Settings > Environment Variables
2. Adicione as 3 variáveis:
   - `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`

## Plano Gratuito do Cloudinary
- 25 GB de armazenamento
- 25 GB de banda mensal
- Mais que suficiente para um catálogo de produtos

## Alternativa Simples (Sem código)
Se preferir não usar Cloudinary, você pode:
1. Hospedar imagens no Google Drive ou Imgur
2. Copiar o link direto da imagem
3. Colar o link no campo "Imagem" ao adicionar produto
