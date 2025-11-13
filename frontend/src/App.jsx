import { BrowserRouter, Routes, Route } from "react-router-dom";   
import Login from "./pages/Login";
import Estoque from "./pages/Estoque";
import Vendas from "./pages/Vendas";
import Home from "./pages/Home";
import Perfil from "./pages/Perfil"
import Fornecedores from "./pages/Fornecedores"
import Cadastro from "./pages/Cadastro"
import Navbar from "./components/navbar";
import Relatorio from "./pages/Relatorio"
import Footer from "./components/Footer/Footer";


function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />  
        <Route path="/login" element={<Login />} />
        <Route path="/estoque" element={<Estoque />} />
        <Route path="/vendas" element={<Vendas />} />
        <Route path="/perfil" element={<Perfil />}></Route>
        <Route path="/fornecedores" element={<Fornecedores />}></Route>
        <Route path="/cadastro" element={<Cadastro />}></Route>
        <Route path="/relatorio" element={<Relatorio />}></Route>
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
