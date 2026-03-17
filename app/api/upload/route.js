export async function POST() {
  return Response.json({ error: 'Upload não utilizado. Use URLs externas (PostImages.org).' }, { status: 400 });
}
