import { apiClient } from '@/lib/apiClient';
import type { Agendamiento, FiltrosAgendamiento } from '@/lib/types/agendamiento';

export const agendamientoService = {
  listarPorEmpresa: async (empresaId: number, filtros?: FiltrosAgendamiento): Promise<Agendamiento[]> => 
    apiClient.get<Agendamiento[]>(`/agendamientos/empresa/${empresaId}`, filtros),

  cancelarAgendamiento: async (agendamientoId: number): Promise<void> => 
    apiClient.delete(`/agendamientos/agente/${agendamientoId}`),
};

