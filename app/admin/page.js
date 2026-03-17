'use client';
import { useState, useEffect } from 'react';
import './admin.css';

export default function Admin() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [produtos, setProdutos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProduto, setEditingProduto] = useState(null);
  const [formData, setFormData] = useState({ nome: '', preco: '', descricao: '', imagens: [''], categoria: [] });
  const [novaImagem, setNovaImagem] = useState('');

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const produto = {
      ...formData,
      preco: parseFloat(formData.preco),
      imagens: formData.imagens.filter(img => img.trim() !== ''),
      imagem: formData.imagens.find(img => img.trim() !== '') || ''
    };

    if (editingProduto) {
      produto.id = editingProduto.id;
      await fetch('/api/produtos', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(produto) });
    } else {
      await fetch('/api/produtos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(produto) });
    }

    setShowModal(false);
    setEditingProduto(null);
    setFormData({ nome: '', preco: '', descricao: '', imagens: [''], categoria: [] });
    loadProdutos();
  };

  const handleEdit = (produto) => {
    setEditingProduto(produto);
    setFormData({
      ...produto,
      imagens: produto.imagens?.length ? produto.imagens : produto.imagem ? [produto.imagem] : [''],
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
    setFormData({ nome: '', preco: '', descricao: '', imagens: [''], categoria: [] });
    setShowModal(true);
  };

  const adicionarImagem = () => {
    setFormData({ ...formData, imagens: [...formData.imagens, ''] });
  };

  const removerImagem = (index) => {
    const novas = formData.imagens.filter((_, i) => i !== index);
    setFormData({ ...formData, imagens: novas.length ? novas : [''] });
  };

  const atualizarImagem = (index, valor) => {
    const novas = [...formData.imagens];
    novas[index] = valor;
    setFormData({ ...formData, imagens: novas });
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
        <h1>📦 Gerenciar Produtos</h1>
        <button className="btn-logout" onClick={() => setAuthenticated(false)}>Sair</button>
      </div>

      <button className="btn-add" onClick={handleAdd}>➕ Adicionar Produto</button>

      <div className="produtos-list">
        {produtos.map(produto => (
          <div key={produto.id} className="produto-item">
            <img src={produto.imagem} alt={produto.nome} className="produto-img" />
            <div className="produto-info">
              <h3>{produto.nome}</h3>
              <p><strong>{Array.isArray(produto.categoria) ? produto.categoria.map(c => c.charAt(0).toUpperCase() + c.slice(1)).join(' + ') : produto.categoria}</strong></p>
              <p>{produto.descricao}</p>
              <p className="produto-preco">R$ {produto.preco.toFixed(2)}</p>
              {produto.imagens?.length > 1 && <p style={{fontSize: '0.8rem', color: '#999'}}>{produto.imagens.length} fotos</p>}
            </div>
            <div className="produto-actions">
              <button className="btn-edit" onClick={() => handleEdit(produto)}>✏️ Editar</button>
              <button className="btn-delete" onClick={() => handleDelete(produto.id)}>🗑️ Excluir</button>
            </div>
          </div>
        ))}
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
                <label>Nome do Produto</label>
                <input type="text" value={formData.nome} onChange={(e) => setFormData({...formData, nome: e.target.value})} required />
              </div>

              <div className="form-group">
                <label>Preço (R$)</label>
                <input type="number" step="0.01" value={formData.preco} onChange={(e) => setFormData({...formData, preco: e.target.value})} required />
              </div>

              <div className="form-group">
                <label>Descrição</label>
                <textarea value={formData.descricao} onChange={(e) => setFormData({...formData, descricao: e.target.value})} required />
              </div>

              <div className="form-group">
                <label>Fotos (URLs)</label>
                <small style={{color: '#666', fontSize: '0.85rem', display: 'block', marginBottom: '10px'}}>
                  📌 Use PostImages.org → Copie o "Direct link"
                </small>
                {formData.imagens.map((img, index) => (
                  <div key={index} className="imagem-input-row">
                    <input
                      type="url"
                      placeholder="https://i.postimg.cc/exemplo/foto.jpg"
                      value={img}
                      onChange={(e) => atualizarImagem(index, e.target.value)}
                    />
                    {img && <img src={img} alt="preview" className="preview-thumb" onError={(e) => e.target.style.display='none'} />}
                    {formData.imagens.length > 1 && (
                      <button type="button" className="btn-remove-img" onClick={() => removerImagem(index)}>✕</button>
                    )}
                  </div>
                ))}
                <button type="button" className="btn-add-img" onClick={adicionarImagem}>
                  + Adicionar outra foto
                </button>
              </div>

              <div className="modal-actions">
                <button type="submit" className="btn-save">💾 Salvar</button>
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>❌ Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
