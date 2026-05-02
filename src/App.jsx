import { useMemo, useState } from "react";
import {
  Search,
  LayoutDashboard,
  GraduationCap,
  FileText,
  Download,
  AlertTriangle,
  Clock,
  Users,
  BookOpen,
  CalendarDays,
  X,
} from "lucide-react";
import "./App.css";

const registros = [
  {
    profesor: "Gabriel Soche",
    componente: "CLAS",
    materia: "Física Mecánica",
    semestre: "2025-2",
    horas: 80,
    departamento: "1221 - Ciencias Básicas",
    fechas: "2025-07-21 / 2025-11-15",
  },
  {
    profesor: "María Fernanda Ruiz",
    componente: "CLAS",
    materia: "Cálculo Diferencial",
    semestre: "2024-1",
    horas: 128,
    departamento: "1304 - Matemáticas",
    fechas: "2024-01-22 / 2024-05-18",
  },
  {
    profesor: "Carlos Andrés Pérez",
    componente: "LAB",
    materia: "Gestión de Proyectos",
    semestre: "2023-2",
    horas: 64,
    departamento: "2210 - Ingeniería Industrial",
    fechas: "2023-07-24 / 2023-11-18",
  },
  {
    profesor: "Gabriel Soche",
    componente: "LAB",
    materia: "Laboratorio Física Mecánica",
    semestre: "2025-1",
    horas: 32,
    departamento: "1221 - Ciencias Básicas",
    fechas: "2025-01-20 / 2025-05-17",
  },
];

const stats = [
  { title: "Profesores", value: "120", icon: Users },
  { title: "Horas certificables", value: "12.500", icon: Clock },
  { title: "Materias consolidadas", value: "340", icon: BookOpen },
  { title: "Periodos", value: "2016-2 / 2026-1", icon: CalendarDays },
];

function Sidebar() {
  return (
    <aside className="w-72 min-h-screen bg-slate-950 text-white px-6 py-6">
      <div className="mb-10 flex items-center gap-3">
        <div className="bg-emerald-500 p-2 rounded-xl">
          <GraduationCap size={24} />
        </div>
        <div>
          <h1 className="font-bold text-lg">CertiDoc</h1>
          <p className="text-xs text-slate-400">Facultad de Ingeniería</p>
        </div>
      </div>

      <nav className="space-y-2">
        <MenuItem icon={LayoutDashboard} text="Dashboard" active />
        <MenuItem icon={Search} text="Consulta docente" />
        <MenuItem icon={FileText} text="Reportes" />
        <MenuItem icon={AlertTriangle} text="Calidad de datos" />
      </nav>
    </aside>
  );
}

function MenuItem({ icon: Icon, text, active }) {
  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition ${
        active
          ? "bg-emerald-500 text-white"
          : "text-slate-300 hover:bg-slate-800"
      }`}
    >
      <Icon size={18} />
      <span className="text-sm font-medium">{text}</span>
    </div>
  );
}

function StatCard({ title, value, icon: Icon }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <h2 className="text-2xl font-bold text-slate-900 mt-1">{value}</h2>
        </div>
        <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl">
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
}

function App() {
  const [profesor, setProfesor] = useState("");
  const [semestre, setSemestre] = useState("");
  const [componente, setComponente] = useState("");
  const [materia, setMateria] = useState("");
  const [departamento, setDepartamento] = useState("");

  const profesores = [...new Set(registros.map((r) => r.profesor))];
  const semestres = [...new Set(registros.map((r) => r.semestre))];
  const departamentos = [...new Set(registros.map((r) => r.departamento))];

  const resultados = useMemo(() => {
    return registros.filter((r) => {
      return (
        r.profesor.toLowerCase().includes(profesor.toLowerCase()) &&
        r.materia.toLowerCase().includes(materia.toLowerCase()) &&
        (semestre === "" || r.semestre === semestre) &&
        (componente === "" || r.componente === componente) &&
        (departamento === "" || r.departamento === departamento)
      );
    });
  }, [profesor, materia, semestre, componente, departamento]);

  const limpiarFiltros = () => {
    setProfesor("");
    setSemestre("");
    setComponente("");
    setMateria("");
    setDepartamento("");
  };

  return (
    <div className="flex bg-slate-100 min-h-screen">
      <Sidebar />

      <main className="flex-1 p-8">
        <section className="mb-8 flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-emerald-600">
              Sistema de consulta automatizado
            </p>
            <h1 className="text-3xl font-bold text-slate-950 mt-1">
              Certificación Docente
            </h1>
            <p className="text-slate-500 mt-2 max-w-3xl">
              Consulta histórica de programación académica de pregrado,
              consolidación de materias, horas dictadas y generación de reportes.
            </p>
          </div>

          <button className="flex items-center gap-2 bg-slate-950 text-white px-5 py-3 rounded-xl hover:bg-slate-800">
            <Download size={18} />
            Exportar reporte
          </button>
        </section>

        <section className="grid grid-cols-4 gap-5 mb-8">
          {stats.map((item) => (
            <StatCard key={item.title} {...item} />
          ))}
        </section>

        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Consulta avanzada
              </h2>
              <p className="text-sm text-slate-500">
                Puedes combinar varios filtros al mismo tiempo.
              </p>
            </div>

            <button
              onClick={limpiarFiltros}
              className="flex items-center gap-2 text-slate-500 hover:text-slate-900"
            >
              <X size={16} />
              Limpiar filtros
            </button>
          </div>

          <div className="grid grid-cols-6 gap-4">
            <div className="col-span-2">
              <input
                list="profesores"
                value={profesor}
                onChange={(e) => setProfesor(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Buscar profesor..."
              />
              <datalist id="profesores">
                {profesores.map((p) => (
                  <option key={p} value={p} />
                ))}
              </datalist>
            </div>

            <input
              value={materia}
              onChange={(e) => setMateria(e.target.value)}
              className="border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Materia"
            />

            <select
              value={semestre}
              onChange={(e) => setSemestre(e.target.value)}
              className="border border-slate-300 rounded-xl px-4 py-3"
            >
              <option value="">Todos los semestres</option>
              {semestres.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <select
              value={componente}
              onChange={(e) => setComponente(e.target.value)}
              className="border border-slate-300 rounded-xl px-4 py-3"
            >
              <option value="">Componente</option>
              <option value="CLAS">CLAS - Clase</option>
              <option value="LAB">LAB - Laboratorio</option>
            </select>

            <select
              value={departamento}
              onChange={(e) => setDepartamento(e.target.value)}
              className="border border-slate-300 rounded-xl px-4 py-3"
            >
              <option value="">Departamento</option>
              {departamentos.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Resultados de certificación
              </h2>
              <p className="text-sm text-slate-500">
                Mostrando {resultados.length} registro(s) con los 7 campos exactos.
              </p>
            </div>

            <button className="bg-slate-100 text-slate-700 px-4 py-2 rounded-xl hover:bg-slate-200">
              Generar certificado
            </button>
          </div>

          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="text-left px-6 py-4">Nombre del profesor</th>
                <th className="text-left px-6 py-4">Componente</th>
                <th className="text-left px-6 py-4">Materia</th>
                <th className="text-left px-6 py-4">Semestre</th>
                <th className="text-left px-6 py-4">Horas</th>
                <th className="text-left px-6 py-4">Departamento</th>
                <th className="text-left px-6 py-4">Fechas</th>
              </tr>
            </thead>

            <tbody>
              {resultados.map((r, index) => (
                <tr key={index} className="border-t border-slate-100">
                  <td className="px-6 py-4 font-medium text-slate-900">
                    {r.profesor}
                  </td>
                  <td className="px-6 py-4">{r.componente}</td>
                  <td className="px-6 py-4">{r.materia}</td>
                  <td className="px-6 py-4">{r.semestre}</td>
                  <td className="px-6 py-4 font-semibold">{r.horas}</td>
                  <td className="px-6 py-4">{r.departamento}</td>
                  <td className="px-6 py-4">{r.fechas}</td>
                </tr>
              ))}

              {resultados.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-10 text-center text-slate-500">
                    No se encontraron resultados con los filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}

export default App;