const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5001";

async function request(endpoint, options = {}) {
  const res = await fetch(`${API_BASE}${endpoint}`, options);

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || "Error en la petición al backend.");
  }

  return await res.json();
}

export async function getProfesores() {
  return request("/profesores");
}

export async function getSemestres() {
  return request("/semestres");
}

export async function getConsolidado({ profesor, semestres }) {
  const params = new URLSearchParams();

  if (profesor) params.append("profesor", profesor);
  if (semestres) params.append("semestres", semestres);

  return request(`/consolidado?${params.toString()}`);
}

export async function getOpciones({ profesor, semestres }) {
  const params = new URLSearchParams();

  if (profesor) params.append("profesor", profesor);
  if (semestres) params.append("semestres", semestres);

  return request(`/opciones?${params.toString()}`);
}

export async function cargarExcel(archivo) {
  const formData = new FormData();
  formData.append("archivo", archivo);

  return request("/cargar", {
    method: "POST",
    body: formData,
  });
}