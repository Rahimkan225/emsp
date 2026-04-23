export interface NavChildLink {
  label: string;
  path: string;
}

export interface NavMegaColumn {
  title: string;
  links: NavChildLink[];
}

export interface NavItem {
  label: string;
  path?: string;
  megaMenu?: NavMegaColumn[];
}

export const navigationConfig: NavItem[] = [
  { label: "Accueil", path: "/" },
  {
    label: "Formations",
    megaMenu: [
      {
        title: "Formations Superieures Postales (FSP)",
        links: [
          { label: "ADM", path: "/formations/fsp/adm" },
          { label: "INP", path: "/formations/fsp/inp" },
          { label: "CTR", path: "/formations/fsp/ctr" },
        ],
      },
      {
        title: "Licences Professionnelles",
        links: [
          { label: "LNUM - Logistique et Numerique", path: "/formations/fs-menum/lnum" },
          { label: "FDIG - Finance Digitale", path: "/formations/fs-menum/fdig" },
          { label: "MDIG - Marketing Digital", path: "/formations/fs-menum/mdig" },
          { label: "DSER - Digitalisation des Services", path: "/formations/fs-menum/dser" },
        ],
      },
      {
        title: "Masters & Excellence Internationale",
        links: [
          { label: "LECO - Logistique et E-Commerce", path: "/formations/fs-menum/leco" },
          { label: "FMER - Finance et Management du Risque", path: "/formations/fs-menum/fmer" },
          { label: "MDEB - Marketing Digital et E-Business", path: "/formations/fs-menum/mdeb" },
          { label: "TNOR - Transformation Numerique", path: "/formations/fs-menum/tnor" },
          { label: "MS-RegNUM - Regulation du Numerique", path: "/formations/fs-menum/ms-regnum" },
        ],
      },
    ],
  },
  { label: "Inscription", path: "/inscription" },
  { label: "Actualites", path: "/actualites" },
  { label: "Mediatheque", path: "/mediatheque" },
  { label: "Contact", path: "/contact" },
];
