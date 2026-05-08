import { Bell, CheckCircle2, Mail, Phone, Plus, Send, Trash2 } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";

import AdminPageHeader from "../../../components/dashboard/AdminPageHeader";
import SurfaceCard from "../../../components/dashboard/SurfaceCard";
import { createAdminTeacher, deleteAdminTeacher, fetchAdminTeachers } from "../../../api/portalApi";
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

const statusClassName: Record<TeacherItem["statut"], string> = {
  disponible: "bg-emerald-100 text-emerald-700",
  occupe: "bg-amber-100 text-amber-700",
  mission: "bg-sky-100 text-sky-700",
};

const AdminTeachersPage = () => {
  const [teachers, setTeachers] = useState<TeacherItem[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingTeacher, setIsSavingTeacher] = useState(false);
  const [teacherError, setTeacherError] = useState<string>("");
  const [newTeacher, setNewTeacher] = useState<{
    fullName: string;
    specialite: string;
    email: string;
    phone: string;
    statut: TeacherItem["statut"];
    disponibilite: string;
  }>({
    fullName: "",
    specialite: "",
    email: "",
    phone: "",
    statut: "disponible",
    disponibilite: "",
  });
  const [subject, setSubject] = useState("Information importante");
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState<NotificationHistoryItem[]>([]);
  const [feedback, setFeedback] = useState<string>("");

  useEffect(() => {
    let isMounted = true;
    const run = async () => {
      try {
        setIsLoading(true);
        setTeacherError("");
        const data = await fetchAdminTeachers();
        if (!isMounted) return;
        setTeachers(data);
        setSelectedTeacherId((current) => current || data[0]?.id || 0);
      } catch (error) {
        console.error(error);
        if (!isMounted) return;
        setTeacherError("Impossible de charger la liste des enseignants.");
      } finally {
        if (!isMounted) return;
        setIsLoading(false);
      }
    };
    void run();
    return () => {
      isMounted = false;
    };
  }, []);

  const selectedTeacher = useMemo(
    () => teachers.find((teacher) => teacher.id === selectedTeacherId) || teachers[0],
    [selectedTeacherId, teachers],
  );

  const handleAddTeacher = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newTeacher.fullName.trim()) {
      setTeacherError("Renseignez au minimum le nom complet de l'enseignant.");
      return;
    }

    try {
      setIsSavingTeacher(true);
      setTeacherError("");
      const created = await createAdminTeacher({
        fullName: newTeacher.fullName.trim(),
        specialite: newTeacher.specialite.trim(),
        email: newTeacher.email.trim(),
        phone: newTeacher.phone.trim(),
        statut: newTeacher.statut,
        disponibilite: newTeacher.disponibilite.trim(),
        isActive: true,
      });
      setTeachers((current) => [created, ...current]);
      setSelectedTeacherId(created.id);
      setNewTeacher({
        fullName: "",
        specialite: "",
        email: "",
        phone: "",
        statut: "disponible",
        disponibilite: "",
      });
      setFeedback(`Enseignant ajoute: ${created.fullName}.`);
    } catch (error) {
      console.error(error);
      setTeacherError("Echec lors de l'ajout de l'enseignant.");
    } finally {
      setIsSavingTeacher(false);
    }
  };

  const handleDeleteTeacher = async (teacherId: number) => {
    const teacher = teachers.find((item) => item.id === teacherId);
    if (!teacher) return;

    try {
      setTeacherError("");
      await deleteAdminTeacher(teacherId);
      setTeachers((current) => current.filter((item) => item.id !== teacherId));
      setSelectedTeacherId((current) => {
        if (current !== teacherId) return current;
        const remaining = teachers.filter((item) => item.id !== teacherId);
        return remaining[0]?.id || 0;
      });
      setFeedback(`Enseignant supprime: ${teacher.fullName}.`);
    } catch (error) {
      console.error(error);
      setTeacherError("Echec lors de la suppression de l'enseignant.");
    }
  };

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
        description="Gestion des enseignants (ajout/suppression) et module d'envoi de notification."
      />

      <div className="grid gap-6 2xl:grid-cols-[1.05fr_0.95fr]">
        <SurfaceCard className="emsp-panel overflow-hidden">
          <div className="border-b border-slate-200 px-6 py-5">
            <p className="text-sm uppercase tracking-[0.24em] text-secondary">Liste temporaire</p>
            <h2 className="mt-2 font-display text-2xl font-bold text-dark">Equipe enseignante</h2>
          </div>
          {teacherError ? (
            <div className="border-b border-rose-200 bg-rose-50 px-6 py-4 text-sm text-rose-800">
              {teacherError}
            </div>
          ) : null}
          <div className="divide-y divide-slate-100">
            {isLoading ? (
              <div className="px-6 py-8 text-sm text-slate-500">Chargement des enseignants...</div>
            ) : teachers.length ? (
              teachers.map((teacher) => (
                <div
                  key={teacher.id}
                  className={`flex w-full items-start justify-between gap-4 px-6 py-5 text-left transition hover:bg-slate-50 ${
                    selectedTeacher?.id === teacher.id ? "bg-secondary/5" : ""
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setSelectedTeacherId(teacher.id)}
                    className="flex flex-1 items-start justify-between gap-4 text-left"
                  >
                    <div>
                      <p className="font-display text-xl font-semibold text-dark">{teacher.fullName}</p>
                      <p className="mt-1 text-sm text-slate-600">{teacher.specialite}</p>
                      <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
                        {teacher.email ? (
                          <span className="inline-flex items-center gap-2">
                            <Mail size={14} />
                            {teacher.email}
                          </span>
                        ) : null}
                        {teacher.phone ? (
                          <span className="inline-flex items-center gap-2">
                            <Phone size={14} />
                            {teacher.phone}
                          </span>
                        ) : null}
                      </div>
                      {teacher.disponibilite ? <p className="mt-3 text-sm text-slate-500">{teacher.disponibilite}</p> : null}
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusClassName[teacher.statut]}`}
                    >
                      {teacher.statut}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDeleteTeacher(teacher.id)}
                    className="mt-1 inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
                    aria-label={`Supprimer ${teacher.fullName}`}
                    title="Supprimer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-sm text-slate-500">Aucun enseignant pour le moment.</div>
            )}
          </div>
        </SurfaceCard>

        <div className="space-y-6">
          <SurfaceCard className="emsp-panel p-6">
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-slate-900/10 p-3 text-slate-900">
                <Plus size={18} />
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-secondary">Administration</p>
                <h2 className="mt-1 font-display text-2xl font-bold text-dark">Ajouter un enseignant</h2>
              </div>
            </div>

            <form onSubmit={handleAddTeacher} className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="mb-2 block text-sm font-semibold text-dark">Nom complet</span>
                <input
                  value={newTeacher.fullName}
                  onChange={(event) => setNewTeacher((current) => ({ ...current, fullName: event.target.value }))}
                  className="emsp-panel w-full rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none"
                  required
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-dark">Specialite</span>
                <input
                  value={newTeacher.specialite}
                  onChange={(event) => setNewTeacher((current) => ({ ...current, specialite: event.target.value }))}
                  className="emsp-panel w-full rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-dark">Statut</span>
                <select
                  value={newTeacher.statut}
                  onChange={(event) =>
                    setNewTeacher((current) => ({ ...current, statut: event.target.value as TeacherItem["statut"] }))
                  }
                  className="emsp-panel w-full rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none"
                >
                  <option value="disponible">Disponible</option>
                  <option value="occupe">Occupe</option>
                  <option value="mission">Mission</option>
                </select>
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-dark">Email</span>
                <input
                  value={newTeacher.email}
                  onChange={(event) => setNewTeacher((current) => ({ ...current, email: event.target.value }))}
                  className="emsp-panel w-full rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-dark">Telephone</span>
                <input
                  value={newTeacher.phone}
                  onChange={(event) => setNewTeacher((current) => ({ ...current, phone: event.target.value }))}
                  className="emsp-panel w-full rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none"
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-2 block text-sm font-semibold text-dark">Disponibilite</span>
                <input
                  value={newTeacher.disponibilite}
                  onChange={(event) => setNewTeacher((current) => ({ ...current, disponibilite: event.target.value }))}
                  className="emsp-panel w-full rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none"
                  placeholder="Ex: Disponible cette semaine"
                />
              </label>
              <div className="sm:col-span-2">
                <button
                  type="submit"
                  disabled={isSavingTeacher}
                  className="inline-flex items-center gap-2 rounded-2xl bg-dark px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Plus size={18} />
                  Ajouter
                </button>
              </div>
            </form>
          </SurfaceCard>

          <SurfaceCard className="emsp-panel p-6">
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
                  className="emsp-panel w-full rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none"
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
                  className="emsp-panel w-full rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none"
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
                  className="emsp-panel w-full rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none"
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

          <SurfaceCard className="emsp-panel p-6">
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
