import logo from "../../assets/logo.png";
import iconLogo from "../../assets/icon-logo.png";
import "./style.css";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { FaUserCircle, FaSignOutAlt } from "react-icons/fa";
import { useState, useRef, useEffect } from "react";

function Navbar() {
    const [menuAberto, setMenuAberto] = useState(false);

    const menuRef = useRef(null);

    const navigate = useNavigate();

    // Carrega nome + nível de acesso do usuário
    const nomeUsuario = localStorage.getItem("userName") || "Usuário";
    const nivelAcesso = localStorage.getItem("userLevel") || "vendedor";

    const toggleMenu = () => setMenuAberto(!menuAberto);

    const handleItemClick = () => setMenuAberto(false);

    // Logout
    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("nome_usuario");
        localStorage.removeItem("nivel_acesso");
        setMenuAberto(false);
        navigate("/");
    };

    // Fecha o menu clicando fora
    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setMenuAberto(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <header className="navbar">
            <div className="navbar-left">
                <img src={logo} alt="Tropical Mix" className="navbar-logo" />
            </div>

            <nav className="navbar-menu">
                <NavLink
                    to="/home"
                    className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                >
                    Home
                </NavLink>

                <NavLink
                    to="/estoque"
                    className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                >
                    Estoque
                </NavLink>

                <NavLink
                    to="/clientes"
                    className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                >
                    Clientes
                </NavLink>

                <Link to="/home" className="navbar-sun-link">
                    <img src={iconLogo} alt="Home" className="navbar-sun" />
                </Link>

                <NavLink
                    to="/fornecedores"
                    className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                >
                    Fornecedores
                </NavLink>

                <NavLink
                    to="/vendas"
                    className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                >
                    Vendas
                </NavLink>

                <NavLink
                    to="/relatorio"
                    className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                >
                    Relatório
                </NavLink>
            </nav>

            <div className="navbar-right">
                <div className="user-menu-container">
                    <FaUserCircle className="navbar-user" onClick={toggleMenu} />

                    {menuAberto && (
                        <div className="user-dropdown" ref={menuRef}>

                            {/* SAUDAÇÃO */}
                            <div className="dropdown-header">
                                Olá, {nomeUsuario}!
                            </div>
                            <hr className="dropdown-divider" />

                            {/* Itens do menu */}
                            <Link to="/perfil" className="dropdown-item" onClick={handleItemClick}>
                                Ver perfil
                            </Link>

                            {/* Só aparece para admin */}
                            {nivelAcesso === "admin" && (
                                <Link
                                    to="/cadastro"
                                    className="dropdown-item"
                                    onClick={handleItemClick}
                                >
                                    Cadastrar usuário
                                </Link>
                            )}

                            <hr className="dropdown-divider" />

                            <button className="dropdown-item logout-btn" onClick={logout}>
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
