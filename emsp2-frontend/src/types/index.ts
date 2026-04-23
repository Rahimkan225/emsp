export interface MediaItem {
  id: number;
  title: string;
  url: string;
  type: "image" | "video" | "document";
  category: string;
  createdAt: string;
  altText?: string;
  description?: string;
  videoType?: "upload" | "youtube";
  videoUrl?: string;
  fileName?: string;
}

export interface NewsItem {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  coverImage?: MediaItem;
  publishedAt: string;
  tags: string[];
  category?: string;
  slug?: string;
}

export interface Formation {
  id: number;
  name: string;
  code: string;
  level: "FSP" | "Licence" | "Master" | "Certifiante";
  duration: string;
  description: string;
  coverImage?: MediaItem;
  type?: string;
  programType: "FSP" | "FS-MENUM" | "FCQ";
}

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: "etudiant" | "enseignant" | "staff" | "compta" | "admin" | "direction";
  phone?: string;
  avatarUrl?: string;
}

export interface Etudiant {
  id: number;
  matricule: string;
  user: User;
  filiere: Formation;
  promotion: string;
  pays: string;
  photo?: MediaItem;
}

export interface Promotion {
  id: number;
  label: string;
  yearStart: number;
  yearEnd: number;
  academicYear: string;
}

export interface EtudiantProfile {
  id: number;
  matricule: string;
  user: User;
  formationName: string;
  formationCode: string;
  promotion?: Promotion;
  pays: string;
  photo?: MediaItem;
  rangPromotion: number;
  soldeScolarite: string;
}

export interface ScheduleItem {
  id: number;
  matiere: string;
  enseignant: string;
  salle: string;
  type: "cours" | "td" | "examen" | "ferie";
  debut: string;
  fin: string;
  color: string;
}

export interface StudentDashboardData {
  moyenneGenerale: number;
  rangPromotion: number;
  prochainExamen: string;
  soldeScolarite: string;
  trend: Array<{ label: string; average: number }>;
  prochainsCours: ScheduleItem[];
  actualites: NewsItem[];
}

export interface NoteRow {
  id: number;
  matiere: string;
  coefficient: number;
  credits: number;
  note: number;
  semestre: string;
  anneeAcademique: string;
  mention: string;
  validation: boolean;
}

export interface NotesSemesterGroup {
  key: string;
  label: string;
  semester: string;
  academicYear: string;
  rows: NoteRow[];
  totals: {
    average: number;
    credits: number;
    result: string;
  };
  downloadUrl: string;
}

export interface StudentDocumentItem {
  id: number;
  title: string;
  typeDocument: string;
  semester?: string;
  academicYear?: string;
  isGenerated: boolean;
  generatedAt?: string;
  downloadUrl?: string;
}

export interface ForumCategory {
  key: string;
  label: string;
  count: number;
}

export interface ForumDiscussion {
  id: number;
  category: string;
  title: string;
  content: string;
  authorName: string;
  repliesCount: number;
  createdAt: string;
}

export interface StudentForumPayload {
  categories: ForumCategory[];
  discussions: ForumDiscussion[];
}

export interface StudentPaymentsData {
  amountDue: string;
  amountPaid: string;
  remainingBalance: string;
  transactions: PaymentTransaction[];
}

export interface PaymentTransaction {
  id: number;
  studentName: string;
  matricule: string;
  montant: number;
  operateur: "orange" | "mtn" | "wave";
  phoneNumber: string;
  reference: string;
  statut: "pending" | "confirmed" | "failed" | "refunded";
  description: string;
  createdAt: string;
  confirmedAt?: string;
}

export interface PaymentInitiationPayload {
  operateur: "orange" | "mtn" | "wave";
  phone: string;
  montant: number;
  description: string;
}

export interface AdminDashboardData {
  kpis: {
    totalStudents: number;
    recoveryRate: number;
    successRate: number;
    pendingApplications: number;
  };
  countryDistribution: Array<{ pays: string; total: number }>;
  formationDistribution: Array<{ formationName: string; total: number }>;
  yearlyEnrolments: Array<{ year: string; total: number }>;
  monthlyFinance: Array<{ label: string; paid: number; due: number }>;
  latestInscriptions: Array<{
    id: number;
    name: string;
    country: string;
    formation: string;
    date: string;
    status: string;
    matricule: string;
    photoUrl?: string;
  }>;
}

export interface AdminStudent {
  id: number;
  matricule: string;
  fullName: string;
  email: string;
  phone?: string;
  formationName: string;
  formationCode: string;
  promotionLabel: string;
  academicYear: string;
  country: string;
  countryLabel: string;
  rank: number;
  balance: number;
  balanceLabel: string;
  isActive: boolean;
  statusLabel: string;
  enrolledAt: string;
  photoUrl?: string;
  gender?: string;
  genderLabel?: string;
  age?: number | null;
  hobbies?: string;
  source?: "django_portal" | "emsp_legacy";
}

export interface AdminStudentsData {
  summary: {
    total: number;
    active: number;
    inactive: number;
    promotions: number;
    outstandingBalance: number;
  };
  results: AdminStudent[];
}

export interface AdminAcademicPromotion {
  id: number;
  label: string;
  academicYear: string;
  formationName: string;
  formationCode: string;
  studentsCount: number;
}

export interface AdminAcademicCourse {
  id: number;
  matiere: string;
  enseignant: string;
  salle: string;
  type: ScheduleItem["type"];
  debut: string;
  fin: string;
  promotionLabel: string;
  formationName: string;
}

export interface AdminAcademicDocument {
  id: number;
  title: string;
  typeDocument: string;
  semester?: string;
  academicYear?: string;
  isGenerated: boolean;
  generatedAt?: string;
  studentName: string;
  matricule: string;
  promotionLabel: string;
}

export interface AdminStandingStudent {
  id: number;
  fullName: string;
  matricule: string;
  formationName: string;
  promotionLabel: string;
  rank: number;
  average: number;
}

export interface AdminAcademicOverviewData {
  summary: {
    promotions: number;
    scheduledCourses: number;
    generatedDocuments: number;
    averageScore: number;
  };
  promotions: AdminAcademicPromotion[];
  upcomingCourses: AdminAcademicCourse[];
  recentDocuments: AdminAcademicDocument[];
  topStudents: AdminStandingStudent[];
}

export interface AdminFinancePayment extends PaymentTransaction {
  formationName: string;
  studentCountry: string;
  statusLabel: string;
}

export interface AdminFinancePaymentsData {
  summary: {
    totalTransactions: number;
    confirmedCount: number;
    pendingCount: number;
    failedCount: number;
    confirmedTotal: number;
  };
  results: AdminFinancePayment[];
}

export interface AdminMediaItem extends MediaItem {
  isActive: boolean;
}

export interface AdminMediaPayload {
  title: string;
  description?: string;
  altText?: string;
  type: "image" | "video" | "document";
  category?: string;
  isActive: boolean;
  videoType?: "upload" | "youtube";
  videoUrl?: string;
  file?: File | null;
}

export interface AdminNewsArticle {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  slug: string;
  tags: string[];
  status: string;
  isPublished: boolean;
  authorName: string;
  publishedAt: string;
  updatedAt: string;
  coverImage?: MediaItem;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface NewsTag {
  id: number;
  name: string;
  slug: string;
}

export interface SiteConfig {
  siteName: string;
  slogan: string;
  logoAlt: string;
  logoUrl: string;
  phone1: string;
  phone2: string;
  emailContact: string;
  emailInfo: string;
  address: string;
  showHomepageBanner: boolean;
  homepageBannerText: string;
  aboutText: string;
  facebookUrl: string;
  twitterUrl: string;
  linkedinUrl: string;
  youtubeUrl: string;
  footerText: string;
}

export interface SiteConfigUpdatePayload {
  siteName: string;
  slogan: string;
  logoAlt: string;
  phone1: string;
  phone2: string;
  emailContact: string;
  emailInfo: string;
  address: string;
  showHomepageBanner: boolean;
  homepageBannerText: string;
  aboutText: string;
  facebookUrl: string;
  twitterUrl: string;
  linkedinUrl: string;
  youtubeUrl: string;
  footerText: string;
  logoFile?: File | null;
  clearLogo?: boolean;
}

export interface ContactMessagePayload {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  subject: "inscription" | "information" | "partenariat" | "autre";
  message: string;
  honeypot?: string;
}

export interface InscriptionFormData {
  formationId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  placeOfBirth: string;
  nationality: string;
  residenceCountry: string;
  address: string;
  phone: string;
  whatsapp: string;
  email: string;
  confirmEmail: string;
  photo: File | undefined;
  highestDegree: string;
  institutionName: string;
  graduationYear: string;
  diplomaCountry: string;
  transcriptFile: File | undefined;
  diplomaFile: File | undefined;
  motivationFile: File | undefined;
  professionalExperience: string;
  motivationText: string;
  additionalDocuments: File[];
  accuracyCertified: boolean;
  termsAccepted: boolean;
}

export interface InscriptionSubmissionResponse {
  id: number;
  dossier_number: string;
  status: string;
  acknowledgement_url: string;
  created_at: string;
  message: string;
}
