import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Cadastro";
import Estoque from "./pages/Estoque";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Cadastro />} />
        <Route path="/estoque" element={<Estoque />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
