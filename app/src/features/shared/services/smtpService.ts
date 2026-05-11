import { apiClient } from '@/lib/apiClient';
import type { ConfiguracionSMTP, CrearConfiguracionSMTPDto } from '@/lib/types';

export const smtpService = {
  obtenerConfiguracionSMTP: async (): Promise<ConfiguracionSMTP> => 
    apiClient.get<ConfiguracionSMTP>('/smtp/configuracion'),

  crearConfiguracionSMTP: async (datos: CrearConfiguracionSMTPDto): Promise<ConfiguracionSMTP> => 
    apiClient.post<ConfiguracionSMTP>('/smtp/configuracion', datos),

  actualizarConfiguracionSMTP: async (id: number, datos: Partial<CrearConfiguracionSMTPDto>): Promise<ConfiguracionSMTP> => 
    apiClient.patch<ConfiguracionSMTP>(`/smtp/configuracion/${id}`, datos),

  probarConexionSMTP: async (): Promise<{ mensaje: string }> => 
    apiClient.post<{ mensaje: string }>('/smtp/probar-conexion', {}),
};

