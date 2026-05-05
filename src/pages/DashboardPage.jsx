import { Search, Loader2, X, ChevronDown } from "lucide-react";
import MultiSelect from "../components/MultiSelect";
import { getSemestreValue } from "../utils/normalizers";

export default function DashboardPage({
  darkMode,
  inputClass,
  cardClass,
  profesor,
  setProfesor,
  mostrarSugerencias,
  setMostrarSugerencias,
  profesoresFiltrados,
  actualizarOpciones,
  materia,
  setMateria,
  departamento,
  setDepartamento,
  opciones,
  semestres,
  semestresOpen,
  setSemestresOpen,
  semestresSeleccionados,
  setSemestresSeleccionados,
  toggleSemestre,
  todoHistorial,
  setTodoHistorial,
  buscar,
  loading,
  loadingInicial,
  limpiarFiltros,
  resultados,
  irAReporte,
}) {
  return (
    <>
      <section className={`rounded-2xl border shadow-sm p-6 mb-8 ${cardClass}`}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2
              className={
                darkMode
                  ? "text-lg font-bold text-white"
                  : "text-lg font-bold text-[#002B5B]"
              }
            >
              Consulta avanzada
            </h2>
            <p
              className={
                darkMode ? "text-sm text-slate-400" : "text-sm text-slate-500"
              }
            >
              Combina profesor, materia, semestre y departamento.
            </p>
          </div>

          <button
            onClick={limpiarFiltros}
            className="flex items-center gap-2 text-slate-500 hover:text-[#003B70]"
          >
            <X size={16} />
            Limpiar filtros
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="relative">
            <label className="text-xs font-semibold text-slate-500">
              Profesor
            </label>

            <input
              value={profesor}
              onChange={(e) => {
                setProfesor(e.target.value);
                setMostrarSugerencias(true);
              }}
              onFocus={() => setMostrarSugerencias(true)}
              onBlur={() => {
                setTimeout(() => setMostrarSugerencias(false), 150);
              }}
              className={inputClass}
              placeholder={
                loadingInicial ? "Cargando profesores..." : "Buscar profesor..."
              }
            />

            {mostrarSugerencias && profesoresFiltrados.length > 0 && (
              <div
                className={`absolute z-40 mt-2 w-full max-h-72 overflow-y-auto rounded-xl border shadow-lg ${darkMode
                  ? "bg-slate-900 border-slate-700"
                  : "bg-white border-blue-100"
                  }`}
              >
                {profesoresFiltrados.map((nombre) => (
                  <button
                    key={nombre}
                    type="button"
                    onMouseDown={() => {
                      setProfesor(nombre);
                      setMostrarSugerencias(false);
                      setMateria([]);
                      setDepartamento([]);

                      setTimeout(() => {
                        actualizarOpciones(nombre);
                      }, 100);
                    }}
                    className={`w-full text-left px-4 py-3 border-b ${darkMode
                      ? "text-slate-200 border-slate-700 hover:bg-slate-800"
                      : "text-slate-700 border-slate-100 hover:bg-blue-50"
                      }`}
                  >
                    {nombre}
                  </button>
                ))}
              </div>
            )}
          </div>

          <MultiSelect
            label="Materia"
            options={opciones.materias}
            selected={materia}
            setSelected={setMateria}
            placeholder="Todas"
            darkMode={darkMode}
          />

          <MultiSelect
            label="Departamento"
            options={opciones.departamentos}
            selected={departamento}
            setSelected={setDepartamento}
            placeholder="Todos"
            darkMode={darkMode}
          />
        </div>

        <div className="mt-5 relative">
          <label className="text-xs font-semibold text-slate-500">
            Semestres
          </label>

          <button
            type="button"
            onClick={() => setSemestresOpen(!semestresOpen)}
            className={`${inputClass} flex justify-between items-center text-left`}
          >
            <span>
              {todoHistorial
                ? "Todo el historial del profesor"
                : semestresSeleccionados.length > 0
                  ? `${semestresSeleccionados.length} semestre(s) seleccionado(s)`
                  : "Seleccionar semestres"}
            </span>
            <ChevronDown size={18} />
          </button>

          {semestresOpen && (
            <div
              className={`absolute z-20 mt-2 w-full border rounded-2xl shadow-lg p-4 ${darkMode
                ? "bg-slate-900 border-slate-700"
                : "bg-white border-blue-100"
                }`}
            >
              <label
                className={`flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer border mb-3 ${todoHistorial
                  ? "bg-[#003B70] text-white border-[#003B70]"
                  : darkMode
                    ? "bg-slate-800 text-slate-200 border-slate-700"
                    : "bg-slate-50 text-slate-700 border-slate-200"
                  }`}
              >
                <input
                  type="checkbox"
                  checked={todoHistorial}
                  onChange={() => {
                    setTodoHistorial(!todoHistorial);
                    setSemestresSeleccionados([]);
                  }}
                />
                Todo el historial del profesor
              </label>

              <div className="grid grid-cols-4 gap-2 max-h-56 overflow-y-auto">
                {semestres.map((s, index) => {
                  const value = getSemestreValue(s);
                  if (!value) return null;

                  return (
                    <label
                      key={index}
                      className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg cursor-pointer border ${semestresSeleccionados.includes(value)
                        ? "bg-[#003B70] text-white border-[#003B70]"
                        : darkMode
                          ? "bg-slate-800 text-slate-200 border-slate-700"
                          : "bg-white text-slate-600 border-slate-200 hover:bg-blue-50"
                        }`}
                    >
                      <input
                        type="checkbox"
                        checked={semestresSeleccionados.includes(value)}
                        onChange={() => toggleSemestre(value)}
                      />
                      {value}
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={buscar}
          disabled={loading}
          className="mt-5 w-full bg-[#003B70] text-white rounded-xl font-semibold py-3 hover:bg-[#002B5B] flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {loading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Search size={18} />
          )}
          {loading ? "Consultando..." : "Buscar información"}
        </button>
      </section>

      <section
        className={`rounded-2xl border shadow-sm overflow-hidden ${cardClass}`}
      >
        <div className="p-6 flex justify-between items-center">
          <div>
            <h2
              className={
                darkMode
                  ? "text-lg font-bold text-white"
                  : "text-lg font-bold text-[#002B5B]"
              }
            >
              Resultados de certificación
            </h2>
            <p
              className={
                darkMode ? "text-sm text-slate-400" : "text-sm text-slate-500"
              }
            >
              Tabla con los campos solicitados.
            </p>
          </div>

          <button
            onClick={irAReporte}
            className="bg-blue-50 text-[#003B70] px-4 py-2 rounded-xl hover:bg-blue-100"
          >
            Generar certificado
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead
              className={
                darkMode
                  ? "bg-slate-800 text-blue-200"
                  : "bg-[#EAF2FA] text-[#002B5B]"
              }
            >
              <tr>
                <th className="text-left px-6 py-4">Nombre del profesor</th>
                <th className="text-left px-6 py-4">Materia</th>
                <th className="text-left px-6 py-4">Semestre</th>
                <th className="text-left px-6 py-4">Horas / Sesiones</th>
                <th className="text-left px-6 py-4">Departamento</th>
                <th className="text-left px-6 py-4">Fechas</th>
              </tr>
            </thead>

            <tbody>
              {resultados.map((r, index) => (
                <tr
                  key={index}
                  className={
                    darkMode
                      ? "border-t border-slate-700"
                      : "border-t border-slate-100"
                  }
                >
                  <td className="px-6 py-4 font-medium">
                    {r.nombre_profesor || r.profesor || r.nombre || "—"}
                  </td>
                  <td className="px-6 py-4">
                    {r.asignatura || r.materia || "—"}
                  </td>
                  <td className="px-6 py-4">
                    {r.semestre || r.ciclo_lectivo || "—"}
                  </td>
                  <td className="px-6 py-4 font-semibold">
                    {r.sesiones || r.horas || "—"}
                  </td>
                  <td className="px-6 py-4">{r.departamento || "—"}</td>
                  <td className="px-6 py-4">
                    {`${r.fecha_inicio || ""} - ${r.fecha_fin || ""}`}
                  </td>
                </tr>
              ))}

              {resultados.length === 0 && (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-10 text-center text-slate-500"
                  >
                    Realiza una búsqueda para consultar la información
                    consolidada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}