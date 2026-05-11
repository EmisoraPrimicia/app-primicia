import { apiClient } from '@/lib/apiClient';
import type {
  PersonaEmpleado,
  CrearPersonaDto,
  ActualizarPersonaDto,
  ActivarUsuarioResponse,
  RegenerarPasswordResponse,
  AgenteServicio,
  Horario,
  CrearHorarioDto,
  RespuestaPaginada
} from '@/lib/types';

export const personaService = {
  listar: async (
    empresaId: number,
    activo: boolean = true,
    pagina: number = 1,
    tamanoPagina: number = 10
  ): Promise<RespuestaPaginada<PersonaEmpleado>> =>
    apiClient.get<RespuestaPaginada<PersonaEmpleado>>(`/empresas/${empresaId}/agentes`, {
      activo,
      pagina,
      tamano_pagina: tamanoPagina
    }),

  obtener: async (personaId: number): Promise<PersonaEmpleado> =>
    apiClient.get<PersonaEmpleado>(`/personas/${personaId}`),

  crear: async (datos: CrearPersonaDto): Promise<PersonaEmpleado> =>
    apiClient.post<PersonaEmpleado>('/personas/', datos),

  actualizar: async (personaId: number, datos: ActualizarPersonaDto): Promise<PersonaEmpleado> =>
    apiClient.patch<PersonaEmpleado>(`/personas/${personaId}`, datos),

  activarDesactivar: async (personaId: number, activa: boolean): Promise<PersonaEmpleado> =>
    apiClient.patch<PersonaEmpleado>(`/personas/${personaId}`, { activa }),

  regenerarPassword: async (personaId: number): Promise<RegenerarPasswordResponse> =>
    apiClient.post<RegenerarPasswordResponse>(`/personas/${personaId}/regenerar-password`),

  cambiarEstadoUsuarioAccount: async (personaId: number, activo: boolean): Promise<void> =>
    apiClient.patch(`/personas/${personaId}/usuario/estado`, {}, { activo }),

  cambiarEstado: async (personaId: number, activo: boolean): Promise<PersonaEmpleado> =>
    apiClient.patch<PersonaEmpleado>(`/personas/${personaId}/activar-desactivar`, {}, { activo }),

  eliminar: async (personaId: number): Promise<void> =>
    apiClient.delete(`/personas/${personaId}`),


  listarServiciosPersona: async (personaId: number): Promise<AgenteServicio[]> =>
    apiClient.get<AgenteServicio[]>(`/personas/${personaId}/servicios`),

  asignarServicio: async (personaId: number, empresaServicioId: number, duracionMinutos?: number): Promise<AgenteServicio> =>
    apiClient.post<AgenteServicio>(`/personas/${personaId}/servicios/${empresaServicioId}`, {}, { duracion_minutos: duracionMinutos }),

  actualizarDuracionServicio: async (agenteServicioId: number, duracionMinutos: number): Promise<AgenteServicio> =>
    apiClient.patch<AgenteServicio>(`/personas/servicios/${agenteServicioId}`, {}, { duracion_minutos: duracionMinutos }),

  desasignarServicio: async (agenteServicioId: number): Promise<void> =>
    apiClient.delete(`/personas/servicios/${agenteServicioId}`),


  listarHorarios: async (personaId: number): Promise<Horario[]> =>
    apiClient.get<Horario[]>(`/personas/${personaId}/horarios`),

  crearHorario: async (personaId: number, datos: CrearHorarioDto): Promise<Horario> =>
    apiClient.post<Horario>(`/personas/${personaId}/horarios`, datos),

  actualizarHorario: async (horarioId: number, datos: { dia_semana?: string; hora_inicio?: string; hora_fin?: string }): Promise<Horario> =>
    apiClient.patch<Horario>(`/personas/horarios/${horarioId}`, {}, datos),

  eliminarHorario: async (horarioId: number): Promise<void> =>
    apiClient.delete(`/personas/horarios/${horarioId}`),
};

