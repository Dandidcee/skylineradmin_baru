import { fetchApi, fetchPublic } from "./api";

export interface SurveyResponse {
  id: string;
  name: string;
  province: string;
  city: string;
  district: string;
  fullAddress: string;
  phone: string;
  needsClass: string;
  interestLevel?: string;
  joinCommunity: boolean;
  communityChannel?: string;
  gender?: string;
  age?: number;
  createdAt: string;
}

export const formService = {
  submitForm: async (data: Partial<SurveyResponse>) => {
    return fetchPublic("/forms/submit", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  getAllForms: async (): Promise<SurveyResponse[]> => {
    return fetchApi("/forms");
  },

  deleteForm: async (id: string) => {
    return fetchApi(`/forms/${id}`, {
      method: "DELETE",
    });
  }
};
