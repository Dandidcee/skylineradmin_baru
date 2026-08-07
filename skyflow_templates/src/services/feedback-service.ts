import { fetchApi, fetchPublic } from './api';

export interface CustomerFeedback {
  id: string;
  name: string;
  companyName?: string | null;
  phone: string | null;
  type: string;
  message: string;
  rating: number | null;
  isApproved: boolean;
  createdAt: string;
}

export const feedbackService = {
  submitFeedback: async (data: Omit<CustomerFeedback, 'id' | 'createdAt'>) => {
    return fetchPublic('/feedback', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getFeedbacks: async (): Promise<CustomerFeedback[]> => {
    return fetchApi('/feedback');
  },

  getPublicFeedbacks: async (): Promise<CustomerFeedback[]> => {
    return fetchPublic('/feedback/public');
  },

  deleteFeedback: async (id: string) => {
    return fetchApi(`/feedback/${id}`, {
      method: 'DELETE',
    });
  },

  toggleApprove: async (id: string, isApproved: boolean) => {
    return fetchApi(`/feedback/${id}/approve`, {
      method: 'PATCH',
      body: JSON.stringify({ isApproved }),
    });
  }
};
