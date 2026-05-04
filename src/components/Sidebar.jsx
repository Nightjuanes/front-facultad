import {
  LayoutDashboard,
  FileText,
  Upload,
  AlertTriangle,
  History,
} from "lucide-react";
import MenuItem from "./MenuItem";
import { LOGO_URL, PAGE_KEYS } from "../constants/appConstants";

export default function Sidebar({ activePage, setActivePage, darkMode }) {
  return (
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
          active={activePage === PAGE_KEYS.DASHBOARD}
          onClick={() => setActivePage(PAGE_KEYS.DASHBOARD)}
          darkMode={darkMode}
        />

        <MenuItem
          icon={FileText}
          text="Reportes"
          active={activePage === PAGE_KEYS.REPORTES}
          onClick={() => setActivePage(PAGE_KEYS.REPORTES)}
          darkMode={darkMode}
        />

        <MenuItem
          icon={History}
          text="Historial de búsquedas"
          active={activePage === PAGE_KEYS.HISTORIAL}
          onClick={() => setActivePage(PAGE_KEYS.HISTORIAL)}
          darkMode={darkMode}
        />

        <MenuItem
          icon={Upload}
          text="Actualizar base"
          active={activePage === PAGE_KEYS.CARGA}
          onClick={() => setActivePage(PAGE_KEYS.CARGA)}
          darkMode={darkMode}
        />

        <MenuItem
          icon={AlertTriangle}
          text="Calidad de datos"
          active={activePage === PAGE_KEYS.CALIDAD}
          onClick={() => setActivePage(PAGE_KEYS.CALIDAD)}
          darkMode={darkMode}
        />
      </nav>
    </aside>

  );
}