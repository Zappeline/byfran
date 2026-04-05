'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import './admin.css';

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

export default function Admin() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [produtos, setProdutos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProduto, setEditingProduto] = useState(null);
  const [formData, setFormData] = useState({ nome: '', preco: '', precoDesconto: '', descricao: '', qualidade: '', cuidados: '', imagens: [], categoria: [], maisVendido: false });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (authenticated) loadProdutos();
  }, [authenticated]);

  const loadProdutos = async () => {
    const res = await fetch('/api/produtos');
    const data = await res.json();
    setProdutos(data);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    if (res.ok) { setAuthenticated(true); setError(''); }
    else setError('Senha incorreta!');
  };

  const handleLogout = () => {
    setAuthenticated(false);
    router.push('/');
  };

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    const urls = [];
    for (const file of files) {
      const data = new FormData();
      data.append('file', file);
      data.append('upload_preset', UPLOAD_PRESET);
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: 'POST', body: data });
      const json = await res.json();
      if (json.secure_url) urls.push(json.secure_url);
    }
    setFormData(prev => ({ ...prev, imagens: [...prev.imagens, ...urls] }));
    setUploading(false);
  };

  const removerImagem = (index) => {
    setFormData(prev => ({ ...prev, imagens: prev.imagens.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const precoDesconto = formData.precoDesconto !== '' ? parseFloat(formData.precoDesconto) : undefined;
    const produto = {
      ...formData,
      preco: parseFloat(formData.preco),
      precoDesconto: Number.isFinite(precoDesconto) ? precoDesconto : undefined,
      imagem: formData.imagens[0] || ''
    };
    if (editingProduto) {
      produto.id = editingProduto.id;
      await fetch('/api/produtos', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(produto) });
    } else {
      await fetch('/api/produtos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(produto) });
    }
    setShowModal(false);
    setEditingProduto(null);
    setFormData({ nome: '', preco: '', precoDesconto: '', descricao: '', qualidade: '', cuidados: '', imagens: [], categoria: [], maisVendido: false });
    loadProdutos();
  };

  const handleEdit = (produto) => {
    setEditingProduto(produto);
    setFormData({
      ...produto,
      imagens: produto.imagens?.length ? produto.imagens : produto.imagem ? [produto.imagem] : [],
      categoria: Array.isArray(produto.categoria) ? produto.categoria : produto.categoria ? [produto.categoria] : []
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;
    await fetch('/api/produtos', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    loadProdutos();
  };

  const handleAdd = () => {
    setEditingProduto(null);
    setFormData({ nome: '', preco: '', precoDesconto: '', descricao: '', qualidade: '', cuidados: '', imagens: [], categoria: [], maisVendido: false });
    setShowModal(true);
  };

  if (!authenticated) {
    return (
      <div className="login-container">
        <div className="login-box">
          <h1>🔐 Painel Admin</h1>
          <form onSubmit={handleLogin}>
            <input type="password" placeholder="Digite a senha" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button type="submit" className="btn-login">Entrar</button>
            {error && <p className="error-msg">{error}</p>}
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>By Fran — Painel Admin</h1>
        <button className="btn-logout" onClick={handleLogout}>Sair</button>
      </div>

      <div className="admin-body">
        <div className="admin-toolbar">
          <span>{produtos.length} produto{produtos.length !== 1 ? 's' : ''}</span>
          <button className="btn-add" onClick={handleAdd}>+ Novo Produto</button>
        </div>

        <div className="produtos-list">
          {produtos.map(produto => (
            <div key={produto.id} className="produto-item">
              <img src={produto.imagem} alt={produto.nome} className="produto-img" />
              <div className="produto-info">
                <h3>{produto.nome}</h3>
                <p>{Array.isArray(produto.categoria) ? produto.categoria.map(c => c.charAt(0).toUpperCase() + c.slice(1)).join(' + ') : produto.categoria}</p>
                <p>{produto.descricao}</p>
                {produto.precoDesconto != null && produto.precoDesconto < produto.preco ? (
                  <div className="produto-preco-desconto">
                    <span className="produto-preco-original">R$ {produto.preco.toFixed(2)}</span>
                    <strong>R$ {produto.precoDesconto.toFixed(2)}</strong>
                  </div>
                ) : (
                  <p className="produto-preco">R$ {produto.preco.toFixed(2)}</p>
                )}
                {produto.imagens?.length > 1 && <p style={{fontSize: '0.8rem', color: '#999'}}>{produto.imagens.length} fotos</p>}
              </div>
              <div className="produto-actions">
                <button className="btn-edit" onClick={() => handleEdit(produto)}>Editar</button>
                <button className="btn-delete" onClick={() => handleDelete(produto.id)}>Excluir</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="modal" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingProduto ? 'Editar Produto' : 'Novo Produto'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Categoria</label>
                <div className="categorias-check">
                  {['pulseira', 'colar', 'anel', 'brinco'].map(cat => (
                    <label key={cat} className="check-label">
                      <input
                        type="checkbox"
                        checked={Array.isArray(formData.categoria) && formData.categoria.includes(cat)}
                        onChange={(e) => {
                          const atual = Array.isArray(formData.categoria) ? formData.categoria : [];
                          const nova = e.target.checked ? [...atual, cat] : atual.filter(c => c !== cat);
                          setFormData({...formData, categoria: nova});
                        }}
                      />
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="check-label" style={{cursor:'pointer'}}>
                  <input
                    type="checkbox"
                    checked={formData.maisVendido || false}
                    onChange={(e) => setFormData({...formData, maisVendido: e.target.checked})}
                  />
                  ★ Marcar como Mais Vendido
                </label>
              </div>

              <div className="form-group">
                <label>Nome do Produto</label>
                <input type="text" value={formData.nome} onChange={(e) => setFormData({...formData, nome: e.target.value})} required />
              </div>

              <div className="form-group">
                <label>Preço (R$)</label>
                <input type="number" step="0.01" value={formData.preco} onChange={(e) => setFormData({...formData, preco: e.target.value})} required />
              </div>

              <div className="form-group">
                  <label>Preço com Desconto (R$)</label>
                  <input type="number" step="0.01" value={formData.precoDesconto} onChange={(e) => setFormData({...formData, precoDesconto: e.target.value})} placeholder="Opcional" />
                  <small>Deixe em branco para desativar o desconto.</small>
                </div>

                <div className="form-group">
                <textarea value={formData.qualidade || ''} onChange={(e) => setFormData({...formData, qualidade: e.target.value})} placeholder="Ex: Material premium em aço inoxidável com banhado a ouro 18k..." />
              </div>

              <div className="form-group">
                <label>Cuidados com a peça</label>
                <textarea value={formData.cuidados || ''} onChange={(e) => setFormData({...formData, cuidados: e.target.value})} placeholder="Ex: Evite contato com água, perfumes..." />
              </div>

              <div className="form-group">
                <label>Fotos</label>
                <label className="btn-upload-foto">
                  {uploading ? '⏳ Enviando...' : '📷 Escolher fotos'}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    style={{display: 'none'}}
                    onChange={handleUpload}
                    disabled={uploading}
                  />
                </label>
                <div className="preview-grid">
                  {formData.imagens.map((img, index) => (
                    <div key={index} className="preview-item">
                      <img src={img} alt="preview" className="preview-thumb" />
                      <button type="button" className="btn-remove-img" onClick={() => removerImagem(index)}>✕</button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="modal-actions">
                <button type="submit" className="btn-save" disabled={uploading}>💾 Salvar</button>
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>❌ Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
