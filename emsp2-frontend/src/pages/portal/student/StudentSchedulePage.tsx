import { CalendarPlus, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { Fragment } from "react";
import { useMemo, useState } from "react";

import SurfaceCard from "../../../components/dashboard/SurfaceCard";
import { useEtudiantMe, useStudentSchedule } from "../../../hooks/useStudentPortal";
import { buildGoogleCalendarUrl, downloadScheduleCalendar } from "../../../utils/studentPortal";

const days = ["lundi", "mardi", "mercredi", "jeudi", "vendredi"];
const slots = Array.from({ length: 13 }, (_, index) => index + 7);

const startOfWeek = (date: Date) => {
  const copy = new Date(date);
  const day = copy.getDay() || 7;
  copy.setDate(copy.getDate() - day + 1);
  copy.setHours(0, 0, 0, 0);
  return copy;
};

const sameWeek = (iso: string, weekStart: Date) => {
  const date = new Date(iso);
  const end = new Date(weekStart);
  end.setDate(end.getDate() + 7);
  return date >= weekStart && date < end;
};

const timeLabel = (iso: string) => new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

const StudentSchedulePage = () => {
  const { data: profile } = useEtudiantMe();
  const { data = [], isLoading } = useStudentSchedule();
  useStudentSchedule(80);
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [openDay, setOpenDay] = useState(days[0]);

  const weekItems = useMemo(
    () => data.filter((item) => sameWeek(item.debut, weekStart)).sort((left, right) => new Date(left.debut).getTime() - new Date(right.debut).getTime()),
    [data, weekStart],
  );
  const nextCourse = weekItems.find((item) => new Date(item.fin).getTime() >= Date.now()) || weekItems[0] || data[0];

  const moveWeek = (step: number) => {
    const next = new Date(weekStart);
    next.setDate(next.getDate() + step * 7);
    setWeekStart(next);
  };

  if (isLoading) return <div className="h-96 animate-pulse rounded-2xl bg-white" />;

  return (
    <div className="space-y-6">
      <section className="emsp-panel flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-5">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-slate-500">Weekly planner</p>
          <h2 className="mt-1 font-display text-xl font-bold text-slate-900">Emploi du temps</h2>
        </div>
      </section>

      <SurfaceCard className="emsp-panel p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Emploi du temps</p>
            <h1 className="mt-1 font-display text-2xl font-bold text-dark">
              Semaine du {weekStart.toLocaleDateString("fr-FR", { day: "2-digit", month: "long" })}
            </h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => moveWeek(-1)} className="emsp-panel inline-flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold">
              <ChevronLeft size={17} />
              Precedente
            </button>
            <button onClick={() => setWeekStart(startOfWeek(new Date()))} className="cursor-pointer rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white">
              Aujourd'hui
            </button>
            <button onClick={() => moveWeek(1)} className="emsp-panel inline-flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold">
              Suivante
              <ChevronRight size={17} />
            </button>
          </div>
        </div>
      </SurfaceCard>

      <SurfaceCard className="emsp-panel hidden overflow-x-auto p-4 sm:block">
        <div className="grid min-w-[860px] grid-cols-[70px_repeat(5,minmax(140px,1fr))] gap-px overflow-hidden rounded-xl border border-slate-200 bg-slate-200">
          <div className="bg-slate-50 p-2 text-xs font-semibold text-slate-500">Heure</div>
          {days.map((day) => <div key={day} className="bg-slate-50 p-2 text-sm font-bold capitalize text-dark">{day}</div>)}
          {slots.map((hour) => (
            <Fragment key={hour}>
              <div key={`hour-${hour}`} className="bg-white p-2 text-xs font-semibold text-slate-500">{hour}h</div>
              {days.map((day) => {
                const item = weekItems.find((course) => new Date(course.debut).getHours() === hour && new Date(course.debut).toLocaleDateString("fr-FR", { weekday: "long" }) === day);
                return (
                  <div key={`${day}-${hour}`} className="min-h-[72px] bg-white p-2">
                    {item ? (
                      <div className="h-full rounded-lg p-2 text-xs text-white" style={{ backgroundColor: item.color }}>
                        <p className="font-bold">{item.matiere}</p>
                        <p className="mt-1 opacity-90">{timeLabel(item.debut)} - {timeLabel(item.fin)}</p>
                        <p className="mt-1 opacity-90">{item.salle}</p>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </Fragment>
          ))}
        </div>
      </SurfaceCard>

      <div className="space-y-3 sm:hidden">
        {days.map((day) => {
          const items = weekItems.filter((item) => new Date(item.debut).toLocaleDateString("fr-FR", { weekday: "long" }) === day);
          return (
            <SurfaceCard key={day} className="emsp-panel overflow-hidden">
              <button onClick={() => setOpenDay(openDay === day ? "" : day)} className="flex w-full cursor-pointer items-center justify-between px-4 py-4 text-left font-display text-lg font-bold capitalize text-dark">
                {day}
                <span className="text-sm font-sans text-slate-500">{items.length}</span>
              </button>
              {openDay === day ? (
                <div className="space-y-3 border-t border-slate-100 p-4">
                  {items.length ? items.map((item) => (
                    <div key={item.id} className="rounded-xl border border-slate-200 p-3">
                      <p className="font-semibold text-dark">{item.matiere}</p>
                      <p className="mt-1 text-sm text-slate-600">{timeLabel(item.debut)} - {timeLabel(item.fin)} · {item.salle}</p>
                    </div>
                  )) : <p className="text-sm text-slate-500">Aucun cours.</p>}
                </div>
              ) : null}
            </SurfaceCard>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-3">
        <button onClick={() => downloadScheduleCalendar(weekItems, `emploi-du-temps-${profile?.matricule || "emsp"}.ics`)} className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white">
          <Download size={18} />
          Export iCal
        </button>
        <button disabled={!nextCourse} onClick={() => nextCourse && window.open(buildGoogleCalendarUrl(nextCourse), "_blank", "noopener,noreferrer")} className="emsp-panel inline-flex cursor-pointer items-center gap-2 rounded-xl bg-white px-4 py-3 font-semibold text-slate-700 disabled:opacity-50">
          <CalendarPlus size={18} />
          Google Calendar
        </button>
      </div>
    </div>
  );
};

export default StudentSchedulePage;
