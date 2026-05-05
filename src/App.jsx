import { useEffect, useMemo, useRef, useState } from "react";

import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import StatsGrid from "./components/StatsGrid";

import DashboardPage from "./pages/DashboardPage";
import ReportesPage from "./pages/ReportesPage";
import CargaPage from "./pages/CargaPage";
import CalidadPage from "./pages/CalidadPage";
import HistorialPage from "./pages/HistorialPage";
import { AlertTriangle } from "lucide-react";

import {
  getProfesores,
  getSemestres,
  getConsolidado,
  cargarExcel,
  getOpciones,
} from "./services/api";

import { PAGE_KEYS, INITIAL_OPTIONS } from "./constants/appConstants";
import { normalizeArray, getProfesorValue } from "./utils/normalizers";
import { buildStats } from "./utils/stats";
import { exportarExcel } from "./utils/exportarExcel";
import { exportarPDF, enviarPDFAlEquipo } from "./utils/exportarPDF";

import "./App.css";

export default function App() {
  const reporteRef = useRef(null);

  const [darkMode, setDarkMode] = useState(false);
  const [activePage, setActivePage] = useState(PAGE_KEYS.DASHBOARD);

  const [profesor, setProfesor] = useState("");
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);

  const [materia, setMateria] = useState([]);
  const [departamento, setDepartamento] = useState([]);


  const [semestresSeleccionados, setSemestresSeleccionados] = useState([]);
  const [semestresOpen, setSemestresOpen] = useState(false);
  const [todoHistorial, setTodoHistorial] = useState(true);

  const [profesores, setProfesores] = useState([]);
  const [semestres, setSemestres] = useState([]);
  const [resultados, setResultados] = useState([]);

  const [opciones, setOpciones] = useState(INITIAL_OPTIONS);

  const [archivo, setArchivo] = useState(null);
  const [mensajeCarga, setMensajeCarga] = useState("");

  const [historial, setHistorial] = useState(() => {
    const saved = localStorage.getItem("search_history");
    return saved ? JSON.parse(saved) : [];
  });

  const [loading, setLoading] = useState(false);
  const [loadingInicial, setLoadingInicial] = useState(true);
  const [error, setError] = useState("");

  const inputClass = `mt-1 w-full h-14 border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 ${darkMode
      ? "bg-slate-900 border-slate-700 text-white placeholder:text-slate-500"
      : "bg-white border-slate-300 text-slate-900"
    }`;

  const cardClass = darkMode
    ? "bg-slate-900 border-slate-700 text-white"
    : "bg-white border-blue-100 text-slate-900";

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
    return buildStats(resultados, periodoTexto);
  }, [resultados, periodoTexto]);

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
        setOpciones(INITIAL_OPTIONS);
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

  useEffect(() => {
    localStorage.setItem("search_history", JSON.stringify(historial));
  }, [historial]);

  async function actualizarOpciones(nombreProfesor = profesor) {
    const nombre = nombreProfesor.trim();

    if (!nombre || nombre.length < 4) return;

    try {
      const data = await getOpciones({
        profesor: nombre,
        semestres: todoHistorial ? "" : semestresSeleccionados.join(","),
      });

      const payload = data?.data || data;

      setOpciones({
        componentes: payload?.componentes || [],
        departamentos: payload?.departamentos || [],
        materias: payload?.materias || [],
      });

      console.log("Opciones cargadas:", payload);
    } catch (err) {
      console.error("No se pudieron actualizar opciones:", err);
    }
  }

  function toggleSemestre(value) {
    setTodoHistorial(false);

    setSemestresSeleccionados((prev) =>
      prev.includes(value)
        ? prev.filter((s) => s !== value)
        : [...prev, value]
    );
  }

  function filtrarLocal(filas) {
    return filas.filter((r) => {
      const mat = r.asignatura || r.materia || "";
      const comp = r.componente || "";
      const dep = r.departamento || r.descripcion_materia || "";

      const okMateria = materia.length === 0 || materia.includes(mat);
      const okDepartamento =
        departamento.length === 0 || departamento.includes(dep);

      return okMateria && okDepartamento;
    });
  }

  async function buscar() {
    if (!profesor && !todoHistorial && semestresSeleccionados.length === 0) {
      setError("VALIDACION");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data = await getConsolidado({
        profesor,
        semestres: todoHistorial ? "" : semestresSeleccionados.join(","),
      });

      if (data?.ok === false) {
        setError("BACKEND");
        return;
      }

      const nuevosResultados = filtrarLocal(normalizeArray(data));
      setResultados(nuevosResultados);

      // Guardar en historial
      const nuevaBusqueda = {
        profesor,
        semestresSeleccionados,
        todoHistorial,
        materia,
        departamento,
        timestamp: new Date().getTime(),
      };

      setHistorial((prev) => {
        const filtered = prev.filter(
          (h) =>
            h.profesor !== profesor ||
            JSON.stringify(h.semestresSeleccionados) !==
            JSON.stringify(semestresSeleccionados)
        );
        return [...filtered, nuevaBusqueda].slice(-20);
      });

      setActivePage(PAGE_KEYS.DASHBOARD);
    } catch (err) {
      setError("GENERAL");
    } finally {
      setLoading(false);
    }
  }

  function limpiarFiltros() {
    setProfesor("");
    setMateria([]);
    setDepartamento([]);
    setSemestresSeleccionados([]);
    setTodoHistorial(true);
    setResultados([]);
    setError("");
    setOpciones(INITIAL_OPTIONS);
  }

  function irAReporte() {
    setActivePage(PAGE_KEYS.REPORTES);
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

      setMensajeCarga("Archivo cargado y base histórica actualizada correctamente.");
    } catch (err) {
      setMensajeCarga(err.message || "Error cargando el archivo.");
    } finally {
      setLoading(false);
    }
  }

  function handleExportarExcel() {
    exportarExcel(resultados, profesor);
  }

  function handleExportarPDF() {
    exportarPDF(reporteRef, profesor);
  }

  function cargarBusqueda(item) {
    setProfesor(item.profesor);
    setSemestresSeleccionados(item.semestresSeleccionados || []);
    setTodoHistorial(item.todoHistorial);
    setMateria(item.materia || []);
    setDepartamento(item.departamento || []);

    setTimeout(() => {
      actualizarOpciones(item.profesor);
      buscar();
    }, 100);
  }

  function limpiarHistorial() {
    setHistorial([]);
  }

  return (
    <div
      className={`flex min-h-screen ${darkMode ? "bg-slate-950" : "bg-[#F3F7FB]"
        }`}
    >
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        darkMode={darkMode}
      />

      <main className="flex-1 p-8">
        <Header
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          resultados={resultados}
          exportarReporte={handleExportarPDF}
          activePage={activePage}
        />

        {error && (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-amber-800 flex items-start gap-3">
            <AlertTriangle size={22} className="mt-0.5" />

            <div>
              {error === "VALIDACION" && (
                <>
                  <p className="font-bold">Faltan filtros</p>
                  <p className="text-sm mt-1">
                    Debes seleccionar un profesor o al menos un semestre.
                  </p>
                </>
              )}

              {error === "BACKEND" && (
                <>
                  <p className="font-bold">Error en la consulta</p>
                  <p className="text-sm mt-1">
                    El servidor no pudo procesar la solicitud correctamente.
                  </p>
                </>
              )}

              {error === "GENERAL" && (
                <>
                  <p className="font-bold">Error inesperado</p>
                  <p className="text-sm mt-1">
                    Ocurrió un problema al consultar la información.
                  </p>
                </>
              )}
            </div>
          </div>
        )}

        <StatsGrid stats={stats} darkMode={darkMode} />

        {activePage === PAGE_KEYS.DASHBOARD && (
          <DashboardPage
            darkMode={darkMode}
            inputClass={inputClass}
            cardClass={cardClass}
            profesor={profesor}
            setProfesor={setProfesor}
            mostrarSugerencias={mostrarSugerencias}
            setMostrarSugerencias={setMostrarSugerencias}
            profesoresFiltrados={profesoresFiltrados}
            actualizarOpciones={actualizarOpciones}
            materia={materia}
            setMateria={setMateria}
            departamento={departamento}
            setDepartamento={setDepartamento}
            opciones={opciones}
            semestres={semestres}
            semestresOpen={semestresOpen}
            setSemestresOpen={setSemestresOpen}
            semestresSeleccionados={semestresSeleccionados}
            setSemestresSeleccionados={setSemestresSeleccionados}
            toggleSemestre={toggleSemestre}
            todoHistorial={todoHistorial}
            setTodoHistorial={setTodoHistorial}
            buscar={buscar}
            loading={loading || loadingInicial}
            loadingInicial={loadingInicial}
            limpiarFiltros={limpiarFiltros}
            resultados={resultados}
            irAReporte={irAReporte}
          />
        )}

        {activePage === PAGE_KEYS.REPORTES && (
          <ReportesPage
            cardClass={cardClass}
            darkMode={darkMode}
            exportarExcel={handleExportarExcel}
            exportarReporte={handleExportarPDF}
            enviarAlEquipo={enviarPDFAlEquipo}
            reporteRef={reporteRef}
            resultados={resultados}
            profesor={profesor}
          />
        )}

        {activePage === PAGE_KEYS.CARGA && (
          <CargaPage
            cardClass={cardClass}
            archivo={archivo}
            setArchivo={setArchivo}
            subirArchivo={subirArchivo}
            mensajeCarga={mensajeCarga}
          />
        )}

        {activePage === PAGE_KEYS.CALIDAD && (
          <CalidadPage
            cardClass={cardClass}
            darkMode={darkMode}
            resultados={resultados}
          />
        )}

        {activePage === PAGE_KEYS.HISTORIAL && (
          <HistorialPage
            historial={historial}
            limpiarHistorial={limpiarHistorial}
            cargarBusqueda={cargarBusqueda}
            darkMode={darkMode}
            cardClass={cardClass}
          />
        )}
      </main>
    </div>
  );
}