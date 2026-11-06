import { useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import Cabecalho from "./components/Cabecalho";
import Rodape from "./components/Rodape";
import RotaProtegida from "./components/RotaProtegida";

import Inicio from "./pages/Inicio";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import ComoFunciona from "./pages/ComoFunciona";
import Contato from "./pages/Contato";
import Privacidade from "./pages/Privacidade";
import Historico from "./pages/Historico";
import ClientePainel from "./pages/ClientePainel";
import MotoristaPainel from "./pages/MotoristaPainel";

import "./App.css";

function App() {
  const [tema, setTema] = useState(
    () => localStorage.getItem("tema-fretar") || "claro"
  );

  function alternarTema() {
    setTema((temaAtual) => {
      const novoTema = temaAtual === "escuro" ? "claro" : "escuro";
      localStorage.setItem("tema-fretar", novoTema);
      return novoTema;
    });
  }

  return (
    <div className={`app tema-${tema}`}>
      <Cabecalho tema={tema} aoAlternarTema={alternarTema} />

      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/como-funciona" element={<ComoFunciona />} />
        <Route path="/contato" element={<Contato />} />
        <Route path="/privacidade" element={<Privacidade />} />
        <Route
          path="/historico"
          element={
            <RotaProtegida>
              <Historico tema={tema} />
            </RotaProtegida>
          }
        />

        <Route
          path="/cliente"
          element={
            <RotaProtegida papel="user">
              <ClientePainel />
            </RotaProtegida>
          }
        />

        <Route
          path="/motorista"
          element={
            <RotaProtegida papel="driver">
              <MotoristaPainel />
            </RotaProtegida>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <Rodape />
    </div>
  );
}

export default App;
