import { Download, Database } from "lucide-react";

export default function ReportesPage({
  cardClass,
  darkMode,
  exportarExcel,
  exportarReporte,
  reporteRef,
  resultados,
  profesor,
}) {
  return (
    <section className={`rounded-2xl border shadow-sm p-8 ${cardClass}`}>
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
          <p className={darkMode ? "text-slate-400 mt-2" : "text-slate-500 mt-2"}>
            Formato listo para enviar a Desarrollo Humano.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={exportarExcel}
            className="bg-emerald-600 text-white px-5 py-3 rounded-xl hover:bg-emerald-700 flex items-center gap-2"
          >
            <Database size={18} />
            Generar Excel
          </button>

          <button
            onClick={exportarReporte}
            className="bg-[#003B70] text-white px-5 py-3 rounded-xl hover:bg-[#002B5B] flex items-center gap-2"
          >
            <Download size={18} />
            Generar PDF
          </button>
        </div>
      </div>

      <div
        ref={reporteRef}
        className="bg-white text-black p-8 max-w-4xl mx-auto border"
      >
        <h3 className="font-bold border-b-4 border-black pb-1 mb-10">
          Logística Ingeniería
        </h3>

        <p className="italic mb-4">Buen Día</p>
        <p className="italic mb-6">Cordial Saludo</p>

        <p className="italic mb-6">
          Apreciad@s, envío la información encontrada del profesor{" "}
          <strong>{profesor || resultados[0]?.nombre_profesor || "—"}</strong>:
        </p>

        <table className="w-full border-collapse text-sm mb-10">
          <thead>
            <tr className="bg-gray-300">
              <th className="border border-black p-2">SEMESTRE</th>
              <th className="border border-black p-2">ASIGNATURA</th>
              <th className="border border-black p-2">SESIONES</th>
              <th className="border border-black p-2">DEPARTAMENTO</th>
            </tr>
          </thead>

          <tbody>
            {resultados.length > 0 ? (
              resultados.map((r, index) => (
                <tr key={index}>
                  <td className="border border-black p-2">
                    {r.semestre || r.ciclo_lectivo}
                  </td>
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
              ))
            ) : (
              <tr>
                <td
                  colSpan="4"
                  className="border border-black p-4 text-center text-gray-500"
                >
                  No hay datos seleccionados para el reporte.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <p className="italic mb-4">Gracias por su amable atención.</p>
        <p className="italic mb-10">Sin otro particular,</p>

        <div className="flex items-start gap-5 mt-8">
          <img
          src="/logo-sabana.png"
          alt="Universidad de La Sabana"
          className="w-16 h-20 object-contain"
          />

          <div>
            <p className="text-[#003B70] font-bold text-lg leading-tight">
              SANDRA TORRES
            </p>
            <p>Gestora Logística</p>
            <p>Facultad de Ingeniería</p>
            <p>Universidad de La Sabana</p>
          </div>
        </div>
      </div>
    </section>
  );
}