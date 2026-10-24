import { useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "./app/Layout";
import Ajustes from "./features/ajustes/Ajustes";
import Banco from "./features/banco/Banco";
import Hoy from "./features/hoy/Hoy";
import Progreso from "./features/progreso/Progreso";
import Sesion from "./features/sesion/Sesion";
import { useApp } from "./lib/store";

export default function App() {
  const init = useApp((s) => s.init);
  const listo = useApp((s) => s.listo);
  const tema = useApp((s) => s.tema);

  useEffect(() => {
    document.documentElement.dataset.tema = tema;
  }, [tema]);

  useEffect(() => {
    void init();
  }, [init]);

  if (!listo) {
    return (
      <div className="grid min-h-dvh place-items-center">
        <p className="animate-pulse text-sm text-muted">Cargando…</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Hoy />} />
          <Route path="sesion" element={<Sesion />} />
          <Route path="progreso" element={<Progreso />} />
          <Route path="banco" element={<Banco />} />
          <Route path="ajustes" element={<Ajustes />} />
          <Route path="*" element={<Hoy />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
