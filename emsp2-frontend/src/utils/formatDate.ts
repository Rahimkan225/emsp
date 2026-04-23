// Point d'entree central des utilitaires.
export function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("fr-FR");
}

export function formatLongDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatDateTime(isoDate: string): string {
  return new Date(isoDate).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatCurrency(value: number): string {
  return `${value.toLocaleString("fr-FR")} FCFA`;
}
