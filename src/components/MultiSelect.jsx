import { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function MultiSelect({
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
        <div className={`absolute z-30 mt-2 w-full max-h-64 overflow-y-auto rounded-2xl border p-3 shadow-lg ${
          darkMode
            ? "bg-slate-900 border-slate-700"
            : "bg-white border-blue-100"
        }`}>
          <label className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer border mb-2 ${
            selected.length === 0
              ? "bg-[#003B70] text-white border-[#003B70]"
              : darkMode
              ? "bg-slate-800 text-slate-200 border-slate-700"
              : "bg-slate-50 text-slate-700 border-slate-200"
          }`}>
            <input
              type="checkbox"
              checked={selected.length === 0}
              onChange={() => setSelected([])}
            />
            Todos
          </label>

          {options.map((option) => (
            <label key={option} className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer border mb-2 text-sm ${
              selected.includes(option)
                ? "bg-[#003B70] text-white border-[#003B70]"
                : darkMode
                ? "bg-slate-800 text-slate-200 border-slate-700"
                : "bg-white text-slate-600 border-slate-200 hover:bg-blue-50"
            }`}>
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