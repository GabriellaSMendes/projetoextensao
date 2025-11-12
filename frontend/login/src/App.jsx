import { BrowserRouter, Routes, Route } from "react-router-dom";
import Cadastro from "./pages/Cadastro";
import Estoque from "./pages/Estoque";
import Vendas from "./pages/Vendas"; // <-- import da nova tela

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Cadastro />} />
        <Route path="/estoque" element={<Estoque />} />
        <Route path="/vendas" element={<Vendas />} /> {/* <-- nova rota */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
