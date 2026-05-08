import { zodResolver } from "@hookform/resolvers/zod";
import { Camera, KeyRound, LogOut, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import SurfaceCard from "../../../components/dashboard/SurfaceCard";
import { useAuth } from "../../../hooks/useAuth";
import { useChangeEtudiantPassword, useEtudiantMe, useUpdateEtudiantProfile, useUploadEtudiantPhoto } from "../../../hooks/useStudentPortal";

const profileSchema = z.object({
  firstName: z.string().min(2, "Le prenom est requis."),
  lastName: z.string().min(2, "Le nom est requis."),
  phone: z.string().optional(),
  pays: z.string().optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Mot de passe actuel requis."),
  newPassword: z.string().min(8, "Le nouveau mot de passe doit contenir au moins 8 caracteres."),
});

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

const StudentProfilePage = () => {
  const { logout } = useAuth();
  const { data: profile, isLoading } = useEtudiantMe();
  const updateMutation = useUpdateEtudiantProfile();
  const photoMutation = useUploadEtudiantPhoto();
  const passwordMutation = useChangeEtudiantPassword();
  const [photoPreview, setPhotoPreview] = useState("");
  const [passwordOpen, setPasswordOpen] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProfileForm>({ resolver: zodResolver(profileSchema) });
  const passwordForm = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) });

  useEffect(() => {
    if (profile) {
      reset({ firstName: profile.user.firstName, lastName: profile.user.lastName, phone: profile.user.phone || "", pays: profile.pays || "" });
      setPhotoPreview(profile.photo?.url || profile.user.avatarUrl || "");
    }
  }, [profile, reset]);

  const submitProfile = handleSubmit(async (values) => {
    await updateMutation.mutateAsync(values);
  });

  const submitPassword = passwordForm.handleSubmit(async (values) => {
    await passwordMutation.mutateAsync(values);
    logout();
    window.location.href = "/login";
  });

  const handlePhoto = async (file?: File) => {
    if (!file) return;
    setPhotoPreview(URL.createObjectURL(file));
    await photoMutation.mutateAsync(file);
  };

  if (isLoading || !profile) return <div className="h-96 animate-pulse rounded-2xl bg-white" />;

  return (
    <div className="space-y-5">
      <SurfaceCard className="p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Profil</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-dark">Mon dossier</h1>
      </SurfaceCard>

      <div className="grid gap-5 xl:grid-cols-[0.75fr_1.25fr]">
        <SurfaceCard className="p-5">
          <div className="flex flex-col items-center text-center">
            <div className="h-28 w-28 overflow-hidden rounded-2xl bg-slate-100">
              {photoPreview ? <img src={photoPreview} alt="Photo etudiant" className="h-full w-full object-cover" /> : null}
            </div>
            <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white">
              <Camera size={18} />
              Changer la photo
              <input type="file" accept="image/*" className="hidden" onChange={(event) => void handlePhoto(event.target.files?.[0])} />
            </label>
            {photoMutation.isPending ? <p className="mt-2 text-sm text-slate-500">Upload en cours...</p> : null}
          </div>
        </SurfaceCard>

        <SurfaceCard className="p-5">
          <form onSubmit={submitProfile} className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-semibold text-dark">
              Prenom
              <input {...register("firstName")} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-3 font-normal" />
              {errors.firstName ? <span className="mt-1 block text-xs text-red-600">{errors.firstName.message}</span> : null}
            </label>
            <label className="block text-sm font-semibold text-dark">
              Nom
              <input {...register("lastName")} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-3 font-normal" />
              {errors.lastName ? <span className="mt-1 block text-xs text-red-600">{errors.lastName.message}</span> : null}
            </label>
            <label className="block text-sm font-semibold text-dark">
              Telephone
              <input {...register("phone")} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-3 font-normal" />
            </label>
            <label className="block text-sm font-semibold text-dark">
              Pays
              <input {...register("pays")} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-3 font-normal" />
            </label>
            <div className="sm:col-span-2 flex flex-wrap gap-3">
              <button type="submit" disabled={updateMutation.isPending} className="cursor-pointer rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white disabled:opacity-70">
                Enregistrer
              </button>
              <button type="button" onClick={() => setPasswordOpen(true)} className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 font-semibold text-slate-700">
                <KeyRound size={18} />
                Mot de passe
              </button>
            </div>
          </form>
        </SurfaceCard>
      </div>

      <SurfaceCard className="p-5">
        <h2 className="font-display text-xl font-bold text-dark">Informations academiques</h2>
        <div className="mt-4 grid gap-3 bg-slate-50 p-4 sm:grid-cols-2 lg:grid-cols-4">
          <div><p className="text-xs text-slate-500">Matricule</p><p className="font-semibold text-dark">{profile.matricule}</p></div>
          <div><p className="text-xs text-slate-500">Formation</p><p className="font-semibold text-dark">{profile.formationName}</p></div>
          <div><p className="text-xs text-slate-500">Promotion</p><p className="font-semibold text-dark">{profile.promotion?.label || "-"}</p></div>
          <div><p className="text-xs text-slate-500">Rang</p><p className="font-semibold text-dark">#{profile.rangPromotion}</p></div>
        </div>
      </SurfaceCard>

      {passwordOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/55 px-4 pb-4 sm:items-center sm:pb-0">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-bold text-dark">Changer le mot de passe</h2>
              <button onClick={() => setPasswordOpen(false)} className="cursor-pointer rounded-xl bg-slate-100 p-2 text-slate-600" aria-label="Fermer"><X size={18} /></button>
            </div>
            <form onSubmit={submitPassword} className="mt-5 space-y-4">
              <label className="block text-sm font-semibold text-dark">
                Mot de passe actuel
                <input type="password" {...passwordForm.register("currentPassword")} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-3 font-normal" />
                {passwordForm.formState.errors.currentPassword ? <span className="mt-1 block text-xs text-red-600">{passwordForm.formState.errors.currentPassword.message}</span> : null}
              </label>
              <label className="block text-sm font-semibold text-dark">
                Nouveau mot de passe
                <input type="password" {...passwordForm.register("newPassword")} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-3 font-normal" />
                {passwordForm.formState.errors.newPassword ? <span className="mt-1 block text-xs text-red-600">{passwordForm.formState.errors.newPassword.message}</span> : null}
              </label>
              <button type="submit" disabled={passwordMutation.isPending} className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white disabled:opacity-70">
                <LogOut size={18} />
                Valider et se reconnecter
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default StudentProfilePage;
