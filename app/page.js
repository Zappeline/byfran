'use client';
import { useEffect, useState } from 'react';
import './globals.css';

function CardCarrossel({ produto, onExpandir }) {
  const imgs = produto.imagens?.length ? produto.imagens : produto.imagem ? [produto.imagem] : [];
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (imgs.length <= 1) return;
    const timer = setInterval(() => setIdx(i => (i + 1) % imgs.length), 4000);
    return () => clearInterval(timer);
  }, [imgs.length]);

  if (!imgs.length) return <div className="image-placeholder"><span>📸</span></div>;

  return (
    <div className="produto-imagem-container">
      <img
        src={imgs[idx]}
        alt={produto.nome}
        className="produto-imagem"
        onClick={() => onExpandir({ imgs, idx })}
        onError={(e) => e.target.style.display='none'}
      />
      {imgs.length > 1 && (
        <>
          <button className="carrossel-btn prev" onClick={(e) => { e.stopPropagation(); setIdx((idx - 1 + imgs.length) % imgs.length); }}>‹</button>
          <button className="carrossel-btn next" onClick={(e) => { e.stopPropagation(); setIdx((idx + 1) % imgs.length); }}>›</button>
          <div className="carrossel-dots">
            {imgs.map((_, i) => <span key={i} className={`dot ${i === idx ? 'ativo' : ''}`} onClick={(e) => { e.stopPropagation(); setIdx(i); }} />)}
          </div>
        </>
      )}
      <button className="btn-expandir" onClick={() => onExpandir({ imgs, idx })} title="Ver imagem ampliada">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
        </svg>
      </button>
    </div>
  );
}

export default function Home() {
  const [produtos, setProdutos] = useState([]);
  const [categoriaAtiva, setCategoriaAtiva] = useState('todos');
  const [imagemModal, setImagemModal] = useState(null);
  const [modalIdx, setModalIdx] = useState(0);
  const [produtoModal, setProdutoModal] = useState(null);
  const [menuAberto, setMenuAberto] = useState(false);
  const [filtroAberto, setFiltroAberto] = useState(false);
  const [precoAberto, setPrecoAberto] = useState(false);
  const [ordemPreco, setOrdemPreco] = useState(null);
  const [carrinho, setCarrinho] = useState([]);
  const [carrinhoAberto, setCarrinhoAberto] = useState(false);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const produtosPorPagina = 10;
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_CATALOGO;

  const obterPrecoAtual = (produto) => produto.precoDesconto != null && produto.precoDesconto < produto.preco ? produto.precoDesconto : produto.preco;
  const obterDescontoPercentual = (produto) => {
    if (!produto.precoDesconto || produto.precoDesconto >= produto.preco) return 0;
    return Math.round((1 - produto.precoDesconto / produto.preco) * 100);
  };

  const adicionarCarrinho = (produto) => {
    setCarrinho(prev => prev.find(p => p.id === produto.id) ? prev : [...prev, produto]);
  };

  const removerCarrinho = (id) => setCarrinho(prev => prev.filter(p => p.id !== id));

  const handleInteresseCarrinho = () => {
    const lista = carrinho.map(p => {
      const precoAtual = obterPrecoAtual(p);
      const precoTexto = p.precoDesconto != null && p.precoDesconto < p.preco
        ? `De ~*R$ ${p.preco.toFixed(2)}*~ / Por *R$ ${p.precoDesconto.toFixed(2)}*`
        : `*R$ ${p.preco.toFixed(2)}*`;
      return `*${p.nome}*\n${p.descricao}\n${precoTexto}`;
    }).join('\n\n');
    const total = carrinho.reduce((s, p) => s + obterPrecoAtual(p), 0);
    const mensagem = `Olá! Tenho interesse nos produtos:\n\n${lista}\n\n*Total: R$ ${total.toFixed(2)}*`;
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(mensagem)}`, '_blank');
  };

  useEffect(() => {
    fetch('/api/produtos')
      .then(res => res.json())
      .then(data => setProdutos(data));
  }, []);

  const handleInteresse = (produto) => {
    const precoTexto = produto.precoDesconto != null && produto.precoDesconto < produto.preco
      ? `De ~*R$ ${produto.preco.toFixed(2)}*~ / Por *R$ ${produto.precoDesconto.toFixed(2)}*`
      : `*R$ ${produto.preco.toFixed(2)}*`;
    const statusTexto = produto.esgotado ? '\n\n*Produto esgotado - Avise quando estiver disponível*' : '';
    const mensagem = `Olá! Tenho interesse no produto:\n\n*${produto.nome}*\n${produto.descricao}${statusTexto}\n\n${precoTexto}`;
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(mensagem)}`, '_blank');
  };

  const selecionarCategoria = (cat) => {
    setCategoriaAtiva(cat);
    setMenuAberto(false);
    setFiltroAberto(false);
    setPrecoAberto(false);
    setPaginaAtual(1);
  };

  const selecionarOrdem = (ordem) => {
    setOrdemPreco(ordem);
    setMenuAberto(false);
    setFiltroAberto(false);
    setPrecoAberto(false);
    setPaginaAtual(1);
  };

  const produtosFiltrados = produtos
    .filter(p => {
      if (categoriaAtiva === 'todos') return true;
      if (categoriaAtiva === 'mais vendidos') return p.maisVendido === true;
      if (categoriaAtiva === 'descontos') return p.precoDesconto != null && p.precoDesconto < p.preco;
      const cats = Array.isArray(p.categoria) ? p.categoria : [p.categoria];
      return cats.includes(categoriaAtiva);
    })
    .sort((a, b) => {
      const precoA = obterPrecoAtual(a);
      const precoB = obterPrecoAtual(b);
      if (ordemPreco === 'asc') return precoA - precoB;
      if (ordemPreco === 'desc') return precoB - precoA;
      return 0;
    });

  const totalPaginas = Math.ceil(produtosFiltrados.length / produtosPorPagina);
  const produtosPaginados = produtosFiltrados.slice((paginaAtual - 1) * produtosPorPagina, paginaAtual * produtosPorPagina);

  const categorias = ['todos', 'pulseira', 'colar', 'anel', 'brinco', 'mais vendidos', 'descontos'];

  return (
    <>
      <header>
        <button className="hamburger" onClick={() => { setMenuAberto(!menuAberto); setFiltroAberto(false); }}>
          <span></span><span></span><span></span>
        </button>
        <div className="header-logo">
          <img src="/logo.png" alt="By Fran" onError={(e) => e.target.style.display='none'} />
        </div>
        <button className="btn-carrinho" onClick={() => setCarrinhoAberto(true)}>
          🛒
          {carrinho.length > 0 && <span className="carrinho-count">{carrinho.length}</span>}
        </button>
      </header>

      {menuAberto && (
        <div className="menu-dropdown">
          <div className="menu-item" onClick={() => { setFiltroAberto(!filtroAberto); setPrecoAberto(false); }}>
            <span>Filtrar por Categoria</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </div>
          {filtroAberto && (
            <div className="submenu">
              {categorias.map(cat => (
                <div
                  key={cat}
                  className={`submenu-item ${categoriaAtiva === cat ? 'ativo' : ''}`}
                  onClick={() => selecionarCategoria(cat)}
                >
                  {cat === 'todos' ? 'Todos' : cat === 'mais vendidos' ? '★ Mais Vendidos' : cat === 'descontos' ? 'Descontos' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                  {categoriaAtiva === cat && <span>✓</span>}
                </div>
              ))}
            </div>
          )}
          <div className="menu-item" onClick={() => { setPrecoAberto(!precoAberto); setFiltroAberto(false); }}>
            <span>Filtrar por Preço</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </div>
          {precoAberto && (
            <div className="submenu">
              <div
                className={`submenu-item ${ordemPreco === 'asc' ? 'ativo' : ''}`}
                onClick={() => selecionarOrdem(ordemPreco === 'asc' ? null : 'asc')}
              >
                Menor preço primeiro
                {ordemPreco === 'asc' && <span>✓</span>}
              </div>
              <div
                className={`submenu-item ${ordemPreco === 'desc' ? 'ativo' : ''}`}
                onClick={() => selecionarOrdem(ordemPreco === 'desc' ? null : 'desc')}
              >
                Maior preço primeiro
                {ordemPreco === 'desc' && <span>✓</span>}
              </div>
            </div>
          )}
        </div>
      )}

      {menuAberto && <div className="menu-overlay" onClick={() => setMenuAberto(false)} />}

      <div className="banner">
        <img src="/banner.png" alt="By Fran Acessórios" onError={(e) => e.target.parentElement.style.display='none'} />
      </div>

      <div className="banner-texto">
        <p>Não é sobre aparência.<br />é sobre se sentir bem!</p>
        <div className="filtro-botoes">
          {categorias.map(cat => (
            <button
              key={cat}
              className={`btn-filtro ${categoriaAtiva === cat ? 'ativo' : ''}`}
              onClick={() => setCategoriaAtiva(cat)}
            >
              {cat === 'todos' ? 'Todos' : cat === 'mais vendidos' ? '★ Mais Vendidos' : cat === 'descontos' ? 'Descontos' : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="container">
        {(categoriaAtiva !== 'todos' || ordemPreco) && (
          <div className="filtro-ativo">
            {categoriaAtiva !== 'todos' && <span>Categoria: <strong>{categoriaAtiva === 'mais vendidos' ? '★ Mais Vendidos' : categoriaAtiva === 'descontos' ? 'Descontos' : categoriaAtiva.charAt(0).toUpperCase() + categoriaAtiva.slice(1)}</strong></span>}
            {ordemPreco && <span style={{marginLeft: categoriaAtiva !== 'todos' ? '12px' : 0}}>Preço: <strong>{ordemPreco === 'asc' ? 'Menor primeiro' : 'Maior primeiro'}</strong></span>}
            <button className="filtro-limpar" onClick={() => { setCategoriaAtiva('todos'); setOrdemPreco(null); setPaginaAtual(1); }}>✕ Limpar</button>
          </div>
        )}
        <main className="grid">
          {produtosPaginados.map(produto => (
            <div key={produto.id} className={`card ${produto.esgotado ? 'esgotado' : ''}`}>
              {produto.maisVendido && <div className="badge-mais-vendido">★</div>}
              {produto.esgotado && <div className="badge-esgotado">ESGOTADO</div>}
              <CardCarrossel produto={produto} onExpandir={({imgs, idx}) => { setImagemModal(imgs); setModalIdx(idx); }} />
              <div className="card-content">
                <h2>{produto.nome}</h2>
                {produto.categoria && (
                  <div style={{display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '8px'}}>
                    {(Array.isArray(produto.categoria) ? produto.categoria : [produto.categoria]).map(cat => (
                      <span key={cat} className="categoria-tag">{cat.charAt(0).toUpperCase() + cat.slice(1)}</span>
                    ))}
                  </div>
                )}
                <p className="descricao">{produto.descricao}</p>
                <div className="preco-bloco">
                  {produto.precoDesconto != null && produto.precoDesconto < produto.preco ? (
                    <>
                      <p className="preco preco-original">R$ {produto.preco.toFixed(2)}</p>
                      <p className="preco preco-promocional">R$ {produto.precoDesconto.toFixed(2)}</p>
                      <span className="badge-desconto">-{obterDescontoPercentual(produto)}%</span>
                    </>
                  ) : (
                    <p className="preco">R$ {produto.preco.toFixed(2)}</p>
                  )}
                </div>
                <div className="card-btns">
                  <button className="btn-ver-mais" onClick={() => setProdutoModal(produto)}>Ver mais</button>
                  <button className="btn-interesse" onClick={() => handleInteresse(produto)}>{produto.esgotado ? 'Avise quando estiver disponível' : '💬 Interesse'}</button>
                  <button className={`btn-carrinho-add${carrinho.find(p => p.id === produto.id) ? ' adicionado' : ''}`} onClick={() => adicionarCarrinho(produto)} disabled={produto.esgotado}>
                    {produto.esgotado ? 'Esgotado' : carrinho.find(p => p.id === produto.id) ? '✓ Adicionado' : '+ Carrinho'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </main>

        {totalPaginas > 1 && (
          <div className="paginacao">
            <button onClick={() => setPaginaAtual(p => Math.max(1, p - 1))} disabled={paginaAtual === 1}>‹ Anterior</button>
            <span>Página {paginaAtual} de {totalPaginas}</span>
            <button onClick={() => setPaginaAtual(p => Math.min(totalPaginas, p + 1))} disabled={paginaAtual === totalPaginas}>Próxima ›</button>
          </div>
        )}
      </div>

      <footer>
        <div className="footer-content">
          <a href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_FOOTER}`} target="_blank" rel="noopener noreferrer" className="whatsapp-link">
            <svg className="whatsapp-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
            Entre em contato pelo WhatsApp
          </a>
          <br />
          <a href="https://instagram.com/byfran.acessorios" target="_blank" rel="noopener noreferrer" className="instagram-link">
            <svg className="instagram-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
            @byfran.acessorios
          </a>
          <div style={{marginTop: '20px'}}>
            <a href="/admin" style={{fontSize: '0.7rem', color: '#e8e8e8', textDecoration: 'none', letterSpacing: '1px'}}>painel do administrador</a>
          </div>
        </div>
      </footer>

      {carrinhoAberto && (
        <div className="modal-imagem" onClick={() => setCarrinhoAberto(false)}>
          <div className="carrinho-modal" onClick={e => e.stopPropagation()}>
            <div className="carrinho-header">
              <h2>🛒 Carrinho</h2>
              <button className="modal-close-btn" onClick={() => setCarrinhoAberto(false)}>✕</button>
            </div>
            {carrinho.length === 0 ? (
              <p className="carrinho-vazio">Nenhum produto adicionado.</p>
            ) : (
              <>
                <div className="carrinho-lista">
                  {carrinho.map(p => (
                    <div key={p.id} className="carrinho-item">
                      {p.imagem && <img src={p.imagem} alt={p.nome} className="carrinho-thumb" />}
                      <div className="carrinho-info">
                        <strong>{p.nome}</strong>
                        <span>R$ {obterPrecoAtual(p).toFixed(2)}</span>
                      </div>
                      <button className="btn-remover" onClick={() => removerCarrinho(p.id)}>✕</button>
                    </div>
                  ))}
                </div>
                <div className="carrinho-total">
                  <span>Total:</span>
                  <strong>R$ {carrinho.reduce((s, p) => s + obterPrecoAtual(p), 0).toFixed(2)}</strong>
                </div>
                <button className="btn-interesse-carrinho" onClick={handleInteresseCarrinho}>
                  💬 Tenho Interesse — Enviar pelo WhatsApp
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {produtoModal && (
        <div className="modal-imagem" onClick={() => setProdutoModal(null)}>
          <div className="produto-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close-btn produto-modal-close" onClick={() => setProdutoModal(null)}>✕</button>
            <div className="produto-modal-imgs">
              {(produtoModal.imagens?.length ? produtoModal.imagens : produtoModal.imagem ? [produtoModal.imagem] : []).map((img, i) => (
                <img key={i} src={img} alt={produtoModal.nome} />
              ))}
            </div>
            <div className="produto-modal-info">
              {produtoModal.maisVendido && <span className="badge-mais-vendido" style={{position:'static', marginBottom:'12px', display:'inline-flex'}}>★ Mais Vendido</span>}
              <h2>{produtoModal.nome}</h2>
              {produtoModal.categoria && (
                <div style={{display:'flex', gap:'4px', flexWrap:'wrap', margin:'8px 0'}}>
                  {(Array.isArray(produtoModal.categoria) ? produtoModal.categoria : [produtoModal.categoria]).map(cat => (
                    <span key={cat} className="categoria-tag">{cat.charAt(0).toUpperCase() + cat.slice(1)}</span>
                  ))}
                </div>
              )}
              <p className="produto-modal-descricao">{produtoModal.descricao}</p>
              {produtoModal.qualidade && (
                <div className="produto-modal-qualidade">
                  <strong>Qualidade da peça:</strong>
                  <p>{produtoModal.qualidade}</p>
                </div>
              )}
              {produtoModal.cuidados && (
                <div className="produto-modal-cuidados">
                  <strong>Cuidados com a peça:</strong>
                  <p>{produtoModal.cuidados}</p>
                </div>
              )}
              <div className="preco-bloco" style={{margin:'16px 0'}}>
                {produtoModal.precoDesconto != null && produtoModal.precoDesconto < produtoModal.preco ? (
                  <>
                    <p className="preco preco-original">R$ {produtoModal.preco.toFixed(2)}</p>
                    <p className="preco preco-promocional">R$ {produtoModal.precoDesconto.toFixed(2)}</p>
                    <span className="badge-desconto">-{obterDescontoPercentual(produtoModal)}%</span>
                  </>
                ) : (
                  <p className="preco">R$ {produtoModal.preco.toFixed(2)}</p>
                )}
              </div>
              <div className="card-btns">
                <button className="btn-interesse" onClick={() => { handleInteresse(produtoModal); setProdutoModal(null); }}>{produtoModal.esgotado ? 'Avise quando estiver disponível' : '💬 Interesse'}</button>
                <button className={`btn-carrinho-add${carrinho.find(p => p.id === produtoModal.id) ? ' adicionado' : ''}`} onClick={() => adicionarCarrinho(produtoModal)} disabled={produtoModal.esgotado}>
                  {produtoModal.esgotado ? 'Esgotado' : carrinho.find(p => p.id === produtoModal.id) ? '✓ Adicionado' : '+ Carrinho'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {imagemModal && (
        <div className="modal-imagem" onClick={() => setImagemModal(null)}>
          <span className="modal-close" onClick={() => setImagemModal(null)}>&times;</span>
          {imagemModal.length > 1 && (
            <>
              <button className="modal-nav prev" onClick={(e) => { e.stopPropagation(); setModalIdx((modalIdx - 1 + imagemModal.length) % imagemModal.length); }}>‹</button>
              <button className="modal-nav next" onClick={(e) => { e.stopPropagation(); setModalIdx((modalIdx + 1) % imagemModal.length); }}>›</button>
            </>
          )}
          <img src={imagemModal[modalIdx]} alt="Visualização ampliada" onClick={(e) => e.stopPropagation()} />
          {imagemModal.length > 1 && (
            <div className="modal-dots">
              {imagemModal.map((_, i) => <span key={i} className={`dot ${i === modalIdx ? 'ativo' : ''}`} onClick={(e) => { e.stopPropagation(); setModalIdx(i); }} />)}
            </div>
          )}
        </div>
      )}
    </>
  );
}