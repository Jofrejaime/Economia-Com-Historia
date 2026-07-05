import { httpClient } from '../http/client';
import { API_ENDPOINTS } from '../../constants/api';

// Um pedido de acesso identifica o nível pretendido por um documento
// (document_id — o backend resolve o access_level_id a partir dele) ou
// directamente por access_level_id (necessário para conteúdo sem documento
// associado, como quizzes). Pelo menos um dos dois é obrigatório.
export type CreateAccessRequestInput =
  | { document_id: string; access_level_id?: never; justification?: string }
  | { access_level_id: string; document_id?: never; justification?: string };

export const accessService = {
  async createRequest(input: CreateAccessRequestInput): Promise<void> {
    await httpClient.post(API_ENDPOINTS.ACCESS.REQUESTS, input);
  },
};
