export async function POST(request) {
  const { password } = await request.json();
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  
  if (password === adminPassword) {
    return Response.json({ success: true });
  }
  
  return Response.json({ success: false }, { status: 401 });
}
