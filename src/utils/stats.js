import { Users, Clock, BookOpen, CalendarDays } from "lucide-react";

export function buildStats(resultados, periodoTexto, profesorBusqueda) {
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

  let nombreMostrado = "—";
  if (profesorBusqueda) {
    nombreMostrado = profesorBusqueda;
  } else if (profesoresSet.size === 1) {
    nombreMostrado = Array.from(profesoresSet)[0];
  } else if (profesoresSet.size > 1) {
    nombreMostrado = `${profesoresSet.size} Profesores`;
  }

  return [
    {
      title: "Profesores",
      value: nombreMostrado,
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