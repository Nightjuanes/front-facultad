const API_URL = "http://127.0.0.1:5001";

async function request(endpoint, options = {}) {
  console.log("Llamando API:", `${API_URL}${endpoint}`);

  const res = await fetch(`${API_URL}${endpoint}`, options);
  const data = await res.json();

  if (!res.ok || data.ok === false) {
    throw new Error(data.error || `Error ${res.status}: ${res.statusText}`);
  }

  return data.data ?? data;
}

export function getHealth() {
  return request("/health");
}

export function getSemestres() {
  return request("/semestres");
}

export function getProfesores() {
  return request("/profesores");
}

export function getOpciones(filters = {}) {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.append(key, value);
  });

  return request(`/opciones?${params.toString()}`);
}

export function getConsolidado(filters = {}) {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.append(key, value);
  });

  return request(`/consolidado?${params.toString()}`);
}

export function cargarExcel(file) {
  const formData = new FormData();
  formData.append("archivo", file);

  return request("/cargar", {
    method: "POST",
    body: formData,
  });
}