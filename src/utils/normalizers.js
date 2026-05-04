export function normalizeArray(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

export function getProfesorValue(p) {
  if (typeof p === "string") return p;
  return p?.profesor || p?.nombre_profesor || p?.nombre || "";
}

export function getSemestreValue(s) {
  if (typeof s === "string") return s;
  return s?.semestre || s?.ciclo_lectivo || "";
}