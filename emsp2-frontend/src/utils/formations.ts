import type { Formation } from "../types";

export function getFormationPath(formation: Pick<Formation, "programType" | "code">): string {
  const code = formation.code.toLowerCase();

  if (formation.programType === "FSP") {
    return `/formations/fsp/${code}`;
  }
  if (formation.programType === "FCQ") {
    return `/formations/certifiantes/${code}`;
  }
  return `/formations/fs-menum/${code}`;
}

export function getProgramLabel(programType: Formation["programType"]): string {
  if (programType === "FSP") {
    return "Formations Superieures Postales";
  }
  if (programType === "FCQ") {
    return "Formations Certifiantes";
  }
  return "FS-MENUM";
}
