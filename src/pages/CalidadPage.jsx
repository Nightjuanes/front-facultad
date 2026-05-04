import { AlertTriangle, Copy, FileWarning, Layers, SearchX } from "lucide-react";

function getValue(row, keys) {
  for (const key of keys) {
    if (row?.[key] !== undefined && row?.[key] !== null && row?.[key] !== "") {
      return row[key];
    }
  }
  return "";
}

function normalizeText(text) {
  return String(text || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toUpperCase();
}

function buildQualityAlerts(resultados) {
  const alerts = [];

  const seen = new Map();
  const materiaDeptoMap = new Map();
  const materiasNormalizadas = new Map();

  resultados.forEach((row, index) => {
    const profesor = getValue(row, ["nombre_profesor", "profesor", "nombre"]);
    const materia = getValue(row, ["asignatura", "materia"]);
    const semestre = getValue(row, ["semestre", "ciclo_lectivo"]);
    const sesiones = getValue(row, ["sesiones", "horas", "horas_dictadas"]);
    const departamento = getValue(row, ["departamento", "descripcion_materia"]);

    const camposFaltantes = [];

    if (!profesor) camposFaltantes.push("profesor");
    if (!materia) camposFaltantes.push("materia");
    if (!semestre) camposFaltantes.push("semestre");
    if (!sesiones) camposFaltantes.push("sesiones");
    if (!departamento) camposFaltantes.push("departamento");

    if (camposFaltantes.length > 0) {
      alerts.push({
        tipo: "Registro incompleto",
        profesor,
        materia,
        semestre,
        problema: `Faltan campos: ${camposFaltantes.join(", ")}`,
        recomendacion: "Completar la información en la base histórica.",
      });
    }

    const sesionesNumber = Number(sesiones);

    if (
      sesiones !== "" &&
      (Number.isNaN(sesionesNumber) || sesionesNumber <= 0 || sesionesNumber > 200)
    ) {
      alerts.push({
        tipo: "Sesiones sospechosas",
        profesor,
        materia,
        semestre,
        problema: `Valor de sesiones inusual: ${sesiones}`,
        recomendacion: "Validar si las sesiones cargadas son correctas.",
      });
    }

    const duplicateKey = [
      normalizeText(profesor),
      normalizeText(materia),
      normalizeText(semestre),
      normalizeText(sesiones),
      normalizeText(departamento),
    ].join("|");

    if (seen.has(duplicateKey)) {
      alerts.push({
        tipo: "Posible duplicado",
        profesor,
        materia,
        semestre,
        problema: `Registro similar al de la fila ${seen.get(duplicateKey) + 1}.`,
        recomendacion: "Revisar si es una fila repetida.",
      });
    } else {
      seen.set(duplicateKey, index);
    }

    const materiaKey = normalizeText(materia);

    if (materiaKey && departamento) {
      if (!materiaDeptoMap.has(materiaKey)) {
        materiaDeptoMap.set(materiaKey, new Set());
      }

      materiaDeptoMap.get(materiaKey).add(normalizeText(departamento));
    }

    if (materiaKey) {
      if (!materiasNormalizadas.has(materiaKey)) {
        materiasNormalizadas.set(materiaKey, new Set());
      }

      materiasNormalizadas.get(materiaKey).add(materia);
    }
  });

  materiaDeptoMap.forEach((departamentos, materiaKey) => {
    if (departamentos.size > 1) {
      alerts.push({
        tipo: "Departamento inconsistente",
        profesor: "—",
        materia: materiaKey,
        semestre: "—",
        problema: "La misma materia aparece asociada a más de un departamento.",
        recomendacion: "Unificar el departamento correcto para esa materia.",
      });
    }
  });

  materiasNormalizadas.forEach((variantes, materiaKey) => {
    if (variantes.size > 1) {
      alerts.push({
        tipo: "Materia con nombres similares",
        profesor: "—",
        materia: materiaKey,
        semestre: "—",
        problema: `Variantes detectadas: ${Array.from(variantes).join(" / ")}`,
        recomendacion: "Estandarizar el nombre de la materia.",
      });
    }
  });

  return alerts;
}

function QualityCard({ title, value, icon: Icon, darkMode }) {
  return (
    <div
      className={`rounded-2xl border p-5 shadow-sm ${
        darkMode
          ? "bg-slate-900 border-slate-700"
          : "bg-white border-blue-100"
      }`}
    >
      <div className="flex justify-between items-center">
        <div>
          <p className={darkMode ? "text-slate-400 text-sm" : "text-slate-500 text-sm"}>
            {title}
          </p>
          <h3
            className={`text-2xl font-bold mt-1 ${
              darkMode ? "text-white" : "text-[#002B5B]"
            }`}
          >
            {value}
          </h3>
        </div>

        <div
          className={
            darkMode
              ? "bg-slate-800 text-amber-300 p-3 rounded-xl"
              : "bg-amber-50 text-amber-600 p-3 rounded-xl"
          }
        >
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
}

export default function CalidadPage({ cardClass, darkMode, resultados }) {
  const alerts = buildQualityAlerts(resultados);

  const incompletos = alerts.filter((a) => a.tipo === "Registro incompleto").length;
  const duplicados = alerts.filter((a) => a.tipo === "Posible duplicado").length;
  const sesiones = alerts.filter((a) => a.tipo === "Sesiones sospechosas").length;
  const inconsistencias = alerts.filter(
    (a) =>
      a.tipo === "Departamento inconsistente" ||
      a.tipo === "Materia con nombres similares"
  ).length;

  return (
    <section className={`rounded-2xl border shadow-sm p-8 ${cardClass}`}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2 text-amber-600 flex items-center gap-2">
          <AlertTriangle />
          Revisión de Calidad
        </h2>

        <p className={darkMode ? "text-slate-400" : "text-slate-600"}>
          Detecta posibles problemas en los datos consultados antes de generar
          certificados.
        </p>
      </div>

      <div className="grid grid-cols-4 gap-5 mb-8">
        <QualityCard
          title="Registros incompletos"
          value={incompletos}
          icon={FileWarning}
          darkMode={darkMode}
        />

        <QualityCard
          title="Posibles duplicados"
          value={duplicados}
          icon={Copy}
          darkMode={darkMode}
        />

        <QualityCard
          title="Sesiones sospechosas"
          value={sesiones}
          icon={SearchX}
          darkMode={darkMode}
        />

        <QualityCard
          title="Inconsistencias"
          value={inconsistencias}
          icon={Layers}
          darkMode={darkMode}
        />
      </div>

      <div
        className={`rounded-2xl border overflow-hidden ${
          darkMode ? "border-slate-700" : "border-blue-100"
        }`}
      >
        <div
          className={`p-5 border-b ${
            darkMode ? "border-slate-700" : "border-blue-100"
          }`}
        >
          <h3
            className={`font-bold ${
              darkMode ? "text-white" : "text-[#002B5B]"
            }`}
          >
            Alertas detectadas
          </h3>
          <p className={darkMode ? "text-slate-400 text-sm" : "text-slate-500 text-sm"}>
            Tabla con problemas potenciales y recomendaciones.
          </p>
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
                <th className="text-left px-5 py-4">Tipo</th>
                <th className="text-left px-5 py-4">Profesor</th>
                <th className="text-left px-5 py-4">Materia</th>
                <th className="text-left px-5 py-4">Semestre</th>
                <th className="text-left px-5 py-4">Problema</th>
                <th className="text-left px-5 py-4">Recomendación</th>
              </tr>
            </thead>

            <tbody>
              {alerts.length > 0 ? (
                alerts.map((alert, index) => (
                  <tr
                    key={index}
                    className={
                      darkMode
                        ? "border-t border-slate-700"
                        : "border-t border-slate-100"
                    }
                  >
                    <td className="px-5 py-4 font-semibold text-amber-600">
                      {alert.tipo}
                    </td>
                    <td className="px-5 py-4">{alert.profesor || "—"}</td>
                    <td className="px-5 py-4">{alert.materia || "—"}</td>
                    <td className="px-5 py-4">{alert.semestre || "—"}</td>
                    <td className="px-5 py-4">{alert.problema}</td>
                    <td className="px-5 py-4">{alert.recomendacion}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="px-5 py-10 text-center text-slate-500"
                  >
                    No se detectaron problemas en los datos consultados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}