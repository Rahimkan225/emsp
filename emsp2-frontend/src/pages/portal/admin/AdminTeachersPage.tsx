import { Bell, CheckCircle2, Mail, Phone, Send } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";

import AdminPageHeader from "../../../components/dashboard/AdminPageHeader";
import SurfaceCard from "../../../components/dashboard/SurfaceCard";
import { formatDateTime } from "../../../utils/formatDate";

interface TeacherItem {
  id: number;
  fullName: string;
  specialite: string;
  email: string;
  phone: string;
  statut: "disponible" | "occupe" | "mission";
  disponibilite: string;
}

interface NotificationHistoryItem {
  id: number;
  teacherId: number;
  teacherName: string;
  subject: string;
  message: string;
  createdAt: string;
}

const temporaryTeachers: TeacherItem[] = [
  {
    id: 1,
    fullName: "Pr. Niamke Kouadio",
    specialite: "Management postal",
    email: "niamke.kouadio@emsp.int",
    phone: "+225 07 00 00 00 11",
    statut: "disponible",
    disponibilite: "Disponible cette semaine",
  },
  {
    id: 2,
    fullName: "Dr. Faye Aissatou",
    specialite: "Transformation digitale",
    email: "faye.aissatou@emsp.int",
    phone: "+221 77 00 00 00 12",
    statut: "occupe",
    disponibilite: "Cours en cours jusqu'a vendredi",
  },
  {
    id: 3,
    fullName: "Mme Bamba Clarisse",
    specialite: "Logistique et exploitation",
    email: "bamba.clarisse@emsp.int",
    phone: "+225 05 00 00 00 13",
    statut: "mission",
    disponibilite: "Mission regionale jusqu'au 30 avril",
  },
  {
    id: 4,
    fullName: "M. Traore Youssouf",
    specialite: "Controle et regulation",
    email: "traore.youssouf@emsp.int",
    phone: "+223 70 00 00 00 14",
    statut: "disponible",
    disponibilite: "Disponible pour reunions a distance",
  },
];

const statusClassName: Record<TeacherItem["statut"], string> = {
  disponible: "bg-emerald-100 text-emerald-700",
  occupe: "bg-amber-100 text-amber-700",
  mission: "bg-sky-100 text-sky-700",
};

const AdminTeachersPage = () => {
  const [teachers, setTeachers] = useState<TeacherItem[]>(temporaryTeachers);
  const [selectedTeacherId, setSelectedTeacherId] = useState<number>(temporaryTeachers[0]?.id || 0);
  const [subject, setSubject] = useState("Information importante");
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState<NotificationHistoryItem[]>([]);
  const [feedback, setFeedback] = useState<string>("");

  const selectedTeacher = useMemo(
    () => teachers.find((teacher) => teacher.id === selectedTeacherId) || teachers[0],
    [selectedTeacherId, teachers],
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedTeacher || !subject.trim() || !message.trim()) {
      setFeedback("Renseignez l'enseignant, l'objet et le message avant l'envoi.");
      return;
    }

    const timestamp = new Date().toISOString();
    setHistory((current) => [
      {
        id: current.length + 1,
        teacherId: selectedTeacher.id,
        teacherName: selectedTeacher.fullName,
        subject: subject.trim(),
        message: message.trim(),
        createdAt: timestamp,
      },
      ...current,
    ]);
    setTeachers((current) =>
      current.map((teacher) =>
        teacher.id === selectedTeacher.id
          ? {
              ...teacher,
              disponibilite: `Notification envoyee le ${formatDateTime(timestamp)}`,
            }
          : teacher,
      ),
    );
    setFeedback(`Notification preparee pour ${selectedTeacher.fullName}.`);
    setMessage("");
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Administration"
        title="Enseignants"
        description="Liste temporaire des enseignants avec un module d'envoi de notification directe depuis l'espace administration."
      />

      <div className="grid gap-6 2xl:grid-cols-[1.05fr_0.95fr]">
        <SurfaceCard className="overflow-hidden">
          <div className="border-b border-slate-200 px-6 py-5">
            <p className="text-sm uppercase tracking-[0.24em] text-secondary">Liste temporaire</p>
            <h2 className="mt-2 font-display text-2xl font-bold text-dark">Equipe enseignante</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {teachers.map((teacher) => (
              <button
                key={teacher.id}
                type="button"
                onClick={() => setSelectedTeacherId(teacher.id)}
                className={`flex w-full items-start justify-between gap-4 px-6 py-5 text-left transition hover:bg-slate-50 ${
                  selectedTeacher?.id === teacher.id ? "bg-secondary/5" : ""
                }`}
              >
                <div>
                  <p className="font-display text-xl font-semibold text-dark">{teacher.fullName}</p>
                  <p className="mt-1 text-sm text-slate-600">{teacher.specialite}</p>
                  <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-2">
                      <Mail size={14} />
                      {teacher.email}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <Phone size={14} />
                      {teacher.phone}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-slate-500">{teacher.disponibilite}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusClassName[teacher.statut]}`}>
                  {teacher.statut}
                </span>
              </button>
            ))}
          </div>
        </SurfaceCard>

        <div className="space-y-6">
          <SurfaceCard className="p-6">
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-secondary/10 p-3 text-secondary">
                <Bell size={18} />
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-secondary">Notification directe</p>
                <h2 className="mt-1 font-display text-2xl font-bold text-dark">Envoyer un message</h2>
              </div>
            </div>

            {feedback ? (
              <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {feedback}
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-dark">Destinataire</span>
                <select
                  value={selectedTeacherId}
                  onChange={(event) => setSelectedTeacherId(Number(event.target.value))}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none"
                >
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.fullName} - {teacher.specialite}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-dark">Objet</span>
                <input
                  value={subject}
                  onChange={(event) => setSubject(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none"
                  required
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-dark">Message</span>
                <textarea
                  rows={6}
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Saisissez ici la notification a transmettre a l'enseignant..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none"
                  required
                />
              </label>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-2xl bg-dark px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                <Send size={18} />
                Envoyer la notification
              </button>
            </form>
          </SurfaceCard>

          <SurfaceCard className="p-6">
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-primary/40 p-3 text-dark">
                <CheckCircle2 size={18} />
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-secondary">Historique local</p>
                <h2 className="mt-1 font-display text-2xl font-bold text-dark">Derniers envois</h2>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {history.length ? (
                history.map((entry) => (
                  <div key={entry.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-dark">{entry.teacherName}</p>
                      <span className="text-xs text-slate-500">{formatDateTime(entry.createdAt)}</span>
                    </div>
                    <p className="mt-2 text-sm font-medium text-secondary">{entry.subject}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{entry.message}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">Aucune notification n'a encore ete envoyee depuis cette page.</p>
              )}
            </div>
          </SurfaceCard>
        </div>
      </div>
    </div>
  );
};

export default AdminTeachersPage;
