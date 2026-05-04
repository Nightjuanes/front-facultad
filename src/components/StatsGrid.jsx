import StatCard from "./StatCard";

export default function StatsGrid({ stats, darkMode }) {
  return (
    <section className="grid grid-cols-4 gap-5 mb-8">
      {stats.map((item) => (
        <StatCard key={item.title} {...item} darkMode={darkMode} />
      ))}
    </section>
  );
}