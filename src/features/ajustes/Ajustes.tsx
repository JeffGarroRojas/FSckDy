import { useEffect, useState } from "react";
import { db } from "../../lib/db";
import { useApp } from "../../lib/store";

export default function Ajustes() {
  const tema = useApp((s) => s.tema);
  const setTema = useApp((s) => s.setTema);
  const reiniciar = useApp((s) => s.reiniciar);
  const intentos = useApp((s) => s.intentos);

  const [confirmar, setConfirmar] = useState(false);
  const [instalable, setInstalable] = useState(false);

  useEffect(() => {
    const onPrompt = () => setInstalable(true);
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  const exportar = async () => {
    const datos = { tarjetas: await db.tarjetas.toArray(), intentos: await db.intentos.toArray() };
    const blob = new Blob([JSON.stringify(datos, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fsckdy-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-3">
      <section className="card p-4">
        <h3 className="text-sm font-semibold">Apariencia</h3>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {(["oscuro", "claro"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTema(t)}
              className={`rounded-xl border py-2.5 text-sm capitalize ${
                tema === t ? "border-accent text-accent" : "border-line text-muted"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </section>

      <section className="card space-y-2 p-4">
        <h3 className="text-sm font-semibold">Datos</h3>
        <p className="text-xs text-muted">
          Todo se guarda en este dispositivo (IndexedDB). {intentos.length} respuestas registradas.
        </p>
        <button
          onClick={exportar}
          className="w-full rounded-xl border border-line py-2.5 text-sm text-ink"
        >
          Exportar progreso (JSON)
        </button>
        {!confirmar ? (
          <button
            onClick={() => setConfirmar(true)}
            className="w-full rounded-xl border py-2.5 text-sm"
            style={{ borderColor: "var(--bad)", color: "var(--bad)" }}
          >
            Borrar todo el progreso
          </button>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                reiniciar();
                setConfirmar(false);
              }}
              className="rounded-xl py-2.5 text-sm font-semibold"
              style={{ background: "var(--bad)", color: "#fff" }}
            >
              Confirmar
            </button>
            <button onClick={() => setConfirmar(false)} className="rounded-xl border border-line py-2.5 text-sm text-muted">
              Cancelar
            </button>
          </div>
        )}
      </section>

      <section className="card space-y-1 p-4 text-xs text-muted">
        <h3 className="text-sm font-semibold text-ink">Acerca de</h3>
        <p>FSckDy · preparación DAM 2026 (código 3015).</p>
        <p>50 preguntas basadas en la tabla de especificaciones oficial.</p>
        <p>Repaso espaciado SM-2 · funciona sin conexión.</p>
        {instalable && <p className="text-accent">Puedes instalarla desde el menú del navegador.</p>}
        <p className="pt-2">v0.1.0</p>
      </section>
    </div>
  );
}
