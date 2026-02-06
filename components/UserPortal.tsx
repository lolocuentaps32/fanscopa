
import React, { useState, useEffect } from 'react';
import { Registration, UserSession } from '../types';
import { storageService } from '../store/dataStore';

interface Props {
  session: UserSession;
  onLogout: () => void;
}

const UserPortal: React.FC<Props> = ({ session, onLogout }) => {
  const [data, setData] = useState<Registration | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Registration>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadUserData();
  }, [session]);

  const loadUserData = async () => {
    setLoading(true);
    try {
      const userReg = await storageService.findRegistration(session.email, session.dni || '');
      if (userReg) {
        setData(userReg);
        setFormData(userReg);
      }
    } catch (err) {
      console.error('Error loading user data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!data) return;

    setSaving(true);
    try {
      await storageService.updateRegistration(data.DNI, formData);
      setData({ ...data, ...formData } as Registration);
      setIsEditing(false);
    } catch (err) {
      console.error('Error saving data:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!data) return;

    if (window.confirm('¿Estás seguro de que deseas eliminar tu solicitud? Esta acción no se puede deshacer.')) {
      try {
        await storageService.deleteRegistration(data.DNI);
        setData(null);
        onLogout();
      } catch (err) {
        console.error('Error deleting registration:', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
          <p className="text-slate-500 font-medium">Cargando tu información...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 max-w-md">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400 text-2xl">?</div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">No se encontró registro</h2>
          <p className="text-slate-600 mb-6">No hemos encontrado ninguna solicitud asociada a tu cuenta. ¿Deseas crear una nueva o contactar con soporte?</p>
          <div className="flex gap-4 justify-center">
            <button className="bg-[#0D88CA] text-white px-6 py-2 rounded-lg font-semibold">Nueva Solicitud</button>
            <button onClick={onLogout} className="text-slate-600 font-medium">Cerrar sesión</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Tu Solicitud de {data.SOLICITUD}</h1>
          <p className="text-slate-500 mt-1 tracking-wide">Registro #{data.ORDEN_REGISTRO} • Registrado el {data.FECHA_REGISTRO}</p>
        </div>
        <div className={`px-4 py-2 rounded-full font-bold shadow-sm flex items-center gap-2 
          ${data.STATUS === 'Aceptado' ? 'bg-emerald-100 text-emerald-700' :
            data.STATUS === 'Pendiente' ? 'bg-amber-100 text-amber-700' :
              data.STATUS === 'Rechazado' ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'}`}>
          <div className={`w-2 h-2 rounded-full animate-pulse ${data.STATUS === 'Aceptado' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
          {data.STATUS}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-slate-700">Datos Personales</h3>
              {!isEditing && (
                <button onClick={() => setIsEditing(true)} className="text-[#0D88CA] hover:text-[#0c7ab5] text-sm font-medium transition">Editar información</button>
              )}
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase">Nombre Completo</label>
                  {isEditing ? (
                    <input
                      className="w-full mt-1 border-slate-200 rounded-lg focus:ring-indigo-500"
                      value={formData.NOMBRE || ''}
                      onChange={(e) => setFormData({ ...formData, NOMBRE: e.target.value })}
                    />
                  ) : (
                    <div className="text-slate-800 font-medium mt-1">{data.NOMBRE} {data.APELLIDOS}</div>
                  )}
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase">Documento (DNI/NIE)</label>
                  <div className="text-slate-800 font-medium mt-1">{data.DNI}</div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase">Email de contacto</label>
                  {isEditing ? (
                    <input
                      className="w-full mt-1 border-slate-200 rounded-lg focus:ring-indigo-500"
                      value={formData.EMAIL || ''}
                      onChange={(e) => setFormData({ ...formData, EMAIL: e.target.value })}
                    />
                  ) : (
                    <div className="text-slate-800 font-medium mt-1">{data.EMAIL}</div>
                  )}
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase">Teléfono</label>
                  {isEditing ? (
                    <input
                      className="w-full mt-1 border-slate-200 rounded-lg focus:ring-indigo-500"
                      value={formData.TELEFONO || ''}
                      onChange={(e) => setFormData({ ...formData, TELEFONO: e.target.value })}
                    />
                  ) : (
                    <div className="text-slate-800 font-medium mt-1">{data.TELEFONO}</div>
                  )}
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase">Dirección</label>
                  {isEditing ? (
                    <input
                      className="w-full mt-1 border-slate-200 rounded-lg focus:ring-indigo-500"
                      value={formData.DIRECCION || ''}
                      onChange={(e) => setFormData({ ...formData, DIRECCION: e.target.value })}
                    />
                  ) : (
                    <div className="text-slate-800 font-medium mt-1">{data.DIRECCION}, {data.LOCALIDAD} ({data.CP})</div>
                  )}
                </div>
              </div>

              {isEditing && (
                <div className="mt-8 flex gap-3">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-[#0D88CA] text-white px-6 py-2 rounded-lg font-bold shadow-md shadow-sky-100 hover:bg-[#0c7ab5] transition disabled:opacity-50 flex items-center gap-2"
                  >
                    {saving && <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>}
                    Guardar Cambios
                  </button>
                  <button onClick={() => setIsEditing(false)} className="bg-slate-100 text-slate-600 px-6 py-2 rounded-lg font-semibold hover:bg-slate-200 transition">Cancelar</button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-bold text-slate-700 mb-4">Estado de tu solicitud</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center text-sm font-bold">1</div>
                <div className="text-sm">
                  <p className="font-semibold text-slate-700">Solicitud Recibida</p>
                  <p className="text-slate-400 text-xs">{data.FECHA_REGISTRO}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${['Aceptado', 'Procesando', 'Rechazado'].includes(data.STATUS) ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}>2</div>
                <div className="text-sm">
                  <p className={`font-semibold ${['Aceptado', 'Procesando', 'Rechazado'].includes(data.STATUS) ? 'text-slate-700' : 'text-slate-400'}`}>En Revisión</p>
                  <p className="text-slate-400 text-xs">Validación técnica</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${data.STATUS === 'Aceptado' ? 'bg-emerald-500 text-white' : data.STATUS === 'Rechazado' ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-400'}`}>3</div>
                <div className="text-sm">
                  <p className={`font-semibold ${['Aceptado', 'Rechazado'].includes(data.STATUS) ? 'text-slate-700' : 'text-slate-400'}`}>Resolución Final</p>
                  <p className="text-slate-400 text-xs">{data.STATUS === 'Aceptado' ? '¡Tu plaza está reservada!' : 'Pendiente de confirmación'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-rose-50 rounded-2xl p-6 border border-rose-100">
            <h4 className="text-rose-800 font-bold mb-2">Zona de Peligro</h4>
            <p className="text-rose-600 text-sm mb-4">Si deseas retirar tu solicitud, puedes hacerlo aquí. Ten en cuenta que perderás tu número de orden actual.</p>
            <button
              onClick={handleDelete}
              className="w-full bg-rose-100 text-rose-700 py-2 rounded-lg font-bold hover:bg-rose-200 transition"
            >
              Retirar Solicitud
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserPortal;
