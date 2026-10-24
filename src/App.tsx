import { useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "./app/Layout";
import Ajustes from "./features/ajustes/Ajustes";
import Banco from "./features/banco/Banco";
import Leccion from "./features/leccion/Leccion";
import Progreso from "./features/progreso/Progreso";
import Ruta from "./features/ruta/Ruta";
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
          <Route index element={<Ruta />} />
          <Route path="unidad/:id" element={<Leccion />} />
          <Route path="unidad/:id/quiz" element={<Sesion />} />
          <Route path="repaso" element={<Sesion />} />
          <Route path="progreso" element={<Progreso />} />
          <Route path="banco" element={<Banco />} />
          <Route path="ajustes" element={<Ajustes />} />
          <Route path="*" element={<Ruta />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
