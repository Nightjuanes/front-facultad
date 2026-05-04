import { Users, Clock, BookOpen, CalendarDays } from "lucide-react";

export function buildStats(resultados, periodoTexto) {
  const totalHoras = resultados.reduce(
    (acc, r) =>
      acc +
      Number(
        r.horas ||
          r.horas_dictadas ||
          r.horas_semestre ||
          r.sesiones ||
          0
      ),
    0
  );

  const profesoresSet = new Set(
    resultados
      .map((r) => r.nombre_profesor || r.profesor || r.nombre)
      .filter(Boolean)
  );

  const materiasSet = new Set(
    resultados
      .map((r) => r.materia || r.asignatura)
      .filter(Boolean)
  );

  return [
    {
      title: "Profesores",
      value: profesoresSet.size || "—",
      icon: Users,
    },
    {
      title: "Horas certificables",
      value: totalHoras ? totalHoras.toLocaleString("es-CO") : "—",
      icon: Clock,
    },
    {
      title: "Materias consolidadas",
      value: materiasSet.size || "—",
      icon: BookOpen,
    },
    {
      title: "Periodos",
      value: periodoTexto,
      icon: CalendarDays,
    },
  ];
}