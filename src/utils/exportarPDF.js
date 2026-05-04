import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export async function exportarPDF(reporteRef, profesor) {
  if (!reporteRef.current) return;

  const canvas = await html2canvas(reporteRef.current, {
    scale: 2,
    backgroundColor: "#ffffff",
  });

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF("p", "mm", "a4");

  const pageWidth = pdf.internal.pageSize.getWidth();
  const imgHeight = (canvas.height * pageWidth) / canvas.width;

  pdf.addImage(imgData, "PNG", 0, 0, pageWidth, imgHeight);
  pdf.save(`reporte-${profesor || "certificacion-docente"}.pdf`);
}