import { supabase } from "../lib/supabase";
import { Registration } from "../types";

// Initial sample data - used as fallback if Supabase is unavailable
export const initialData: Registration[] = [
  {
    ORDEN_REGISTRO: 360,
    FECHA_REGISTRO: "04/02/2026",
    HORA_REGISTRO: "18:19:07",
    NOMBRE: "Marco",
    APELLIDOS: "Urbano Castilla",
    ABONADO: true,
    PRIORITARIO: true,
    VIP: false,
    SOLICITUD: "Abono Copa",
    EMAIL: "manuel.urba@gmail.com",
    CP: "13300",
    DNI: "45738884A",
    DIRECCION: "Francisco Morales Nieva 2",
    FECHA_NAC: "3/06/2022",
    LOCALIDAD: "Valdepeñas",
    TELEFONO: "648251815",
    OBSERVACIONES: "",
    ACEPTACION_COM: true,
    ACEPTACION_TERM: true,
    STATUS: 'Aceptado'
  },
  {
    ORDEN_REGISTRO: 589,
    FECHA_REGISTRO: "05/02/2026",
    HORA_REGISTRO: "19:40:22",
    NOMBRE: "Marco",
    APELLIDOS: "Navarro Rubio",
    ABONADO: false,
    PRIORITARIO: false,
    VIP: false,
    SOLICITUD: "Entrada Cuartos de Final",
    EMAIL: "marco.navarro@gmail.com",
    CP: "13300",
    DNI: "71371668T",
    DIRECCION: "Salida Membrilla",
    FECHA_NAC: "29/11/2007",
    LOCALIDAD: "Valdepeñas",
    TELEFONO: "640664250",
    OBSERVACIONES: "",
    ACEPTACION_COM: true,
    ACEPTACION_TERM: true,
    STATUS: 'Pendiente'
  }
];

// Transform database row to Registration interface
function transformFromDb(row: any): Registration {
  return {
    ORDEN_REGISTRO: row.orden_registro,
    FECHA_REGISTRO: row.fecha_registro ? new Date(row.fecha_registro).toLocaleDateString('es-ES') : '',
    HORA_REGISTRO: row.hora_registro || '',
    NOMBRE: row.nombre || '',
    APELLIDOS: row.apellidos || '',
    ABONADO: row.abonado || false,
    PRIORITARIO: row.prioritario || false,
    VIP: row.vip || false,
    SOLICITUD: row.solicitud || '',
    EMAIL: row.email || '',
    CP: row.cp || '',
    DNI: row.dni || '',
    DIRECCION: row.direccion || '',
    FECHA_NAC: row.fecha_nac ? new Date(row.fecha_nac).toLocaleDateString('es-ES') : '',
    LOCALIDAD: row.localidad || '',
    TELEFONO: row.telefono || '',
    OBSERVACIONES: row.observaciones || '',
    ACEPTACION_COM: row.aceptacion_com || false,
    ACEPTACION_TERM: row.aceptacion_term || false,
    STATUS: row.status || 'Pendiente'
  };
}

// Transform Registration to database row format
function transformToDb(reg: Partial<Registration>): Record<string, any> {
  const result: Record<string, any> = {};

  if (reg.ORDEN_REGISTRO !== undefined) result.orden_registro = reg.ORDEN_REGISTRO;
  if (reg.NOMBRE !== undefined) result.nombre = reg.NOMBRE;
  if (reg.APELLIDOS !== undefined) result.apellidos = reg.APELLIDOS;
  if (reg.ABONADO !== undefined) result.abonado = reg.ABONADO;
  if (reg.PRIORITARIO !== undefined) result.prioritario = reg.PRIORITARIO;
  if (reg.VIP !== undefined) result.vip = reg.VIP;
  if (reg.SOLICITUD !== undefined) result.solicitud = reg.SOLICITUD;
  if (reg.EMAIL !== undefined) result.email = reg.EMAIL;
  if (reg.CP !== undefined) result.cp = reg.CP;
  if (reg.DNI !== undefined) result.dni = reg.DNI;
  if (reg.DIRECCION !== undefined) result.direccion = reg.DIRECCION;
  if (reg.LOCALIDAD !== undefined) result.localidad = reg.LOCALIDAD;
  if (reg.TELEFONO !== undefined) result.telefono = reg.TELEFONO;
  if (reg.OBSERVACIONES !== undefined) result.observaciones = reg.OBSERVACIONES;
  if (reg.ACEPTACION_COM !== undefined) result.aceptacion_com = reg.ACEPTACION_COM;
  if (reg.ACEPTACION_TERM !== undefined) result.aceptacion_term = reg.ACEPTACION_TERM;
  if (reg.STATUS !== undefined) result.status = reg.STATUS;

  return result;
}

// Supabase-backed storage service with localStorage fallback
export const storageService = {
  // Get all registrations
  getRegistrations: async (): Promise<Registration[]> => {
    try {
      const { data, error } = await supabase
        .from('registrations')
        .select('*')
        .order('orden_registro', { ascending: true });

      if (error) {
        console.warn('Supabase error, falling back to localStorage:', error.message);
        return storageService.getLocalRegistrations();
      }

      return data.map(transformFromDb);
    } catch (err) {
      console.warn('Network error, falling back to localStorage:', err);
      return storageService.getLocalRegistrations();
    }
  },

  // Get registrations from localStorage (fallback)
  getLocalRegistrations: (): Registration[] => {
    const saved = localStorage.getItem('copacrm_registrations');
    return saved ? JSON.parse(saved) : initialData;
  },

  // Save to localStorage (fallback)
  saveLocalRegistrations: (data: Registration[]) => {
    localStorage.setItem('copacrm_registrations', JSON.stringify(data));
  },

  // Update a registration by DNI
  updateRegistration: async (dni: string, updates: Partial<Registration>): Promise<Registration[]> => {
    try {
      const { error } = await supabase
        .from('registrations')
        .update(transformToDb(updates))
        .eq('dni', dni);

      if (error) {
        console.warn('Supabase update error, using localStorage:', error.message);
        return storageService.updateLocalRegistration(dni, updates);
      }

      // Return updated list
      return storageService.getRegistrations();
    } catch (err) {
      console.warn('Network error during update, using localStorage:', err);
      return storageService.updateLocalRegistration(dni, updates);
    }
  },

  // Update in localStorage
  updateLocalRegistration: (dni: string, updates: Partial<Registration>): Registration[] => {
    const data = storageService.getLocalRegistrations();
    const newData = data.map(r => r.DNI === dni ? { ...r, ...updates } : r);
    storageService.saveLocalRegistrations(newData);
    return newData;
  },

  // Delete a registration by DNI
  deleteRegistration: async (dni: string): Promise<Registration[]> => {
    try {
      const { error } = await supabase
        .from('registrations')
        .delete()
        .eq('dni', dni);

      if (error) {
        console.warn('Supabase delete error, using localStorage:', error.message);
        return storageService.deleteLocalRegistration(dni);
      }

      return storageService.getRegistrations();
    } catch (err) {
      console.warn('Network error during delete, using localStorage:', err);
      return storageService.deleteLocalRegistration(dni);
    }
  },

  // Delete from localStorage
  deleteLocalRegistration: (dni: string): Registration[] => {
    const data = storageService.getLocalRegistrations();
    const newData = data.filter(r => r.DNI !== dni);
    storageService.saveLocalRegistrations(newData);
    return newData;
  },

  // Create a new registration
  createRegistration: async (reg: Omit<Registration, 'ORDEN_REGISTRO'>): Promise<Registration | null> => {
    try {
      const { data, error } = await supabase
        .from('registrations')
        .insert(transformToDb(reg as Registration))
        .select()
        .single();

      if (error) {
        console.warn('Supabase insert error:', error.message);
        return null;
      }

      return transformFromDb(data);
    } catch (err) {
      console.warn('Network error during create:', err);
      return null;
    }
  },

  // Find registration by email or DNI (for login)
  findRegistration: async (email: string, dni: string): Promise<Registration | null> => {
    try {
      let query = supabase.from('registrations').select('*');

      if (email) {
        query = query.eq('email', email);
      } else if (dni) {
        query = query.eq('dni', dni);
      } else {
        return null;
      }

      const { data, error } = await query.limit(1).single();

      if (error) {
        console.warn('Supabase find error, checking localStorage:', error.message);
        return storageService.findLocalRegistration(email, dni);
      }

      return transformFromDb(data);
    } catch (err) {
      console.warn('Network error during find, checking localStorage:', err);
      return storageService.findLocalRegistration(email, dni);
    }
  },

  // Find in localStorage
  findLocalRegistration: (email: string, dni: string): Registration | null => {
    const data = storageService.getLocalRegistrations();
    return data.find(r => r.EMAIL === email || r.DNI === dni) || null;
  }
};
