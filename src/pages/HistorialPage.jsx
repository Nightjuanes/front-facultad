import { History, Search, Trash2, ArrowRight } from "lucide-react";

export default function HistorialPage({ 
  historial, 
  limpiarHistorial, 
  cargarBusqueda, 
  darkMode,
  cardClass 
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-[#002B5B]'}`}>
            Historial de búsquedas
          </h2>
          <p className={darkMode ? "text-slate-400" : "text-slate-500"}>
            Vuelve a consultar búsquedas anteriores rápidamente.
          </p>
        </div>
        
        {historial.length > 0 && (
          <button 
            onClick={limpiarHistorial}
            className="flex items-center gap-2 text-red-500 hover:text-red-600 font-medium transition-colors"
          >
            <Trash2 size={18} />
            Borrar historial
          </button>
        )}
      </div>

      {historial.length === 0 ? (
        <div className={`rounded-2xl border p-20 text-center ${cardClass}`}>
          <div className="bg-slate-100 dark:bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <History className="text-slate-400" size={32} />
          </div>
          <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>
            No hay búsquedas recientes
          </h3>
          <p className="text-slate-500 max-w-xs mx-auto">
            Las búsquedas que realices en el dashboard aparecerán aquí automáticamente.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {[...historial].reverse().map((item, index) => (
            <div 
              key={index}
              className={`rounded-2xl border p-5 flex items-center justify-between group transition-all-custom hover:shadow-md ${cardClass}`}
            >
              <div className="flex gap-4 items-start">
                <div className={`mt-1 p-2 rounded-lg ${darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                  <Search size={20} />
                </div>
                
                <div>
                  <h4 className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-[#002B5B]'}`}>
                    {item.profesor || "Todos los profesores"}
                  </h4>
                  
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                    {item.semestresSeleccionados && item.semestresSeleccionados.length > 0 ? (
                      <span className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-slate-500 dark:text-slate-400">
                        {item.semestresSeleccionados.length} semestres
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-slate-500 dark:text-slate-400">
                        Todo el historial
                      </span>
                    )}
                    {item.materia && item.materia.length > 0 && (
                      <span className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-slate-500 dark:text-slate-400">
                        {item.materia.length} materias
                      </span>
                    )}
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                      {new Date(item.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => cargarBusqueda(item)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all-custom ${
                  darkMode 
                    ? 'bg-slate-800 text-blue-400 hover:bg-slate-700' 
                    : 'bg-blue-50 text-[#003B70] hover:bg-blue-100'
                }`}
              >
                Cargar búsqueda
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
