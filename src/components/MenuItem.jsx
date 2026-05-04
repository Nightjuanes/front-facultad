export default function MenuItem({ icon: Icon, text, active, onClick, darkMode }) {
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