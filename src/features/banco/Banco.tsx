import { useMemo, useState } from "react";
import { MATERIAS, PREGUNTAS } from "../../data/preguntas";

export default function Banco() {
  const [texto, setTexto] = useState("");
  const [materia, setMateria] = useState("todas");
  const [abierta, setAbierta] = useState<string | null>(null);

  const filtradas = useMemo(() => {
    const t = texto.trim().toLowerCase();
    return PREGUNTAS.filter((q) => {
      const okMateria = materia === "todas" || q.materia === materia;
      const okTexto =
        !t ||
        q.enunciado.toLowerCase().includes(t) ||
        q.tema.toLowerCase().includes(t) ||
        q.explicacion.toLowerCase().includes(t);
      return okMateria && okTexto;
    });
  }, [texto, materia]);

  return (
    <div className="space-y-3">
      <input
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder="Buscar pregunta o tema…"
        className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none"
      />

      <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none]">
        <button
          onClick={() => setMateria("todas")}
          className={`shrink-0 rounded-full border px-3 py-1.5 text-xs ${
            materia === "todas" ? "border-accent text-accent" : "border-line text-muted"
          }`}
        >
          Todas ({PREGUNTAS.length})
        </button>
        {MATERIAS.map((m) => (
          <button
            key={m.slug}
            onClick={() => setMateria(m.slug)}
            className={`shrink-0 rounded-full border px-3 py-1.5 text-xs ${
              materia === m.slug ? "border-accent text-accent" : "border-line text-muted"
            }`}
          >
            {m.nombre}
          </button>
        ))}
      </div>

      <p className="text-xs text-muted">{filtradas.length} resultados</p>

      <ul className="space-y-2">
        {filtradas.map((q) => {
          const abierto = abierta === q.id;
          return (
            <li key={q.id} className="card overflow-hidden">
              <button
                onClick={() => setAbierta(abierto ? null : q.id)}
                className="w-full p-4 text-left"
                aria-expanded={abierto}
              >
                <p className="text-[11px] tracking-wider text-accent uppercase">{q.materiaNombre}</p>
                <p className="mt-1 text-sm leading-snug">{q.enunciado}</p>
              </button>
              {abierto && (
                <div className="space-y-2 border-t border-line px-4 py-3">
                  <ul className="space-y-1">
                    {q.opciones.map((op, i) => (
                      <li
                        key={i}
                        className={`text-sm ${i === q.respuesta ? "font-semibold text-ok" : "text-muted"}`}
                      >
                        {String.fromCharCode(65 + i)}. {op}
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs leading-relaxed text-muted">{q.explicacion}</p>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
