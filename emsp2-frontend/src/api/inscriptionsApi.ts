import axiosInstance from "./axiosConfig";
import type { InscriptionFormData, InscriptionSubmissionResponse } from "../types";

function appendIfPresent(formData: FormData, key: string, value?: File | string) {
  if (value === undefined || value === "") {
    return;
  }
  formData.append(key, value);
}

export async function submitInscription(payload: InscriptionFormData) {
  const formData = new FormData();

  formData.append("formation", payload.formationId);
  formData.append("first_name", payload.firstName);
  formData.append("last_name", payload.lastName);
  formData.append("date_of_birth", payload.dateOfBirth);
  formData.append("place_of_birth", payload.placeOfBirth);
  formData.append("nationality", payload.nationality);
  formData.append("residence_country", payload.residenceCountry);
  formData.append("address", payload.address);
  formData.append("phone", payload.phone);
  appendIfPresent(formData, "whatsapp", payload.whatsapp);
  formData.append("email", payload.email);
  formData.append("confirm_email", payload.confirmEmail);
  if (payload.photo) {
    formData.append("photo", payload.photo);
  }
  formData.append("highest_degree", payload.highestDegree);
  formData.append("institution_name", payload.institutionName);
  formData.append("graduation_year", payload.graduationYear);
  formData.append("diploma_country", payload.diplomaCountry);
  if (payload.transcriptFile) {
    formData.append("transcript_file", payload.transcriptFile);
  }
  if (payload.diplomaFile) {
    formData.append("diploma_file", payload.diplomaFile);
  }
  appendIfPresent(formData, "professional_experience", payload.professionalExperience);
  appendIfPresent(formData, "motivation_text", payload.motivationText);
  if (payload.motivationFile) {
    formData.append("motivation_file", payload.motivationFile);
  }
  payload.additionalDocuments.forEach((document) => {
    formData.append("additional_documents", document);
  });
  formData.append("accuracy_certified", String(payload.accuracyCertified));
  formData.append("terms_accepted", String(payload.termsAccepted));

  const response = await axiosInstance.post<InscriptionSubmissionResponse>(
    "/inscriptions/",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return response.data;
}
