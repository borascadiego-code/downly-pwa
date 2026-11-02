
import { useMemo, useState } from 'react'
import {
  ArrowDownToLine, Clipboard, Clock3, Download, ExternalLink,
  Instagram, Link2, ShieldCheck, Sparkles, Video, X
} from 'lucide-react'

type Platform = 'Instagram' | 'Facebook' | null
type Tab = 'home' | 'history' | 'settings'

type HistoryItem = {
  url: string
  platform: Platform
  date: string
  status: string
}

function detectPlatform(raw: string): Platform {
  try {
    const host = new URL(raw).hostname.toLowerCase().replace(/^www\./, '')
    if (host === 'instagram.com' || host.endsWith('.instagram.com')) return 'Instagram'
    if (host === 'facebook.com' || host.endsWith('.facebook.com') || host === 'fb.watch') return 'Facebook'
  } catch {
    return null
  }
  return null
}

function App() {
  const [url, setUrl] = useState('')
  const [tab, setTab] = useState<Tab>('home')
  const [message, setMessage] = useState('')
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [busy, setBusy] = useState(false)

  const platform = useMemo(() => detectPlatform(url.trim()), [url])

  async function pasteLink() {
    try {
      const text = await navigator.clipboard.readText()
      setUrl(text)
      setMessage(text ? 'Link colado da área de transferência.' : 'Sua área de transferência está vazia.')
    } catch {
      setMessage('Cole o link diretamente no campo.')
    }
  }

  function continueWithLink() {
    setMessage('')
    if (!url.trim()) {
      setMessage('Cole um link para continuar.')
      return
    }
    if (!platform) {
      setMessage('Esse link não parece ser do Instagram ou Facebook.')
      return
    }

    setBusy(true)
    window.setTimeout(() => {
      setHistory(items => [{
        url: url.trim(),
        platform,
        date: new Date().toLocaleString('pt-BR'),
        status: 'Aguardando integração autorizada'
      }, ...items])
      setBusy(false)
      setMessage(`Link reconhecido: ${platform}. O download será integrado em uma próxima etapa.`)
    }, 450)
  }

  function clearLink() {
    setUrl('')
    setMessage('')
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#" onClick={e => { e.preventDefault(); setTab('home') }}>
          <span className="brand-mark"><ArrowDownToLine size={19}/></span>
          <span>downly<span className="brand-dot">.</span></span>
        </a>
        <span className="top-label"><span className="status-dot"/> PRIVADO E SIMPLES</span>
      </header>

      {tab === 'home' && <section className="home-view">
        <div className="eyebrow"><Sparkles size={13}/> SEU ESPAÇO DE VÍDEOS</div>
        <h1>O que você quer<br/><em>guardar hoje?</em></h1>
        <p className="intro">Cole o link de um vídeo seu ou de um conteúdo cujo download esteja autorizado.</p>

        <section className="link-card">
          <label htmlFor="video-url">LINK DO VÍDEO</label>
          <div className="input-wrap">
            <Link2 size={18} className="input-icon"/>
            <input
              id="video-url"
              inputMode="url"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              placeholder="Cole o link do Instagram ou Facebook"
              value={url}
              onChange={e => { setUrl(e.target.value); setMessage('') }}
              onKeyDown={e => e.key === 'Enter' && continueWithLink()}
            />
            {url && <button className="clear-btn" onClick={clearLink} aria-label="Limpar link"><X size={16}/></button>}
          </div>
          <div className="card-actions">
            <button className="paste-btn" onClick={pasteLink}><Clipboard size={15}/> Colar link</button>
            <button className="primary-btn" onClick={continueWithLink} disabled={busy}>
              {busy ? 'Verificando…' : 'Continuar'} <ArrowDownToLine size={17}/>
            </button>
          </div>
          {platform && <div className="platform-detected">
            <span className="platform-icon">
              {platform === 'Instagram' ? <Instagram size={14}/> : <Video size={14}/>}
            </span>
            Link do {platform} reconhecido
          </div>}
          {message && <p className="feedback" role="status">{message}</p>}
        </section>

        <div className="trust-row">
          <div className="trust-icon"><ShieldCheck size={17}/></div>
          <p><strong>Seus links, tratados com cuidado.</strong><br/>Não pedimos sua senha do Instagram ou Facebook.</p>
        </div>

        <section className="how-section">
          <div className="section-heading"><span>COMO FUNCIONA</span><span className="section-line"/></div>
          <div className="steps">
            <div className="step"><span className="step-number">01</span><div><strong>Cole o link</strong><p>Copie o endereço do vídeo.</p></div></div>
            <div className="step"><span className="step-number">02</span><div><strong>Verificamos</strong><p>Identificamos a plataforma e as opções disponíveis.</p></div></div>
            <div className="step"><span className="step-number">03</span><div><strong>Salve com tranquilidade</strong><p>Baixe apenas conteúdos que você pode salvar.</p></div></div>
          </div>
        </section>
      </section>}

      {tab === 'history' && <section className="subpage">
        <div className="eyebrow"><Clock3 size={13}/> SUA ATIVIDADE</div>
        <h1>Histórico<span className="brand-dot">.</span></h1>
        <p className="intro">Os links que você verificou neste dispositivo.</p>
        {history.length === 0
          ? <div className="empty-state">
              <div className="empty-icon"><Download size={22}/></div>
              <strong>Nenhum link por aqui</strong>
              <p>Quando você verificar um link, ele aparecerá nesta lista.</p>
            </div>
          : <div className="history-list">
              {history.map((item, i) => (
                <article className="history-item" key={`${item.url}-${i}`}>
                  <div className="history-icon">
                    {item.platform === 'Instagram' ? <Instagram size={18}/> : <Video size={18}/>}
                  </div>
                  <div className="history-copy">
                    <strong>{item.platform}</strong>
                    <span>{item.date}</span>
                    <small>{item.status}</small>
                  </div>
                  <a href={item.url} target="_blank" rel="noreferrer" aria-label="Abrir link">
                    <ExternalLink size={16}/>
                  </a>
                </article>
              ))}
            </div>}
      </section>}

      {tab === 'settings' && <section className="subpage">
        <div className="eyebrow"><Sparkles size={13}/> PREFERÊNCIAS</div>
        <h1>Ajustes<span className="brand-dot">.</span></h1>
        <div className="settings-card">
          <div className="setting-row">
            <div><strong>Experiência Downly</strong><p>Versão inicial · 0.1.0</p></div>
            <span className="version-pill">BETA</span>
          </div>
          <div className="setting-row">
            <div><strong>Privacidade</strong><p>Não solicitamos credenciais das redes sociais.</p></div>
            <ShieldCheck size={19}/>
          </div>
          <p className="legal-note">
            Use o Downly somente com vídeos próprios ou conteúdos para os quais você tenha autorização de download. A disponibilidade depende dos recursos oficiais de cada plataforma.
          </p>
        </div>
      </section>}

      <nav className="bottom-nav" aria-label="Navegação principal">
        <button className={tab === 'home' ? 'nav-item active' : 'nav-item'} onClick={() => setTab('home')}>
          <ArrowDownToLine size={19}/><span>Início</span>
        </button>
        <button className={tab === 'history' ? 'nav-item active' : 'nav-item'} onClick={() => setTab('history')}>
          <Clock3 size={19}/><span>Histórico</span>
        </button>
        <button className={tab === 'settings' ? 'nav-item active' : 'nav-item'} onClick={() => setTab('settings')}>
          <Sparkles size={19}/><span>Ajustes</span>
        </button>
      </nav>

      <footer className="footer-note">
        FEITO PARA UMA EXPERIÊNCIA MAIS LEVE <span>·</span> DOWNLY
      </footer>
    </main>
  )
}

export default App
