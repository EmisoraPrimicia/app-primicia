import { apiClient } from '@/lib/apiClient';

import type { Rol } from '../models/common.models';

export const rolService = {
  obtener: async (rolId: number): Promise<Rol> =>
    apiClient.get<Rol>(`/roles/${rolId}`),

  listar: async (): Promise<Rol[]> =>
    apiClient.get<Rol[]>('/roles'),
};

