import { BrowserRouter, Routes, Route } from "react-router-dom";   
import Login from "./pages/Login";
import Estoque from "./pages/Estoque";
import Vendas from "./pages/Vendas";
import Home from "./pages/Home";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />  
        <Route path="/login" element={<Login />} />
        <Route path="/estoque" element={<Estoque />} />
        <Route path="/vendas" element={<Vendas />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
