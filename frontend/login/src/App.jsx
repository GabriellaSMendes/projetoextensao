import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";        
import Cadastro from "./pages/Cadastro";
import Estoque from "./pages/Estoque";
import Vendas from "./pages/Vendas";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />  
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/estoque" element={<Estoque />} />
        <Route path="/vendas" element={<Vendas />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
