import { httpClient } from '../http/client';
import { API_ENDPOINTS } from '../../constants/api';

export interface CreateAccessRequestInput {
  document_id: string;
  justification?: string;
}

export const accessService = {
  async createRequest(input: CreateAccessRequestInput): Promise<void> {
    await httpClient.post(API_ENDPOINTS.ACCESS.REQUESTS, input);
  },
};
