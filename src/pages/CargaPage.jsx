import { Upload } from "lucide-react";

export default function CargaPage({
  cardClass,
  setArchivo,
  subirArchivo,
  mensajeCarga,
}) {
  return (
    <section className={`rounded-2xl border shadow-sm p-8 ${cardClass}`}>
      <h2 className="text-2xl font-bold mb-4">Actualizar Base de Datos</h2>

      <div className="flex flex-col gap-4 max-w-md">
        <input
          type="file"
          onChange={(e) => setArchivo(e.target.files[0])}
          className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />

        <button
          onClick={subirArchivo}
          className="bg-[#003B70] text-white px-5 py-3 rounded-xl flex items-center justify-center gap-2"
        >
          <Upload size={18} />
          Subir y Procesar
        </button>

        {mensajeCarga && <p className="text-sm font-medium">{mensajeCarga}</p>}
      </div>
    </section>
  );
}