import SurfaceCard from "../../../components/dashboard/SurfaceCard";
import { useEtudiantMe, useStudentSchedule } from "../../../hooks/useStudentPortal";
import { buildGoogleCalendarUrl, downloadScheduleCalendar } from "../../../utils/studentPortal";

const dayLabel = (iso: string) =>
  new Date(iso).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "2-digit",
    month: "short",
  });

const timeLabel = (iso: string) =>
  new Date(iso).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });

const StudentSchedulePage = () => {
  const { data: profile } = useEtudiantMe();
  const { data = [], isLoading } = useStudentSchedule();
  const sortedItems = [...data].sort((left, right) => new Date(left.debut).getTime() - new Date(right.debut).getTime());
  const grouped = sortedItems.reduce<Record<string, typeof sortedItems>>((accumulator, item) => {
    const key = dayLabel(item.debut);
    accumulator[key] = accumulator[key] || [];
    accumulator[key].push(item);
    return accumulator;
  }, {});
  const nextUpcomingCourse = sortedItems.find((item) => new Date(item.fin).getTime() >= Date.now()) || sortedItems[0];

  if (isLoading) {
    return <div className="h-96 animate-pulse rounded-3xl bg-white" />;
  }

  if (!sortedItems.length) {
    return (
      <SurfaceCard className="p-8 text-center text-slate-500">
        Aucun cours n'est programme pour votre promotion pour le moment.
      </SurfaceCard>
    );
  }

  return (
    <div className="space-y-6">
      <SurfaceCard className="p-6">
        <p className="text-sm uppercase tracking-[0.24em] text-secondary">Emploi du temps</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-dark">Vue semaine</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
          Votre planning est charge depuis l'API scolarite et peut etre exporte en iCal ou envoye vers Google Calendar.
        </p>
      </SurfaceCard>

      <div className="grid gap-4 xl:grid-cols-2">
        {Object.entries(grouped).map(([day, items]) => (
          <SurfaceCard key={day} className="p-5">
            <h2 className="font-display text-2xl font-bold text-dark">{day}</h2>
            <div className="mt-5 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-semibold text-dark">{item.matiere}</h3>
                    <span className="rounded-full px-3 py-1 text-xs font-semibold text-white" style={{ backgroundColor: item.color }}>
                      {item.type.toUpperCase()}
                    </span>
                  </div>
                  <div className="mt-3 grid gap-2 text-sm text-slate-600 md:grid-cols-2">
                    <p>{timeLabel(item.debut)} - {timeLabel(item.fin)}</p>
                    <p>{item.salle}</p>
                    <p>{item.enseignant || "Equipe pedagogique"}</p>
                    <p>{new Date(item.debut).toLocaleDateString("fr-FR")}</p>
                  </div>
                </div>
              ))}
            </div>
          </SurfaceCard>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => downloadScheduleCalendar(sortedItems, `emploi-du-temps-${profile?.matricule || "emsp"}.ics`)}
          className="rounded-2xl bg-slate-900 px-5 py-3 font-semibold text-white"
        >
          Exporter iCal
        </button>
        <button
          onClick={() => window.open(buildGoogleCalendarUrl(nextUpcomingCourse), "_blank", "noopener,noreferrer")}
          className="rounded-2xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700"
        >
          Google Calendar
        </button>
      </div>
    </div>
  );
};

export default StudentSchedulePage;
