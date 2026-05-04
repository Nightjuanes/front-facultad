import * as XLSX from "xlsx-js-style";

export function exportarExcel(resultados, profesor) {
  if (resultados.length === 0) return;

  const data = resultados.map((r) => ({
    SEMESTRE: r.semestre || r.ciclo_lectivo || "",
    ASIGNATURA: r.asignatura || r.materia || "",
    SESIONES: r.sesiones || r.horas || "",
    DEPARTAMENTO: r.departamento || "",
    COMPONENTE: r.componente || "",
    PROFESOR: r.nombre_profesor || r.profesor || profesor || "",
    FECHAS: `${r.fecha_inicio || ""} - ${r.fecha_fin || ""}`,
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);

  worksheet["!cols"] = [
    { wch: 18 },
    { wch: 45 },
    { wch: 12 },
    { wch: 30 },
    { wch: 25 },
    { wch: 35 },
    { wch: 25 },
  ];

  const range = XLSX.utils.decode_range(worksheet["!ref"]);

  const borderStyle = {
    top: { style: "thin", color: { rgb: "000000" } },
    bottom: { style: "thin", color: { rgb: "000000" } },
    left: { style: "thin", color: { rgb: "000000" } },
    right: { style: "thin", color: { rgb: "000000" } },
  };

  for (let row = range.s.r; row <= range.e.r; row++) {
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });

      if (!worksheet[cellAddress]) continue;

      worksheet[cellAddress].s = {
        border: borderStyle,
        alignment: {
          vertical: "center",
          horizontal: row === 0 ? "center" : "left",
          wrapText: true,
        },
      };

      if (row === 0) {
        worksheet[cellAddress].v = String(
          worksheet[cellAddress].v
        ).toUpperCase();

        worksheet[cellAddress].s = {
          ...worksheet[cellAddress].s,
          font: {
            bold: true,
            color: { rgb: "000000" },
          },
          fill: {
            fgColor: { rgb: "D9D9D9" },
          },
        };
      }
    }
  }

  worksheet["!autofilter"] = {
    ref: worksheet["!ref"],
  };

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Reporte");

  XLSX.writeFile(workbook, `reporte_${profesor || "consolidado"}.xlsx`);
}