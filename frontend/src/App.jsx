import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Estoque from "./pages/Estoque";
import Vendas from "./pages/Vendas";
import Clientes from "./pages/Clientes";
import Perfil from "./pages/Perfil";
import Fornecedores from "./pages/Fornecedores";
import Cadastro from "./pages/Cadastro";
import Relatorio from "./pages/Relatorio";
import Navbar from "./components/navbar";
import Footer from "./components/Footer/Footer";
import ProdutoDetalhe from "./pages/ProdutoDetalhe";

// ROTA PROTEGIDA
function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Login */}
        <Route path="/" element={<Login />} />

        {/* Home */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        {/* Rotas Protegidas */}
        <Route
          path="/estoque"
          element={
            <ProtectedRoute>
              <Estoque />
            </ProtectedRoute>
          }
        />

        <Route
          path="/vendas"
          element={
            <ProtectedRoute>
              <Vendas />
            </ProtectedRoute>
          }
        />

        <Route
          path="/perfil"
          element={
            <ProtectedRoute>
              <Perfil />
            </ProtectedRoute>
          }
        />

        <Route
          path="/fornecedores"
          element={
            <ProtectedRoute>
              <Fornecedores />
            </ProtectedRoute>
          }
        />
        <Route
          path="/clientes"
          element={
            <ProtectedRoute>
              <Clientes />
            </ProtectedRoute>
          }
        />

        <Route
          path="/cadastro"
          element={
            <ProtectedRoute>
              <Cadastro />
            </ProtectedRoute>
          }
        />

        <Route
          path="/relatorio"
          element={
            <ProtectedRoute>
              <Relatorio />
            </ProtectedRoute>
          }
        />

        <Route
          path="/estoque/produtos/:id"
          element={
            <ProtectedRoute>
              <ProdutoDetalhe />
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
