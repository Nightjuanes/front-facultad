import { Download, Moon, Sun } from "lucide-react";
import { PAGE_KEYS } from "../constants/appConstants";

export default function Header({
  darkMode,
  setDarkMode,
  resultados,
  exportarReporte,
  activePage,
}) {
  return (
    <section className="mb-8 flex justify-between items-start">
      <div>
        <p className="text-sm font-bold text-[#005CA8]">
          Facultad de Ingeniería · Sistema de consulta automatizado
        </p>

        <h1
          className={`text-3xl font-bold mt-1 ${
            darkMode ? "text-white" : "text-[#002B5B]"
          }`}
        >
          Certificación Docente
        </h1>

        <p
          className={
            darkMode
              ? "text-slate-400 mt-2 max-w-3xl"
              : "text-slate-500 mt-2 max-w-3xl"
          }
        >
          Consulta histórica de programación académica de pregrado,
          consolidación de materias, horas dictadas y generación de reportes.
        </p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl border ${
            darkMode
              ? "bg-slate-900 text-white border-slate-700"
              : "bg-white text-[#003B70] border-blue-100"
          }`}
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          {darkMode ? "Modo claro" : "Modo oscuro"}
        </button>

        {resultados.length > 0 && activePage === PAGE_KEYS.REPORTES && (
          <button
            onClick={exportarReporte}
            className="flex items-center gap-2 bg-[#003B70] text-white px-5 py-3 rounded-xl hover:bg-[#002B5B]"
          >
            <Download size={18} />
            Exportar reporte
          </button>
        )}
      </div>
    </section>
  );
}