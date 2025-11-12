import logo from "../../assets/logo.png"
import iconLogo from "../../assets/icon-logo.png"
import "./style.css"
import { Link } from "react-router-dom"
import { FaUserCircle } from "react-icons/fa"

function NavBar(){
    return(
        <header className="navbar">
            <div className="navbar-left">
                <img src={logo} alt="Tropical Mix" className="navbar-logo" />
            </div>

            <nav className="navbar-menu">
                <Link to="/" className="nav-link">Home</Link>
                <Link to="/estoque" className="nav-link">Estoque</Link>
                <Link to="/vendas" className="nav-link">Vendas</Link>

                

            </nav>

        </header>
    );
}
