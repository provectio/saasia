const JOB_FUNCTION_LABELS = {
  dirigeant: "Dirigeant / Direction générale",
  dsi: "DSI / RSSI / IT Manager",
  daf: "DAF / Finance",
  rh: "RH / Office Manager",
  metier: "Responsable métier",
  autre: "Autre",
};

export function formatJobFunction(value) {
  const key = String(value ?? "").trim();
  if (!key) return "—";
  return JOB_FUNCTION_LABELS[key] ?? key;
}
