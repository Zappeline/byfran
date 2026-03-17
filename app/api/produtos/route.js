import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

const dataPath = join(process.cwd(), 'data', 'produtos.json');

async function getProdutos() {
  try {
    const data = await readFile(dataPath, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function saveProdutos(produtos) {
  await writeFile(dataPath, JSON.stringify(produtos, null, 2));
}

export async function GET() {
  const produtos = await getProdutos();
  return Response.json(produtos);
}

export async function POST(request) {
  const novoProduto = await request.json();
  const produtos = await getProdutos();
  novoProduto.id = produtos.length > 0 ? Math.max(...produtos.map(p => p.id)) + 1 : 1;
  produtos.push(novoProduto);
  await saveProdutos(produtos);
  return Response.json(novoProduto);
}

export async function PUT(request) {
  const produtoAtualizado = await request.json();
  let produtos = await getProdutos();
  produtos = produtos.map(p => p.id === produtoAtualizado.id ? produtoAtualizado : p);
  await saveProdutos(produtos);
  return Response.json(produtoAtualizado);
}

export async function DELETE(request) {
  const { id } = await request.json();
  let produtos = await getProdutos();
  produtos = produtos.filter(p => p.id !== id);
  await saveProdutos(produtos);
  return Response.json({ success: true });
}
