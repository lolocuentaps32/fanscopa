
export interface Registration {
  ORDEN_REGISTRO: number;
  FECHA_REGISTRO: string;
  HORA_REGISTRO: string;
  NOMBRE: string;
  APELLIDOS: string;
  ABONADO: boolean;
  PRIORITARIO: boolean;
  VIP: boolean;
  SOLICITUD: string;
  EMAIL: string;
  CP: string;
  DNI: string;
  DIRECCION: string;
  FECHA_NAC: string;
  LOCALIDAD: string;
  TELEFONO: string;
  OBSERVACIONES: string;
  ACEPTACION_COM: boolean;
  ACEPTACION_TERM: boolean;
  STATUS: 'Pendiente' | 'Procesando' | 'Aceptado' | 'Rechazado';
}

export type UserRole = 'admin' | 'user';

export interface UserSession {
  email: string;
  role: UserRole;
  dni?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isThinking?: boolean;
}
