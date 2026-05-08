import{L as b}from"./index-BH49uXWq.js";const i=(e,t)=>{const a=URL.createObjectURL(e),n=document.createElement("a");n.href=a,n.download=t,document.body.appendChild(n),n.click(),n.remove(),window.setTimeout(()=>URL.revokeObjectURL(a),250)},c=e=>e.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"")||"document",E=e=>`"${String(e??"").replace(/"/g,'""')}"`,d=e=>new Date(e).toISOString().replace(/[-:]/g,"").replace(/\.\d{3}Z$/,"Z"),r=e=>e.replace(/\\/g,"\\\\").replace(/\n/g,"\\n").replace(/,/g,"\\,").replace(/;/g,"\\;"),u=async e=>{if(e.downloadUrl){const a=await b(e.downloadUrl);i(a,`releve-notes-${c(e.key)}.pdf`);return}const t=[["Matiere","Coefficient","Credits","Note","Mention","Validation"],...e.rows.map(a=>[a.matiere,a.coefficient,a.credits,a.note.toFixed(2),a.mention,a.validation?"Oui":"Non"]),["Totaux","",e.totals.credits,e.totals.average.toFixed(2),e.totals.result,""]].map(a=>a.map(n=>E(n)).join(","));i(new Blob([t.join(`
`)],{type:"text/csv;charset=utf-8;"}),`releve-notes-${c(e.key)}.csv`)},v=(e,t,a)=>{var l,m;const n=a.find(s=>s.semester===e.semester&&s.academicYear===e.academicYear)||a.find(s=>s.semester===e.semester)||a[0],o=(n==null?void 0:n.rows)??[],p=t?`${t.user.firstName} ${t.user.lastName}`.trim():"Etudiant EMSP",g=((l=t==null?void 0:t.promotion)==null?void 0:l.label)||"Promotion active",h=e.academicYear||((m=t==null?void 0:t.promotion)==null?void 0:m.academicYear)||"Annee en cours",$=`<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <title>${e.title}</title>
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
      <h1>${e.title}</h1>
      <p>Document genere a partir des donnees disponibles dans l'espace etudiant.</p>
    </div>
    <div class="meta">
      <div><strong>Etudiant</strong>${p}</div>
      <div><strong>Matricule</strong>${(t==null?void 0:t.matricule)||"Non renseigne"}</div>
      <div><strong>Formation</strong>${(t==null?void 0:t.formationName)||"EMSP"}</div>
      <div><strong>Promotion</strong>${g}</div>
      <div><strong>Annee academique</strong>${h}</div>
      <div><strong>Semestre</strong>${e.semester||"General"}</div>
    </div>
    ${o.length?`<table>
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
        ${o.map(s=>`<tr>
          <td>${s.matiere}</td>
          <td>${s.coefficient}</td>
          <td>${s.credits}</td>
          <td>${s.note.toFixed(2)}</td>
          <td>${s.mention}</td>
        </tr>`).join("")}
      </tbody>
    </table>`:"<p>Aucune note detaillee n'est encore disponible pour ce document.</p>"}
    <div class="footer">Genere le ${new Date().toLocaleString("fr-FR")}.</div>
  </body>
</html>`;i(new Blob([$],{type:"text/html;charset=utf-8;"}),`${c(e.title)}.html`)},f=(e,t="emploi-du-temps-emsp.ics")=>{const a=d(new Date().toISOString()),n=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//EMSP//Portail Etudiant//FR","CALSCALE:GREGORIAN","METHOD:PUBLISH",...e.flatMap(o=>["BEGIN:VEVENT",`UID:emsp-${o.id}@portal`,`DTSTAMP:${a}`,`DTSTART:${d(o.debut)}`,`DTEND:${d(o.fin)}`,`SUMMARY:${r(`${o.matiere} - EMSP`)}`,`DESCRIPTION:${r(`Type: ${o.type}
Enseignant: ${o.enseignant||"Equipe pedagogique"}`)}`,`LOCATION:${r(o.salle||"Campus EMSP")}`,"END:VEVENT"]),"END:VCALENDAR"];i(new Blob([n.join(`\r
`)],{type:"text/calendar;charset=utf-8;"}),t)},S=e=>`https://calendar.google.com/calendar/render?${new URLSearchParams({action:"TEMPLATE",text:`${e.matiere} - EMSP`,dates:`${d(e.debut)}/${d(e.fin)}`,details:`Type: ${e.type}
Enseignant: ${e.enseignant||"Equipe pedagogique"}`,location:e.salle||"Campus EMSP"}).toString()}`;export{v as a,u as b,f as c,i as d,S as e};
