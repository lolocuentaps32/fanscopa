
import { Registration } from "../types";

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

// Helper to simulate DB updates
export const storageService = {
  getRegistrations: (): Registration[] => {
    const saved = localStorage.getItem('copacrm_registrations');
    return saved ? JSON.parse(saved) : initialData;
  },
  saveRegistrations: (data: Registration[]) => {
    localStorage.setItem('copacrm_registrations', JSON.stringify(data));
  },
  updateRegistration: (dni: string, updates: Partial<Registration>) => {
    const data = storageService.getRegistrations();
    const newData = data.map(r => r.DNI === dni ? { ...r, ...updates } : r);
    storageService.saveRegistrations(newData);
    return newData;
  },
  deleteRegistration: (dni: string) => {
    const data = storageService.getRegistrations();
    const newData = data.filter(r => r.DNI !== dni);
    storageService.saveRegistrations(newData);
    return newData;
  }
};
