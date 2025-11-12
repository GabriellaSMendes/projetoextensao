import "./style.css";
import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="home">
      <h1 className="home-title">Sistema Tropical Mix</h1>
      <p className="home-sub">Escolha uma seção para começar:</p>

      <nav className="home-menu">
        <Link to="/login" className="home-btn">Login</Link>
        <Link to="/estoque" className="home-btn">Estoque</Link>
        <Link to="/vendas" className="home-btn">Vendas</Link>
      </nav>
    </div>
  );
}

export default Home;
