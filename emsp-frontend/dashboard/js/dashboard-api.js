function parseApiError(error, fallbackMessage = "Une erreur est survenue.") {
  if (!error) return fallbackMessage;
  const data = error.data || {};
  if (typeof data.detail === "string") return data.detail;
  if (typeof data.message === "string") return data.message;
  if (typeof data === "object") {
    const flat = Object.values(data).flat().filter(Boolean);
    if (flat.length) return flat.join(", ");
  }
  return fallbackMessage;
}

function setLoadingButton(buttonId, textId, spinnerId, loading, loadingText = "Traitement...") {
  const button = document.getElementById(buttonId);
  const text = document.getElementById(textId);
  const spinner = document.getElementById(spinnerId);
  if (button) button.disabled = loading;
  if (text && loading) {
    text.dataset.defaultText = text.dataset.defaultText || text.textContent;
    text.textContent = loadingText;
  } else if (text && text.dataset.defaultText) {
    text.textContent = text.dataset.defaultText;
  }
  if (spinner) spinner.classList.toggle("d-none", !loading);
}

function savePageState(key, state) {
  try {
    sessionStorage.setItem(`emsp-dashboard:${key}`, JSON.stringify(state));
  } catch (_e) {
    // ignore storage failures
  }
}

function readPageState(key, fallback = {}) {
  try {
    const raw = sessionStorage.getItem(`emsp-dashboard:${key}`);
    return raw ? { ...fallback, ...JSON.parse(raw) } : fallback;
  } catch (_e) {
    return fallback;
  }
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatCurrency(value) {
  return `${Number(value || 0).toLocaleString("fr-FR")} FCFA`;
}

function formatDateTime(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getAdminStatusBadge(status, label) {
  const classes = {
    submitted: "bg-warning",
    under_review: "bg-info",
    accepted: "bg-success",
    rejected: "bg-danger",
    active: "bg-success",
    inactive: "bg-danger",
  };
  const labels = {
    submitted: "Soumis",
    under_review: "En examen",
    accepted: "Confirmes",
    rejected: "Refuses",
    active: "Actif",
    inactive: "Suspendu",
  };
  const badgeClass = classes[status] || "bg-secondary";
  return `<span class="badge ${badgeClass} rounded-pill">${escapeHtml(label || labels[status] || status || "-")}</span>`;
}
