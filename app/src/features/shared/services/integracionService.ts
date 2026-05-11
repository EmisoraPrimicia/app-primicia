import { apiClient } from '@/lib/apiClient';
import type { 
  IntegracionGoogleEstado, 
  IniciarConexionResponse,
  GoogleCalendarAdminConfig,
  GoogleCalendarConfigResponse,
  BoldConfig,
  BoldConfigResponse,
  ProbarConexionResponse
} from '@/lib/types/integracion';

export const integracionService = {
  
  iniciarConexionGoogle: async (personaId: number): Promise<IniciarConexionResponse> => 
    apiClient.get<IniciarConexionResponse>('/integraciones/google/iniciar-conexion', { persona_id: personaId }),

  obtenerEstadoGoogle: async (personaId: number): Promise<IntegracionGoogleEstado> => 
    apiClient.get<IntegracionGoogleEstado>(`/integraciones/google/estado/${personaId}`),

  desconectarGoogle: async (personaId: number): Promise<{ mensaje: string }> => 
    apiClient.delete<{ mensaje: string }>(`/integraciones/google/desconectar/${personaId}`),

  
  guardarConfigGoogleAdmin: async (config: GoogleCalendarAdminConfig): Promise<{ mensaje: string }> => 
    apiClient.post<{ mensaje: string }>('/admin/configuracion/google-calendar', config),

  obtenerConfigGoogleAdmin: async (): Promise<GoogleCalendarConfigResponse | null> => 
    apiClient.get<GoogleCalendarConfigResponse | null>('/admin/configuracion/google-calendar'),

  probarConexionGoogleAdmin: async (): Promise<ProbarConexionResponse> => 
    apiClient.post<ProbarConexionResponse>('/admin/configuracion/google-calendar/probar-conexion', {}),

  eliminarConfigGoogleAdmin: async (): Promise<{ mensaje: string }> => 
    apiClient.delete<{ mensaje: string }>('/admin/configuracion/google-calendar'),

  
  guardarConfigBold: async (empresaId: number, config: BoldConfig): Promise<{ mensaje: string }> => 
    apiClient.post<{ mensaje: string }>(`/empresas/${empresaId}/integraciones/bold/configurar`, config),

  obtenerConfigBold: async (empresaId: number): Promise<BoldConfigResponse | null> => 
    apiClient.get<BoldConfigResponse | null>(`/empresas/${empresaId}/integraciones/bold/configuracion`),

  probarConexionBold: async (empresaId: number): Promise<ProbarConexionResponse> => 
    apiClient.post<ProbarConexionResponse>(`/empresas/${empresaId}/integraciones/bold/probar-conexion`, {}),

  activarDesactivarBold: async (empresaId: number, activa: boolean): Promise<{ mensaje: string }> => 
    apiClient.patch<{ mensaje: string }>(`/empresas/${empresaId}/integraciones/bold/activar`, {}, { activa }),

  eliminarConfigBold: async (empresaId: number): Promise<{ mensaje: string }> => 
    apiClient.delete<{ mensaje: string }>(`/empresas/${empresaId}/integraciones/bold`),

  
  configurarMetaBusiness: async (businessId: string, accessToken: string): Promise<any> => 
    apiClient.post<any>('/configuracion-meta', { business_id: businessId, access_token: accessToken }),

  obtenerConfiguracionMeta: async (): Promise<any | null> => 
    apiClient.get<any | null>('/configuracion-meta'),

  eliminarConfiguracionMeta: async (): Promise<void> => 
    apiClient.delete('/configuracion-meta'),
};

