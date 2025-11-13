import "./style.css";
import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="home">
      {/* faixa superior com logo e nome
      <header className="home-header">
        <div className="home-logo">
          <span className="home-logo-icon">🌴</span>
          <div className="home-logo-text">
            <span className="home-logo-title">Tropical Mix</span>
            <span className="home-logo-subtitle">
              Painel de gerenciamento
            </span>
          </div>
        </div>
      </header> */}

      {/* conteúdo central */}
      <main className="home-content">
        <section className="home-hero">
          <h1>Bem-vindo(a) ao Sistema Tropical Mix</h1>
          <p>
            Organize <strong>usuários</strong>, controle seu{" "}
            <strong>estoque</strong> e acompanhe as{" "}
            <strong>vendas</strong> em um só lugar.
          </p>
        </section>

        {/* cards de navegação */}
        <nav className="home-menu">
          <Link to="/login" className="home-card">
            <div className="home-card-icon">🔐</div>
            <h2>Login / Cadastro</h2>
            <p>Acesse ou gerencie contas de usuários do sistema.</p>
          </Link>

          <Link to="/estoque" className="home-card">
            <div className="home-card-icon">📦</div>
            <h2>Estoque</h2>
            <p>Veja e atualize os produtos disponíveis para venda.</p>
          </Link>

          <Link to="/vendas" className="home-card">
            <div className="home-card-icon">💰</div>
            <h2>Vendas</h2>
            <p>Acompanhe as vendas realizadas e seus detalhes.</p>
          </Link>
        </nav>
      </main>

      <footer className="home-footer">
        <span>Sistema acadêmico — Tropical Mix</span>
      </footer>
    </div>
  );
}

export default Home;
