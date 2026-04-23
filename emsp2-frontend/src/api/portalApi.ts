import axiosInstance from "./axiosConfig";
import type {
  AdminAcademicOverviewData,
  AdminDashboardData,
  AdminStudentsData,
  EtudiantProfile,
  ForumDiscussion,
  NotesSemesterGroup,
  PaymentInitiationPayload,
  ScheduleItem,
  StudentDashboardData,
  StudentDocumentItem,
  StudentForumPayload,
  StudentPaymentsData,
} from "../types";

interface RawEtudiantProfile {
  id: number;
  matricule: string;
  user: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    role: EtudiantProfile["user"]["role"];
    phone?: string;
    avatar_url?: string;
  };
  formation_name: string;
  formation_code: string;
  promotion?: {
    id: number;
    label: string;
    year_start: number;
    year_end: number;
    academic_year: string;
  };
  pays: string;
  photo?: {
    id: number;
    title: string;
    url: string;
    type: "image" | "video" | "document";
    category: string;
    created_at: string;
    alt_text?: string;
    description?: string;
  };
  rang_promotion: number;
  solde_scolarite: string;
}

interface RawScheduleItem {
  id: number;
  matiere: string;
  enseignant: string;
  salle: string;
  type: ScheduleItem["type"];
  debut: string;
  fin: string;
  color: string;
}

interface RawStudentDashboard {
  moyenne_generale: number;
  rang_promotion: number;
  prochain_examen: string;
  solde_scolarite: string;
  trend: Array<{ label: string; average: number }>;
  prochains_cours: RawScheduleItem[];
  actualites: Array<{
    id: number;
    titre: string;
    slug?: string;
    extrait: string;
    category?: string;
    publie_le: string;
    cover?: {
      id: number;
      title: string;
      url: string;
      type: "image" | "video" | "document";
      category: string;
      created_at: string;
      alt_text?: string;
    };
    tags: Array<{ nom: string }>;
  }>;
}

interface RawNoteRow {
  id: number;
  matiere: string;
  coefficient: number;
  credits: number;
  note: number;
  semestre: string;
  annee_academique: string;
  mention: string;
  validation: boolean;
}

interface RawNotesGroup {
  key: string;
  label: string;
  semester: string;
  academic_year: string;
  rows: RawNoteRow[];
  totals: {
    average: number;
    credits: number;
    result: string;
  };
  download_url: string;
}

interface RawDocument {
  id: number;
  title: string;
  type_document: string;
  semester?: string;
  academic_year?: string;
  is_generated: boolean;
  generated_at?: string;
  download_url?: string;
}

interface RawForumPayload {
  categories: Array<{ key: string; label: string; count: number }>;
  discussions: Array<{
    id: number;
    category: string;
    title: string;
    content: string;
    author_name: string;
    replies_count: number;
    created_at: string;
  }>;
}

interface RawPaymentsPayload {
  amount_due: string;
  amount_paid: string;
  remaining_balance: string;
  transactions: Array<{
    id: number;
    student_name: string;
    matricule: string;
    montant: string | number;
    operateur: "orange" | "mtn" | "wave";
    phone_number: string;
    reference: string;
    statut: "pending" | "confirmed" | "failed" | "refunded";
    description: string;
    created_at: string;
    confirmed_at?: string;
  }>;
}

interface RawAdminDashboard {
  kpis: {
    total_students: number;
    recovery_rate: number;
    success_rate: number;
    pending_applications: number;
  };
  country_distribution: Array<{ pays: string; total: number }>;
  formation_distribution: Array<{ formation__nom: string; total: number }>;
  yearly_enrolments: Array<{ year: string; total: number }>;
  monthly_finance: Array<{ label: string; paid: number; due: number }>;
  latest_inscriptions: Array<{
    id: number;
    name: string;
    country: string;
    formation: string;
    date: string;
    status: string;
    matricule: string;
    photo_url?: string;
  }>;
}

interface RawAdminStudentsResponse {
  summary: {
    total: number;
    active: number;
    inactive: number;
    promotions: number;
    outstanding_balance: number;
  };
  results: Array<{
    id: number;
    matricule: string;
    full_name: string;
    email: string;
    phone?: string;
    formation_name: string;
    formation_code: string;
    promotion_label: string;
    academic_year: string;
    country: string;
    country_label: string;
    rank: number;
    balance: number;
    balance_label: string;
    is_active: boolean;
    status_label: string;
    enrolled_at: string;
    photo_url?: string;
    gender?: string;
    gender_label?: string;
    age?: number | null;
    hobbies?: string;
    source?: "django_portal" | "emsp_legacy";
  }>;
}

interface RawAdminAcademicOverview {
  summary: {
    promotions: number;
    scheduled_courses: number;
    generated_documents: number;
    average_score: number;
  };
  promotions: Array<{
    id: number;
    label: string;
    academic_year: string;
    formation_name: string;
    formation_code: string;
    students_count: number;
  }>;
  upcoming_courses: Array<{
    id: number;
    matiere: string;
    enseignant: string;
    salle: string;
    type: ScheduleItem["type"];
    debut: string;
    fin: string;
    promotion_label: string;
    formation_name: string;
  }>;
  recent_documents: Array<{
    id: number;
    title: string;
    type_document: string;
    semester?: string;
    academic_year?: string;
    is_generated: boolean;
    generated_at?: string;
    student_name: string;
    matricule: string;
    promotion_label: string;
  }>;
  top_students: Array<{
    id: number;
    full_name: string;
    matricule: string;
    formation_name: string;
    promotion_label: string;
    rank: number;
    average: number;
  }>;
}

const mapUser = (user: RawEtudiantProfile["user"]) => ({
  id: user.id,
  email: user.email,
  firstName: user.first_name,
  lastName: user.last_name,
  role: user.role,
  phone: user.phone,
  avatarUrl: user.avatar_url,
});

const mapMedia = (item?: RawEtudiantProfile["photo"]) =>
  item
    ? {
        id: item.id,
        title: item.title,
        url: item.url,
        type: item.type,
        category: item.category,
        createdAt: item.created_at,
        altText: item.alt_text,
        description: item.description,
      }
    : undefined;

export async function fetchEtudiantProfile() {
  const response = await axiosInstance.get<RawEtudiantProfile>("/scolarite/me/");
  return {
    id: response.data.id,
    matricule: response.data.matricule,
    user: mapUser(response.data.user),
    formationName: response.data.formation_name,
    formationCode: response.data.formation_code,
    promotion: response.data.promotion
      ? {
          id: response.data.promotion.id,
          label: response.data.promotion.label,
          yearStart: response.data.promotion.year_start,
          yearEnd: response.data.promotion.year_end,
          academicYear: response.data.promotion.academic_year,
        }
      : undefined,
    pays: response.data.pays,
    photo: mapMedia(response.data.photo),
    rangPromotion: response.data.rang_promotion,
    soldeScolarite: response.data.solde_scolarite,
  } satisfies EtudiantProfile;
}

export async function fetchStudentDashboard() {
  const response = await axiosInstance.get<RawStudentDashboard>("/scolarite/me/dashboard/");
  return {
    moyenneGenerale: response.data.moyenne_generale,
    rangPromotion: response.data.rang_promotion,
    prochainExamen: response.data.prochain_examen,
    soldeScolarite: response.data.solde_scolarite,
    trend: response.data.trend,
    prochainsCours: response.data.prochains_cours.map((item) => ({
      id: item.id,
      matiere: item.matiere,
      enseignant: item.enseignant,
      salle: item.salle,
      type: item.type,
      debut: item.debut,
      fin: item.fin,
      color: item.color,
    })),
    actualites: response.data.actualites.map((item) => ({
      id: item.id,
      title: item.titre,
      slug: item.slug,
      excerpt: item.extrait,
      content: item.extrait,
      coverImage: item.cover
        ? {
            id: item.cover.id,
            title: item.cover.title,
            url: item.cover.url,
            type: item.cover.type,
            category: item.cover.category,
            createdAt: item.cover.created_at,
            altText: item.cover.alt_text,
          }
        : undefined,
      publishedAt: item.publie_le,
      tags: item.tags.map((tag) => tag.nom),
      category: item.category,
    })),
  } satisfies StudentDashboardData;
}

export async function fetchStudentNotes() {
  const response = await axiosInstance.get<RawNotesGroup[]>("/scolarite/me/notes/");
  return response.data.map(
    (group) =>
      ({
        key: group.key,
        label: group.label,
        semester: group.semester,
        academicYear: group.academic_year,
        rows: group.rows.map((row) => ({
          id: row.id,
          matiere: row.matiere,
          coefficient: row.coefficient,
          credits: row.credits,
          note: row.note,
          semestre: row.semestre,
          anneeAcademique: row.annee_academique,
          mention: row.mention,
          validation: row.validation,
        })),
        totals: group.totals,
        downloadUrl: group.download_url,
      }) satisfies NotesSemesterGroup,
  );
}

export async function fetchStudentSchedule(limit?: number) {
  const response = await axiosInstance.get<RawScheduleItem[]>("/scolarite/me/edt/", {
    params: limit ? { limit } : undefined,
  });
  return response.data.map(
    (item) =>
      ({
        id: item.id,
        matiere: item.matiere,
        enseignant: item.enseignant,
        salle: item.salle,
        type: item.type,
        debut: item.debut,
        fin: item.fin,
        color: item.color,
      }) satisfies ScheduleItem,
  );
}

export async function fetchStudentDocuments() {
  const response = await axiosInstance.get<RawDocument[]>("/scolarite/me/documents/");
  return response.data.map(
    (item) =>
      ({
        id: item.id,
        title: item.title,
        typeDocument: item.type_document,
        semester: item.semester,
        academicYear: item.academic_year,
        isGenerated: item.is_generated,
        generatedAt: item.generated_at,
        downloadUrl: item.download_url,
      }) satisfies StudentDocumentItem,
  );
}

export async function fetchStudentForum() {
  const response = await axiosInstance.get<RawForumPayload>("/scolarite/me/forum/");
  return {
    categories: response.data.categories,
    discussions: response.data.discussions.map(
      (item) =>
        ({
          id: item.id,
          category: item.category,
          title: item.title,
          content: item.content,
          authorName: item.author_name,
          repliesCount: item.replies_count,
          createdAt: item.created_at,
        }) satisfies ForumDiscussion,
    ),
  } satisfies StudentForumPayload;
}

export async function createForumPost(payload: { category: string; title: string; content: string }) {
  await axiosInstance.post("/scolarite/me/forum/", payload);
}

export async function fetchStudentPayments() {
  const response = await axiosInstance.get<RawPaymentsPayload>("/comptabilite/me/");
  return {
    amountDue: response.data.amount_due,
    amountPaid: response.data.amount_paid,
    remainingBalance: response.data.remaining_balance,
    transactions: response.data.transactions.map((item) => ({
      id: item.id,
      studentName: item.student_name,
      matricule: item.matricule,
      montant: Number(item.montant),
      operateur: item.operateur,
      phoneNumber: item.phone_number,
      reference: item.reference,
      statut: item.statut,
      description: item.description,
      createdAt: item.created_at,
      confirmedAt: item.confirmed_at,
    })),
  } satisfies StudentPaymentsData;
}

export async function initiateStudentPayment(payload: PaymentInitiationPayload) {
  const response = await axiosInstance.post("/comptabilite/payments/initiate/", payload);
  return response.data;
}

export async function fetchAdminDashboard() {
  const response = await axiosInstance.get<RawAdminDashboard>("/scolarite/dashboard/");
  return {
    kpis: {
      totalStudents: response.data.kpis.total_students,
      recoveryRate: response.data.kpis.recovery_rate,
      successRate: response.data.kpis.success_rate,
      pendingApplications: response.data.kpis.pending_applications,
    },
    countryDistribution: response.data.country_distribution,
    formationDistribution: response.data.formation_distribution.map((item) => ({
      formationName: item["formation__nom"],
      total: item.total,
    })),
    yearlyEnrolments: response.data.yearly_enrolments,
    monthlyFinance: response.data.monthly_finance,
    latestInscriptions: response.data.latest_inscriptions.map((item) => ({
      id: item.id,
      name: item.name,
      country: item.country,
      formation: item.formation,
      date: item.date,
      status: item.status,
      matricule: item.matricule,
      photoUrl: item.photo_url,
    })),
  } satisfies AdminDashboardData;
}

export async function fetchAdminStudents(params?: {
  search?: string;
  status?: "active" | "inactive";
  country?: string;
  formation?: string;
}) {
  const response = await axiosInstance.get<RawAdminStudentsResponse>("/scolarite/admin/etudiants/", {
    params,
  });
  return {
    summary: {
      total: response.data.summary.total,
      active: response.data.summary.active,
      inactive: response.data.summary.inactive,
      promotions: response.data.summary.promotions,
      outstandingBalance: response.data.summary.outstanding_balance,
    },
    results: response.data.results.map((item) => ({
      id: item.id,
      matricule: item.matricule,
      fullName: item.full_name,
      email: item.email,
      phone: item.phone,
      formationName: item.formation_name,
      formationCode: item.formation_code,
      promotionLabel: item.promotion_label,
      academicYear: item.academic_year,
      country: item.country,
      countryLabel: item.country_label,
      rank: item.rank,
      balance: item.balance,
      balanceLabel: item.balance_label,
      isActive: item.is_active,
      statusLabel: item.status_label,
      enrolledAt: item.enrolled_at,
      photoUrl: item.photo_url,
      gender: item.gender,
      genderLabel: item.gender_label,
      age: item.age,
      hobbies: item.hobbies,
      source: item.source,
    })),
  } satisfies AdminStudentsData;
}

export async function fetchAdminAcademicOverview() {
  const response = await axiosInstance.get<RawAdminAcademicOverview>("/scolarite/admin/scolarite/");
  return {
    summary: {
      promotions: response.data.summary.promotions,
      scheduledCourses: response.data.summary.scheduled_courses,
      generatedDocuments: response.data.summary.generated_documents,
      averageScore: response.data.summary.average_score,
    },
    promotions: response.data.promotions.map((item) => ({
      id: item.id,
      label: item.label,
      academicYear: item.academic_year,
      formationName: item.formation_name,
      formationCode: item.formation_code,
      studentsCount: item.students_count,
    })),
    upcomingCourses: response.data.upcoming_courses.map((item) => ({
      id: item.id,
      matiere: item.matiere,
      enseignant: item.enseignant,
      salle: item.salle,
      type: item.type,
      debut: item.debut,
      fin: item.fin,
      promotionLabel: item.promotion_label,
      formationName: item.formation_name,
    })),
    recentDocuments: response.data.recent_documents.map((item) => ({
      id: item.id,
      title: item.title,
      typeDocument: item.type_document,
      semester: item.semester,
      academicYear: item.academic_year,
      isGenerated: item.is_generated,
      generatedAt: item.generated_at,
      studentName: item.student_name,
      matricule: item.matricule,
      promotionLabel: item.promotion_label,
    })),
    topStudents: response.data.top_students.map((item) => ({
      id: item.id,
      fullName: item.full_name,
      matricule: item.matricule,
      formationName: item.formation_name,
      promotionLabel: item.promotion_label,
      rank: item.rank,
      average: item.average,
    })),
  } satisfies AdminAcademicOverviewData;
}
