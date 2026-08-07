import { fetchApi } from './api';

export interface CustomerFeedback {
  id: string;
  name: string;
  phone: string | null;
  type: string;
  message: string;
  rating: number | null;
  createdAt: string;
}

export const feedbackService = {
  submitFeedback: async (data: Omit<CustomerFeedback, 'id' | 'createdAt'>) => {
    return fetchApi('/feedback', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getFeedbacks: async (): Promise<CustomerFeedback[]> => {
    return fetchApi('/feedback');
  },

  deleteFeedback: async (id: string) => {
    return fetchApi(`/feedback/${id}`, {
      method: 'DELETE',
    });
  }
};
