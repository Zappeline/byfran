import clientPromise from '@/lib/mongodb';

async function getCollection() {
  const client = await clientPromise;
  return client.db('byfran').collection('produtos');
}

export async function GET() {
  const col = await getCollection();
  const produtos = await col.find({}).toArray();
  return Response.json(produtos.map(({ _id, ...p }) => p));
}

export async function POST(request) {
  const col = await getCollection();
  const produto = await request.json();

  const last = await col.find({}).sort({ id: -1 }).limit(1).toArray();
  produto.id = last.length > 0 ? last[0].id + 1 : 1;

  await col.insertOne(produto);
  const { _id, ...result } = produto;
  return Response.json(result);
}

export async function PUT(request) {
  const col = await getCollection();
  const produto = await request.json();
  const { _id, ...data } = produto;

  await col.updateOne({ id: data.id }, { $set: data });
  return Response.json(data);
}

export async function DELETE(request) {
  const col = await getCollection();
  const { id } = await request.json();

  await col.deleteOne({ id });
  return Response.json({ success: true });
}
