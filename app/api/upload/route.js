import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request) {
  const formData = await request.formData();
  const file = formData.get('file');
  
  if (!file) {
    return Response.json({ error: 'Nenhum arquivo enviado' }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder: 'byfran-produtos' },
      (error, result) => {
        if (error) {
          reject(Response.json({ error: 'Erro ao fazer upload' }, { status: 500 }));
        } else {
          resolve(Response.json({ url: result.secure_url }));
        }
      }
    ).end(buffer);
  });
}
