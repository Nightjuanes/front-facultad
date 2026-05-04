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

export async function enviarPDFAlEquipo(reporteRef, profesor) {
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

  const pdfBlob = pdf.output("blob");

  const formData = new FormData();
  formData.append("archivo", pdfBlob, `certificado-${profesor}.pdf`);
  formData.append("profesor", profesor);

  const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5001";

  const response = await fetch(`${API_BASE}/enviar-certificado`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Error al enviar el certificado al equipo.");
  }

  return await response.json();
}