import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/home";
import Estoque from "./pages/Estoque";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/estoque" element={<Estoque />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
