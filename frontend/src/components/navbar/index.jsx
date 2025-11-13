import logo from "../../assets/logo.png"
import iconLogo from "../../assets/icon-logo.png"
import "./style.css"
import { Link } from "react-router-dom"
import { FaUserCircle, FaSignOutAlt } from "react-icons/fa"
import { useState, useRef, useEffect } from "react"

function Navbar() {

    const [menuAberto, setMenuAberto] = useState(false)

    const menuRef = useRef(null)

    const toggleMenu = () => setMenuAberto(!menuAberto)

    const handleItemClick = () => setMenuAberto(false)

    {/*Função pra ter o efeito hover on click no ícone do perfil */}
    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setMenuAberto(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)

        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [])

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

                <Link to="/relatorio" className="nav-link">Relatório</Link>
                <Link to="/fornecedores" className="nav-link">Fornecedores</Link>
            </nav>

            <div className="navbar-right">
                <div className="user-menu-container">

                    <FaUserCircle
                        className="navbar-user"
                        onClick={toggleMenu}
                    />

                    {menuAberto && (
                        <div className="user-dropdown" ref={menuRef}>
                            <Link to="/perfil" className="dropdown-item" onClick={handleItemClick}>
                                Ver perfil
                            </Link>

                            <Link to="/cadastro" className="dropdown-item" onClick={handleItemClick}>
                                Cadastrar novo usuário
                            </Link>

                            <hr className="dropdown-divider" />

                            <button
                                className="dropdown-item logout-btn"
                                onClick={handleItemClick}
                            >
                                <FaSignOutAlt className="logout-icon" /> Sair
                            </button>
                        </div>
                    )}

                </div>
            </div>
        </header>
    )
}

export default Navbar
