import "./style.css";
import { Link } from "react-router-dom";
import {
  FaBoxesStacked,
  FaUsersGear,
  FaUsers,
  FaTruckField,
  FaCartShopping,
  FaChartLine,
} from "react-icons/fa6";

function Home() {
  const nomeUsuario = localStorage.getItem("userName") || "Usuário";
  const nivelAcesso = localStorage.getItem("userLevel") || "vendedor";

  const modulos = [
    {
      titulo: "Estoque",
      descricao: "Consulte produtos, acompanhe lotes, validade e movimentações.",
      rota: "/estoque",
      icone: <FaBoxesStacked />,
      destaque: "Controle operacional",
    },
    {
      titulo: "Vendas",
      descricao: "Registre pedidos, acompanhe itens vendidos e histórico de vendas.",
      rota: "/vendas",
      icone: <FaCartShopping />,
      destaque: "Atendimento e pedidos",
    },
    {
      titulo: "Clientes",
      descricao: "Gerencie dados cadastrais e mantenha a base de clientes organizada.",
      rota: "/clientes",
      icone: <FaUsers />,
      destaque: "Cadastro comercial",
    },
    {
      titulo: "Fornecedores",
      descricao: "Cadastre fornecedores e vincule entradas de estoque.",
      rota: "/fornecedores",
      icone: <FaTruckField />,
      destaque: "Abastecimento",
    },
    {
      titulo: "Relatório",
      descricao: "Acompanhe indicadores, vendas e informações consolidadas do sistema.",
      rota: "/relatorio",
      icone: <FaChartLine />,
      destaque: "Análise gerencial",
    },
  ];

  if (nivelAcesso === "admin") {
    modulos.unshift({
      titulo: "Usuários e Acessos",
      descricao: "Cadastre usuários e controle os perfis de acesso ao sistema.",
      rota: "/usuarios",
      icone: <FaUsersGear />,
      destaque: "Administração",
    });
  }

  return (
    <main className="home-page">
      <section className="home-hero">
        <div className="home-hero-text">
          <span className="home-eyebrow">Sistema de Gestão Tropical Mix</span>

          <h1>Olá, {nomeUsuario}. Bem-vindo(a) ao painel principal.</h1>

          <p>
            Acesse rapidamente os módulos do sistema para controlar estoque,
            registrar vendas, gerenciar clientes, fornecedores e acompanhar os
            principais dados da operação.
          </p>
        </div>

        <div className="home-hero-panel">
          <span className="home-panel-label">Visão do sistema</span>
          <strong>Gestão integrada</strong>
          <p>
            Centralize cadastros, movimentações e consultas em um único ambiente.
          </p>
        </div>
      </section>

      <section className="home-section-header">
        <div>
          <h2>Módulos principais</h2>
          <p>Escolha uma área para iniciar o trabalho.</p>
        </div>
      </section>

      <nav className="home-menu" aria-label="Navegação principal">
        {modulos.map((modulo) => (
          <Link to={modulo.rota} className="home-card" key={modulo.titulo}>
            <div className="home-card-top">
              <div className="home-card-icon">{modulo.icone}</div>
              <span>{modulo.destaque}</span>
            </div>

            <h3>{modulo.titulo}</h3>
            <p>{modulo.descricao}</p>
          </Link>
        ))}
      </nav>
    </main>
  );
}

export default Home;