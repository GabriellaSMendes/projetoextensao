import logo from "../../assets/logo.png"
import iconLogo from "../../assets/icon-logo.png"
import "./style.css"
import { Link } from "react-router-dom"
import { FaUserCircle } from "react-icons/fa"
import { useState } from "react"

function Navbar() {

    const [menuAberto, setMenuAberto] = useState(false)
    const toggleMenu = () => setMenuAberto(!menuAberto)


    return (
        <header className="navbar">
            <div className="navbar-left">
                <img src={logo} alt="Tropical Mix" className="navbar-logo" />
            </div>

            <nav className="navbar-menu">
                <Link to="/" className="nav-link">Home</Link>
                <Link to="/estoque" className="nav-link">Estoque</Link>
                <Link to="/vendas" className="nav-link">Vendas</Link>
                <Link to="/">
                    <img src={iconLogo} alt="Home" className="navbar-sun" />
                </Link>
                <Link to="/relatorio">Relatório</Link>
                <Link to="/fornecedores">Fornecedores</Link>
            </nav>


            {/*Botão de usuário com menu dropdown*/}
            <div className="navbar-right">
                <div className="user-menu-container">
                    <FaUserCircle
                        className="navbar-user"
                        onClick={toggleMenu}
                    />

                    {/* dropdown do usuário */}
                    {menuAberto && (
                        <div className="user-dropdown">
                            <Link to="/perfil" className="dropdown-item">Ver perfil</Link>
                            <Link to="/cadastro" className="dropdown-item">Cadastrar novo usuário</Link>
                            <hr className="dropdown-divider" />
                            <button className="dropdown-item logout-btn">
                                <FaSignOutAlt className="logout-icon" /> Sair
                            </button>
                        </div>
                    )}
                </div>
            </div>

        </header>
    );
}

export default Navbar;