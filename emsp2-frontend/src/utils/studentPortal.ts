import type { EtudiantProfile, NotesSemesterGroup, ScheduleItem, StudentDocumentItem } from "../types";
import { downloadAuthenticatedBlob } from "../api/portalApi";

export const downloadBlob = (blob: Blob, fileName: string) => {
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 250);
};

const slugify = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "document";

const csvEscape = (value: string | number | boolean | undefined) => `"${String(value ?? "").replace(/"/g, '""')}"`;

const formatTimestamp = (iso: string) =>
  new Date(iso)
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "Z");

const escapeIcs = (value: string) =>
  value
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");

export const downloadNotesReport = async (group: NotesSemesterGroup) => {
  if (group.downloadUrl) {
    const blob = await downloadAuthenticatedBlob(group.downloadUrl);
    downloadBlob(blob, `releve-notes-${slugify(group.key)}.pdf`);
    return;
  }

  const csvLines = [
    ["Matiere", "Coefficient", "Credits", "Note", "Mention", "Validation"],
    ...group.rows.map((row) => [
      row.matiere,
      row.coefficient,
      row.credits,
      row.note.toFixed(2),
      row.mention,
      row.validation ? "Oui" : "Non",
    ]),
    ["Totaux", "", group.totals.credits, group.totals.average.toFixed(2), group.totals.result, ""],
  ].map((row) => row.map((value) => csvEscape(value)).join(","));

  downloadBlob(new Blob([csvLines.join("\n")], { type: "text/csv;charset=utf-8;" }), `releve-notes-${slugify(group.key)}.csv`);
};

export const downloadStudentDocument = (documentItem: StudentDocumentItem, profile: EtudiantProfile | undefined, groups: NotesSemesterGroup[]) => {
  const currentGroup =
    groups.find((group) => group.semester === documentItem.semester && group.academicYear === documentItem.academicYear) ||
    groups.find((group) => group.semester === documentItem.semester) ||
    groups[0];
  const rows = currentGroup?.rows ?? [];
  const fullName = profile ? `${profile.user.firstName} ${profile.user.lastName}`.trim() : "Etudiant EMSP";
  const promotion = profile?.promotion?.label || "Promotion active";
  const academicYear = documentItem.academicYear || profile?.promotion?.academicYear || "Annee en cours";

  const html = `<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <title>${documentItem.title}</title>
    <style>
      body { font-family: Arial, sans-serif; color: #1e293b; margin: 40px; }
      .header { margin-bottom: 24px; }
      .eyebrow { color: #16a34a; font-size: 12px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; }
      h1 { margin: 12px 0 8px; font-size: 28px; }
      .meta { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin: 20px 0 28px; }
      .meta div { border: 1px solid #e2e8f0; border-radius: 14px; padding: 12px 14px; }
      .meta strong { display: block; margin-bottom: 6px; font-size: 12px; text-transform: uppercase; color: #64748b; }
      table { width: 100%; border-collapse: collapse; margin-top: 20px; }
      th, td { border: 1px solid #e2e8f0; padding: 10px 12px; text-align: left; }
      th { background: #f8fafc; }
      .footer { margin-top: 28px; font-size: 12px; color: #64748b; }
    </style>
  </head>
  <body>
    <div class="header">
      <div class="eyebrow">EMSP</div>
      <h1>${documentItem.title}</h1>
      <p>Document genere a partir des donnees disponibles dans l'espace etudiant.</p>
    </div>
    <div class="meta">
      <div><strong>Etudiant</strong>${fullName}</div>
      <div><strong>Matricule</strong>${profile?.matricule || "Non renseigne"}</div>
      <div><strong>Formation</strong>${profile?.formationName || "EMSP"}</div>
      <div><strong>Promotion</strong>${promotion}</div>
      <div><strong>Annee academique</strong>${academicYear}</div>
      <div><strong>Semestre</strong>${documentItem.semester || "General"}</div>
    </div>
    ${
      rows.length
        ? `<table>
      <thead>
        <tr>
          <th>Matiere</th>
          <th>Coefficient</th>
          <th>Credits</th>
          <th>Note</th>
          <th>Mention</th>
        </tr>
      </thead>
      <tbody>
        ${rows
          .map(
            (row) => `<tr>
          <td>${row.matiere}</td>
          <td>${row.coefficient}</td>
          <td>${row.credits}</td>
          <td>${row.note.toFixed(2)}</td>
          <td>${row.mention}</td>
        </tr>`,
          )
          .join("")}
      </tbody>
    </table>`
        : "<p>Aucune note detaillee n'est encore disponible pour ce document.</p>"
    }
    <div class="footer">Genere le ${new Date().toLocaleString("fr-FR")}.</div>
  </body>
</html>`;

  downloadBlob(new Blob([html], { type: "text/html;charset=utf-8;" }), `${slugify(documentItem.title)}.html`);
};

export const downloadScheduleCalendar = (items: ScheduleItem[], fileName = "emploi-du-temps-emsp.ics") => {
  const now = formatTimestamp(new Date().toISOString());
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//EMSP//Portail Etudiant//FR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    ...items.flatMap((item) => [
      "BEGIN:VEVENT",
      `UID:emsp-${item.id}@portal`,
      `DTSTAMP:${now}`,
      `DTSTART:${formatTimestamp(item.debut)}`,
      `DTEND:${formatTimestamp(item.fin)}`,
      `SUMMARY:${escapeIcs(`${item.matiere} - EMSP`)}`,
      `DESCRIPTION:${escapeIcs(`Type: ${item.type}\nEnseignant: ${item.enseignant || "Equipe pedagogique"}`)}`,
      `LOCATION:${escapeIcs(item.salle || "Campus EMSP")}`,
      "END:VEVENT",
    ]),
    "END:VCALENDAR",
  ];

  downloadBlob(new Blob([lines.join("\r\n")], { type: "text/calendar;charset=utf-8;" }), fileName);
};

export const buildGoogleCalendarUrl = (item: ScheduleItem) => {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `${item.matiere} - EMSP`,
    dates: `${formatTimestamp(item.debut)}/${formatTimestamp(item.fin)}`,
    details: `Type: ${item.type}\nEnseignant: ${item.enseignant || "Equipe pedagogique"}`,
    location: item.salle || "Campus EMSP",
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};
