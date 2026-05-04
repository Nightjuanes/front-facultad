export default function StatCard({ title, value, icon: Icon, darkMode }) {
  return (
    <div className={`rounded-2xl shadow-sm border p-5 ${
      darkMode
        ? "bg-slate-900 border-slate-700"
        : "bg-white border-blue-100"
    }`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={darkMode ? "text-sm text-slate-400" : "text-sm text-slate-500"}>
            {title}
          </p>
          <h2 className={`text-2xl font-bold mt-1 ${
            darkMode ? "text-white" : "text-[#002B5B]"
          }`}>
            {value}
          </h2>
        </div>
        <div className={
          darkMode
            ? "bg-slate-800 text-blue-300 p-3 rounded-xl"
            : "bg-blue-50 text-[#003B70] p-3 rounded-xl"
        }>
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
}