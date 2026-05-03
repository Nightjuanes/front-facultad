import { useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  LayoutDashboard,
  FileText,
  Download,
  AlertTriangle,
  Clock,
  Users,
  BookOpen,
  CalendarDays,
  X,
  Loader2,
  Upload,
  ChevronDown,
  Database,
  Moon,
  Sun,
} from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import {
  getProfesores,
  getSemestres,
  getConsolidado,
  cargarExcel,
  getOpciones,
} from "./services/api";
import "./App.css";

const LOGO_URL = "/logo-sabana.png";

function normalizeArray(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

function getProfesorValue(p) {
  if (typeof p === "string") return p;
  return p?.profesor || p?.nombre_profesor || p?.nombre || "";
}

function getSemestreValue(s) {
  if (typeof s === "string") return s;
  return s?.semestre || s?.ciclo_lectivo || "";
}

function MultiSelect({
  label,
  options,
  selected,
  setSelected,
  placeholder,
  darkMode,
}) {
  const [open, setOpen] = useState(false);

  function toggle(value) {
    setSelected((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  }

  return (
    <div className="relative">
      <label className="text-xs font-semibold text-slate-500">{label}</label>

      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`mt-1 w-full h-14 border rounded-xl px-4 py-3 flex items-center justify-between text-left ${
          darkMode
            ? "bg-slate-900 border-slate-700 text-white"
            : "bg-white border-slate-300 text-slate-900"
        }`}
      >
        <span>
          {selected.length > 0
            ? `${selected.length} seleccionado(s)`
            : placeholder || "Todos"}
        </span>
        <ChevronDown size={18} />
      </button>

      {open && (
        <div
          className={`absolute z-30 mt-2 w-full max-h-64 overflow-y-auto rounded-2xl border p-3 shadow-lg ${
            darkMode
              ? "bg-slate-900 border-slate-700"
              : "bg-white border-blue-100"
          }`}
        >
          <label
            className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer border mb-2 ${
              selected.length === 0
                ? "bg-[#003B70] text-white border-[#003B70]"
                : darkMode
                ? "bg-slate-800 text-slate-200 border-slate-700"
                : "bg-slate-50 text-slate-700 border-slate-200"
            }`}
          >
            <input
              type="checkbox"
              checked={selected.length === 0}
              onChange={() => setSelected([])}
            />
            Todos
          </label>

          {options.map((option) => (
            <label
              key={option}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer border mb-2 text-sm ${
                selected.includes(option)
                  ? "bg-[#003B70] text-white border-[#003B70]"
                  : darkMode
                  ? "bg-slate-800 text-slate-200 border-slate-700"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-blue-50"
              }`}
            >
              <input
                type="checkbox"
                checked={selected.includes(option)}
                onChange={() => toggle(option)}
              />
              {option}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

function MenuItem({ icon: Icon, text, active, onClick, darkMode }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition text-left ${
        active
          ? "bg-[#003B70] text-white shadow"
          : darkMode
          ? "text-slate-300 hover:bg-slate-800"
          : "text-slate-600 hover:bg-blue-50"
      }`}
    >
      <Icon size={18} />
      <span className="text-sm font-semibold">{text}</span>
    </button>
  );
}

function StatCard({ title, value, icon: Icon, darkMode }) {
  return (
    <div
      className={`rounded-2xl shadow-sm border p-5 ${
        darkMode
          ? "bg-slate-900 border-slate-700"
          : "bg-white border-blue-100"
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p
            className={
              darkMode ? "text-sm text-slate-400" : "text-sm text-slate-500"
            }
          >
            {title}
          </p>
          <h2
            className={`text-2xl font-bold mt-1 ${
              darkMode ? "text-white" : "text-[#002B5B]"
            }`}
          >
            {value}
          </h2>
        </div>
        <div
          className={
            darkMode
              ? "bg-slate-800 text-blue-300 p-3 rounded-xl"
              : "bg-blue-50 text-[#003B70] p-3 rounded-xl"
          }
        >
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const reporteRef = useRef(null);

  const [darkMode, setDarkMode] = useState(false);
  const [activePage, setActivePage] = useState("dashboard");

  const [profesor, setProfesor] = useState("");
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);

  const [materia, setMateria] = useState([]);
  const [componente, setComponente] = useState([]);
  const [departamento, setDepartamento] = useState([]);

  const [semestresSeleccionados, setSemestresSeleccionados] = useState([]);
  const [semestresOpen, setSemestresOpen] = useState(false);
  const [todoHistorial, setTodoHistorial] = useState(true);

  const [profesores, setProfesores] = useState([]);
  const [semestres, setSemestres] = useState([]);
  const [resultados, setResultados] = useState([]);

  const [opciones, setOpciones] = useState({
    componentes: [],
    departamentos: [],
    materias: [],
  });

  const [archivo, setArchivo] = useState(null);
  const [mensajeCarga, setMensajeCarga] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingInicial, setLoadingInicial] = useState(true);
  const [error, setError] = useState("");

  const profesoresFiltrados = useMemo(() => {
    const texto = profesor.trim().toLowerCase();
    if (!texto) return [];

    return profesores
      .map(getProfesorValue)
      .filter(Boolean)
      .filter((nombre) => nombre.toLowerCase().includes(texto))
      .slice(0, 10);
  }, [profesor, profesores]);

  const periodoTexto = useMemo(() => {
    if (todoHistorial) return "2016-2 / 2026-1";
    if (semestresSeleccionados.length === 0) return "Sin selección";

    const limpios = semestresSeleccionados.map((s) =>
      s.replace("PERIODO ", "")
    );

    if (limpios.length === 1) return limpios[0];

    return `${limpios[0]} / ${limpios[limpios.length - 1]}`;
  }, [todoHistorial, semestresSeleccionados]);

  const stats = useMemo(() => {
    const totalHoras = resultados.reduce(
      (acc, r) =>
        acc +
        Number(
          r.horas ||
            r.horas_dictadas ||
            r.horas_semestre ||
            r.sesiones ||
            0
        ),
      0
    );

    const materiasSet = new Set(
      resultados.map((r) => r.materia || r.asignatura).filter(Boolean)
    );

    return [
      { title: "Profesores", value: profesores.length || "—", icon: Users },
      {
        title: "Horas certificables",
        value: totalHoras ? totalHoras.toLocaleString("es-CO") : "—",
        icon: Clock,
      },
      {
        title: "Materias consolidadas",
        value: materiasSet.size || "—",
        icon: BookOpen,
      },
      { title: "Periodos", value: periodoTexto, icon: CalendarDays },
    ];
  }, [profesores, resultados, periodoTexto]);

  useEffect(() => {
    async function cargarInicial() {
      try {
        setLoadingInicial(true);
        setError("");

        const [profesoresData, semestresData] = await Promise.all([
          getProfesores(),
          getSemestres(),
        ]);

        setProfesores(normalizeArray(profesoresData));
        setSemestres(normalizeArray(semestresData));

        setOpciones({
          componentes: [],
          departamentos: [],
          materias: [],
        });
      } catch (err) {
        setError(
          err.message ||
            "No se pudo conectar con el backend. Revisa que esté corriendo."
        );
      } finally {
        setLoadingInicial(false);
      }
    }

    cargarInicial();
  }, []);

  async function actualizarOpciones(nombreProfesor = profesor) {
    const nombre = nombreProfesor.trim();

    if (!nombre || nombre.length < 4) return;

    try {
      const data = await getOpciones({
        profesor: nombre,
        semestres: todoHistorial ? "" : semestresSeleccionados.join(","),
      });

      setOpciones({
        componentes: data?.componentes || [],
        departamentos: data?.departamentos || [],
        materias: data?.materias || [],
      });
    } catch (err) {
      console.error("No se pudieron actualizar opciones:", err);
    }
  }

  function toggleSemestre(value) {
    setTodoHistorial(false);
    setSemestresSeleccionados((prev) =>
      prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value]
    );
  }

  function filtrarLocal(filas) {
    return filas.filter((r) => {
      const mat = r.asignatura || r.materia || "";
      const comp = r.componente || "";
      const dep = r.departamento || r.descripcion_materia || "";

      const okMateria = materia.length === 0 || materia.includes(mat);
      const okComponente =
        componente.length === 0 || componente.includes(comp);
      const okDepartamento =
        departamento.length === 0 || departamento.includes(dep);

      return okMateria && okComponente && okDepartamento;
    });
  }

  async function buscar() {
    if (!profesor && !todoHistorial && semestresSeleccionados.length === 0) {
      setError("Debes seleccionar un profesor o al menos un semestre.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data = await getConsolidado({
        profesor,
        semestres: todoHistorial ? "" : semestresSeleccionados.join(","),
      });

      setResultados(filtrarLocal(normalizeArray(data)));
      setActivePage("dashboard");
    } catch (err) {
      setError(err.message || "Error consultando la información consolidada.");
    } finally {
      setLoading(false);
    }
  }

  function limpiarFiltros() {
    setProfesor("");
    setMateria([]);
    setComponente([]);
    setDepartamento([]);
    setSemestresSeleccionados([]);
    setTodoHistorial(true);
    setResultados([]);
    setError("");
    setOpciones({
      componentes: [],
      departamentos: [],
      materias: [],
    });
  }

  function irAReporte() {
    setActivePage("reportes");
  }

  async function exportarReporte() {
    if (!reporteRef.current) return;

    const canvas = await html2canvas(reporteRef.current, {
      scale: 2,
      backgroundColor: "#ffffff",
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");

    const pageWidth = pdf.internal.pageSize.getWidth();
    const imgHeight = (canvas.height * pageWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pageWidth, imgHeight);
    pdf.save(`reporte-${profesor || "certificacion-docente"}.pdf`);
  }

  async function subirArchivo() {
    if (!archivo) {
      setMensajeCarga("Selecciona un archivo Excel primero.");
      return;
    }

    try {
      setLoading(true);
      setMensajeCarga("");
      await cargarExcel(archivo);
      setMensajeCarga(
        "Archivo cargado y base histórica actualizada correctamente."
      );
    } catch (err) {
      setMensajeCarga(err.message || "Error cargando el archivo.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass = `mt-1 w-full h-14 border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 ${
    darkMode
      ? "bg-slate-900 border-slate-700 text-white placeholder:text-slate-500"
      : "bg-white border-slate-300 text-slate-900"
  }`;

  const cardClass = darkMode
    ? "bg-slate-900 border-slate-700 text-white"
    : "bg-white border-blue-100 text-slate-900";

  return (
    <div
      className={`flex min-h-screen ${
        darkMode ? "bg-slate-950" : "bg-[#F3F7FB]"
      }`}
    >
      <aside
        className={`w-80 min-h-screen border-r px-6 py-6 ${
          darkMode
            ? "bg-slate-900 border-slate-800"
            : "bg-white border-blue-100"
        }`}
      >
        <div className="mb-10 flex items-center gap-3">
          <img
            src={LOGO_URL}
            alt="Universidad de La Sabana"
            className="h-12 object-contain"
          />
          <div>
            <h1
              className={`font-bold text-lg ${
                darkMode ? "text-white" : "text-[#002B5B]"
              }`}
            >
              CertiDoc
            </h1>
            <p
              className={
                darkMode ? "text-xs text-slate-400" : "text-xs text-slate-500"
              }
            >
              Universidad de La Sabana
            </p>
          </div>
        </div>

        <nav className="space-y-2">
          <MenuItem
            icon={LayoutDashboard}
            text="Dashboard"
            active={activePage === "dashboard"}
            onClick={() => setActivePage("dashboard")}
            darkMode={darkMode}
          />
          <MenuItem
            icon={FileText}
            text="Reportes"
            active={activePage === "reportes"}
            onClick={() => setActivePage("reportes")}
            darkMode={darkMode}
          />
          <MenuItem
            icon={Upload}
            text="Actualizar base"
            active={activePage === "carga"}
            onClick={() => setActivePage("carga")}
            darkMode={darkMode}
          />
          <MenuItem
            icon={AlertTriangle}
            text="Calidad de datos"
            active={activePage === "calidad"}
            onClick={() => setActivePage("calidad")}
            darkMode={darkMode}
          />
        </nav>
      </aside>

      <main className="flex-1 p-8">
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
              consolidación de materias, horas dictadas y generación de
              reportes.
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

            <button
              onClick={exportarReporte}
              className="flex items-center gap-2 bg-[#003B70] text-white px-5 py-3 rounded-xl hover:bg-[#002B5B]"
            >
              <Download size={18} />
              Exportar reporte
            </button>
          </div>
        </section>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        <section className="grid grid-cols-4 gap-5 mb-8">
          {stats.map((item) => (
            <StatCard key={item.title} {...item} darkMode={darkMode} />
          ))}
        </section>

        {activePage === "dashboard" && (
          <>
            <section
              className={`rounded-2xl border shadow-sm p-6 mb-8 ${cardClass}`}
            >
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
                      darkMode
                        ? "text-sm text-slate-400"
                        : "text-sm text-slate-500"
                    }
                  >
                    Combina profesor, materia, semestre, componente y
                    departamento.
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

              <div className="grid grid-cols-4 gap-4">
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
                      loadingInicial
                        ? "Cargando profesores..."
                        : "Buscar profesor..."
                    }
                  />

                  {mostrarSugerencias && profesoresFiltrados.length > 0 && (
                    <div
                      className={`absolute z-40 mt-2 w-full max-h-72 overflow-y-auto rounded-xl border shadow-lg ${
                        darkMode
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
                            setComponente([]);
                            setDepartamento([]);

                            setTimeout(() => {
                              actualizarOpciones(nombre);
                            }, 100);
                          }}
                          className={`w-full text-left px-4 py-3 border-b ${
                            darkMode
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
                  label="Componente"
                  options={opciones.componentes}
                  selected={componente}
                  setSelected={setComponente}
                  placeholder="Todos"
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
                    className={`absolute z-20 mt-2 w-full border rounded-2xl shadow-lg p-4 ${
                      darkMode
                        ? "bg-slate-900 border-slate-700"
                        : "bg-white border-blue-100"
                    }`}
                  >
                    <label
                      className={`flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer border mb-3 ${
                        todoHistorial
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
                            className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg cursor-pointer border ${
                              semestresSeleccionados.includes(value)
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
                      darkMode
                        ? "text-sm text-slate-400"
                        : "text-sm text-slate-500"
                    }
                  >
                    Tabla con los 7 campos exactos solicitados.
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
                      <th className="text-left px-6 py-4">
                        Nombre del profesor
                      </th>
                      <th className="text-left px-6 py-4">Componente</th>
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
                        <td className="px-6 py-4">{r.componente || "—"}</td>
                        <td className="px-6 py-4">
                          {r.asignatura || r.materia || "—"}
                        </td>
                        <td className="px-6 py-4">
                          {r.semestre || r.ciclo_lectivo || "—"}
                        </td>
                        <td className="px-6 py-4 font-semibold">
                          {r.sesiones || r.horas || "—"}
                        </td>
                        <td className="px-6 py-4">
                          {r.departamento || "—"}
                        </td>
                        <td className="px-6 py-4">{`${r.fecha_inicio || ""} - ${
                          r.fecha_fin || ""
                        }`}</td>
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
        )}

        {activePage === "reportes" && (
          <section
            className={`rounded-2xl border shadow-sm p-8 ${cardClass}`}
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2
                  className={
                    darkMode
                      ? "text-2xl font-bold text-white"
                      : "text-2xl font-bold text-[#002B5B]"
                  }
                >
                  Vista previa del reporte
                </h2>
                <p
                  className={
                    darkMode
                      ? "text-slate-400 mt-2"
                      : "text-slate-500 mt-2"
                  }
                >
                  Formato listo para enviar a Desarrollo Humano.
                </p>
              </div>

              <button
                onClick={exportarReporte}
                className="bg-[#003B70] text-white px-5 py-3 rounded-xl hover:bg-[#002B5B] flex items-center gap-2"
              >
                <Download size={18} />
                Exportar PDF
              </button>
            </div>

            <div
              ref={reporteRef}
              className="bg-white text-black p-8 max-w-4xl mx-auto border"
            >
              <h3 className="font-bold border-b-4 border-black pb-1 mb-6">
                Logística Ingeniería
              </h3>

              <p className="italic mb-4">Buen Día</p>
              <p className="italic mb-4">Cordial Saludo</p>
              <p className="italic mb-6">
                Apreciad@s, envío la información encontrada del profesor{" "}
                <strong>
                  {profesor || resultados[0]?.nombre_profesor || "—"}
                </strong>
                :
              </p>

              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-300">
                    <th className="border border-black p-2">SEMESTRE</th>
                    <th className="border border-black p-2">ASIGNATURA</th>
                    <th className="border border-black p-2">SESIONES</th>
                    <th className="border border-black p-2">DEPARTAMENTO</th>
                  </tr>
                </thead>
                <tbody>
                  {resultados.map((r, index) => (
                    <tr key={index}>
                      <td className="border border-black p-2">{r.semestre}</td>
                      <td className="border border-black p-2">
                        {r.asignatura || r.materia}
                      </td>
                      <td className="border border-black p-2 text-center">
                        {r.sesiones || r.horas}
                      </td>
                      <td className="border border-black p-2">
                        {r.departamento}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <p className="italic mt-6">Gracias por su amable atención.</p>
              <p className="italic mt-4">Sin otro particular,</p>

              <div className="mt-8 flex items-center gap-4">
                <img
                  src={LOGO_URL}
                  alt="Universidad de La Sabana"
                  className="h-20"
                />
                <div>
                  <p className="font-bold text-blue-900 text-xl">
                    SANDRA TORRES
                  </p>
                  <p>Gestora Logística</p>
                  <p>Facultad de Ingeniería</p>
                  <p>Universidad de La Sabana</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {activePage === "carga" && (
          <section
            className={`rounded-2xl border shadow-sm p-8 ${cardClass}`}
          >
            <h2
              className={
                darkMode
                  ? "text-2xl font-bold text-white"
                  : "text-2xl font-bold text-[#002B5B]"
              }
            >
              Actualizar base histórica
            </h2>
            <p
              className={
                darkMode
                  ? "text-slate-400 mt-2 mb-6"
                  : "text-slate-500 mt-2 mb-6"
              }
            >
              La base puede actualizarse conectándose a SIGA o cargando
              manualmente el archivo Excel exportado por la Facultad.
            </p>

            <div className="grid grid-cols-2 gap-6">
              <div className="border border-blue-100 rounded-2xl p-6 bg-blue-50">
                <div className="bg-[#003B70] text-white w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                  <Database size={24} />
                </div>
                <h3 className="text-lg font-bold text-[#002B5B]">
                  Actualizar desde SIGA
                </h3>
                <p className="text-sm text-slate-600 mt-2">
                  Opción para una integración futura con el sistema
                  institucional.
                </p>
                <button className="mt-5 bg-[#003B70] text-white px-4 py-3 rounded-xl opacity-70 cursor-not-allowed">
                  Conexión SIGA pendiente
                </button>
              </div>

              <div
                className={
                  darkMode
                    ? "border border-slate-700 rounded-2xl p-6"
                    : "border border-blue-100 rounded-2xl p-6"
                }
              >
                <div className="bg-[#003B70] text-white w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                  <Upload size={24} />
                </div>
                <h3
                  className={
                    darkMode
                      ? "text-lg font-bold text-white"
                      : "text-lg font-bold text-[#002B5B]"
                  }
                >
                  Subir archivo Excel
                </h3>
                <p
                  className={
                    darkMode
                      ? "text-sm text-slate-400 mt-2"
                      : "text-sm text-slate-600 mt-2"
                  }
                >
                  Carga un archivo exportado desde SIGA para guardar el
                  semestre.
                </p>

                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={(e) => setArchivo(e.target.files[0])}
                  className={inputClass}
                />

                <button
                  onClick={subirArchivo}
                  className="mt-4 bg-[#003B70] text-white px-4 py-3 rounded-xl hover:bg-[#002B5B]"
                >
                  Cargar y actualizar base
                </button>

                {mensajeCarga && (
                  <p className="text-sm text-slate-500 mt-4">
                    {mensajeCarga}
                  </p>
                )}
              </div>
            </div>
          </section>
        )}

        {activePage === "calidad" && (
          <section
            className={`rounded-2xl border shadow-sm p-8 ${cardClass}`}
          >
            <h2
              className={
                darkMode
                  ? "text-2xl font-bold text-white"
                  : "text-2xl font-bold text-[#002B5B]"
              }
            >
              Calidad de datos
            </h2>
            <p
              className={
                darkMode ? "text-slate-400 mt-2" : "text-slate-500 mt-2"
              }
            >
              Aquí se visualizarán alertas sobre duplicados, sesiones combinadas
              y posibles inconsistencias.
            </p>
          </section>
        )}
      </main>
    </div>
  );
}