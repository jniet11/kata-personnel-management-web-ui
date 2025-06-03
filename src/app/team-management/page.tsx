"use client";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Image from 'next/image';

interface UserCreationRequest { // Renombrada para mayor claridad
  id: string | number;
  name: string;
  request: string; // Debería ser "Creacion de Usuario" o similar
  status: string;
  // Podrías añadir otros campos si vienen de la API y son necesarios
  email?: string;
  area?: string;
  role?: string;
}

interface AccessRequestData {
  id: string | number;
  user_id: string | number; // ID del usuario para el que se solicita el acceso
  user_name: string;       // Nombre del usuario
  access_type: string;     // Tipos de acceso solicitados (ej: "GitHub, AWS")
  status: string;
  request: string;         // Explicitly add the request type
  created_at?: string;      // Opcional, si lo necesitas mostrar
}

export default function  TeamManagement() {
  const router = useRouter();
  const [userCreationRequests, setUserCreationRequests] = useState<UserCreationRequest[]>([]);
  const [accessRequests, setAccessRequests] = useState<AccessRequestData[]>([]);
  const [isLoadingUserCreations, setIsLoadingUserCreations] = useState(true);
  const [isLoadingAccessRequests, setIsLoadingAccessRequests] = useState(true);
  const [error, setError] = useState<string | null>(null); // Podrías tener errores separados si lo prefieres

  useEffect(() => {
    const fetchUserCreationRequests = async () => {
      setIsLoadingUserCreations(true);
      setError(null);
      try {
        const response = await axios.get<UserCreationRequest[]>('http://localhost:4000/personnel-management/get-users');
        const mappedData = response.data.map(req => ({ ...req, request: req.request || "creacion de usuario" }));
        setUserCreationRequests(mappedData);
      } catch (err) {
        console.error("Error fetching user creation requests:", err);
        setError("No se pudieron cargar las solicitudes de creación de usuarios.");
      } finally {
        setIsLoadingUserCreations(false);
      }
    };

    const fetchAccessRequestsData = async () => {
      setIsLoadingAccessRequests(true);
      try {
        const response = await axios.get<{ success: boolean, data: AccessRequestData[] }>('http://localhost:4000/personnel-management/get-access-requests');
        if (response.data.success) {
          const mappedData: AccessRequestData[] = response.data.data.map(req => ({
            ...req,
            request: "solicitud de acceso" }));
          setAccessRequests(mappedData);
        } else {
          console.error("API for access requests returned success:false");
          if(!error) setError("No se pudieron cargar las solicitudes de acceso.");
        }
      } catch (err) {
        console.error("Error fetching access requests:", err);
        if(!error) setError("Error de red al cargar las solicitudes de acceso.");
      } finally {
        setIsLoadingAccessRequests(false);
      }
    };

    fetchUserCreationRequests();
    fetchAccessRequestsData();
  }, []);

  const handleDeleteRequest = async (requestId: string | number, requestType: 'userCreation' | 'accessRequest') => {
    let requestToDelete: UserCreationRequest | AccessRequestData | undefined;
    let endpointUrl: string;
    let successMsg: string;
    let itemName: string;
    let itemTypeDescription: string;

    if (requestType === 'userCreation') {
      requestToDelete = userCreationRequests.find(req => req.id === requestId);
      if (!requestToDelete) {
        alert("Error: Solicitud de creación de usuario no encontrada para eliminar.");
        return;
      }
      endpointUrl = `http://localhost:4000/personnel-management/delete-user/${requestToDelete.id}`;
      itemName = (requestToDelete as UserCreationRequest).name;
      itemTypeDescription = (requestToDelete as UserCreationRequest).request;
      successMsg = `El usuario "${itemName}" ha sido eliminado exitosamente.`;
    } else { // accessRequest
      requestToDelete = accessRequests.find(req => req.id === requestId);
      if (!requestToDelete) {
        alert("Error: Solicitud de acceso no encontrada para eliminar.");
        return;
      }
      endpointUrl = `http://localhost:4000/personnel-management/delete-access-request/${requestToDelete.id}`;
      itemName = (requestToDelete as AccessRequestData).user_name;
      itemTypeDescription = "Solicitud de Acceso";
      successMsg = `La solicitud de acceso para "${itemName}" ha sido eliminada exitosamente.`;
    }

    if (!requestToDelete) {
      console.error("Solicitud no encontrada para eliminar:", requestId);
      alert("Error: No se encontró la solicitud especificada.");
      return;
    }

    if (confirm(`¿Estás seguro de que quieres eliminar "${itemName}" (${itemTypeDescription})?`)) {
      try {
        await axios.delete(endpointUrl);
        alert(successMsg);
        if (requestType === 'userCreation') {
          setUserCreationRequests(prevRequests => prevRequests.filter(req => req.id !== requestId));
        } else {
          setAccessRequests(prevRequests => prevRequests.filter(req => req.id !== requestId));
        }
      } catch (err) {
        console.error(`Error al eliminar ${itemTypeDescription}:`, err);
        let errorMsg = `Error de red o al procesar la solicitud de eliminación para ${itemTypeDescription}.`;
        if (axios.isAxiosError(err) && err.response) {
          errorMsg = `Error al eliminar: ${err.response.data?.error || err.response.data?.message || err.message}`;
        }
        alert(errorMsg);
      }
    }
  };

  const handleEditRequest = (requestItem: UserCreationRequest | AccessRequestData, requestType: 'userCreation' | 'accessRequest') => {
    if (requestType === 'userCreation') {
      router.push(`/edit-user/${requestItem.id}`);
    } else {
      router.push(`/edit-access-request/${requestItem.id}`);
    }
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-xl shadow-xl w-full max-w-5xl mx-auto my-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-center text-gray-700 my-8 md:my-10 px-4">
        Gestión de Ingresos y Recursos de Equipo
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 px-4"> {/* Mantener px-4 aquí */}
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg">
          <div className="flex items-center mb-4">
            <div className="bg-blue-600 p-3 rounded-full mr-4">
              {/* Icono para Creación de Usuario */}
              <Image
                className="shrink-0"
                src="/img/the-medal-svgrepo-com.svg"
                alt="Creación de Usuario"
                width={48}
                height={48}
              />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-semibold text-gray-700">
                Creación de Usuario
              </h2>
            </div>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Registrar a una nueva persona en el equipo.
          </p>
          <button
            onClick={() => router.push('/create-user')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 shadow-md"
          >
            Registrar nuevo ingreso
          </button>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg">
          <div className="flex items-center mb-4">
            <div className="bg-blue-600 p-3 rounded-full mr-4">
              {/* Icono para Solicitud de Accesos */}
              <Image
                className="shrink-0"
                src="/img/airplane-svgrepo-com.svg"
                alt="Solicitud de Accesos"
                width={48}
                height={48}
              />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-semibold text-gray-700">
                Solicitud de Accesos
              </h2>
            </div>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Solicitar permisos para un nuevo miembro del equipo.
          </p>
          <button
            onClick={() => router.push('/access-request')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 shadow-md"
          >
            Solicitar acceso
          </button>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg">
          <div className="flex items-center mb-4">
            <div className="bg-blue-600 p-3 rounded-full mr-4">
              {/* Icono para Asignación de Computadores */}
              <Image
                className="shrink-0"
                src="/img/computer-svgrepo-com.svg"
                alt="Asignación de Computadores"
                width={48}
                height={48}
              />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-semibold text-gray-700">
                Asignación de Computadores
              </h2>
            </div>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Asignar un equipo portátil a un nuevo ingreso.
          </p>
          <button
            onClick={() => router.push('/computer-assignment')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 shadow-md"
          >
            Asignar computador
          </button>
        </div>
      </div>

      <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg mx-4 mb-8"> {/* mx-4 para padding en los lados de esta sección */}
        <h2 className="text-xl md:text-2xl font-semibold text-gray-700 mb-6">
          Solicitudes Recientes
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-3 px-4 text-gray-600 font-semibold text-sm">
                  Persona
                </th>
                <th className="py-3 px-4 text-gray-600 font-semibold text-sm">
                  Solicitud
                </th>
                <th className="py-3 px-4 text-gray-600 font-semibold text-sm">
                  Estado
                </th>
                <th className="py-3 px-4 text-gray-600 font-semibold text-sm">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoadingUserCreations || isLoadingAccessRequests ? (
                <tr>
                  <td colSpan={4} className="text-center py-4">Cargando solicitudes...</td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={4} className="text-center py-4 text-red-500">{error}</td>
                </tr>
              ) : (userCreationRequests.length === 0 && accessRequests.length === 0) ? (
                <tr>
                  <td colSpan={4} className="text-center py-4">No hay solicitudes recientes.</td>
                </tr>
              ) : (
                <>
                {userCreationRequests.map((request) => (
                  <tr key={`user-${request.id}`} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-700">{request.name}</td>
                    <td className="py-3 px-4 text-gray-700">{request.request}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                          request.status.toLowerCase() === 'pendiente' ? 'bg-amber-100 text-amber-700' :
                          request.status.toLowerCase() === 'aprobado' ? 'bg-green-100 text-green-700' :
                          request.status.toLowerCase() === 'rechazado' ? 'bg-red-100 text-red-700' :
                          'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {request.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 space-x-2"> {/* Añadido space-x-2 para espaciar los botones */}
                      <button
                        onClick={() => handleEditRequest(request, 'userCreation')}
                        className="text-blue-600 hover:text-blue-700 font-semibold text-sm"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteRequest(request.id, 'userCreation')}
                        className="text-red-600 hover:text-red-900 font-semibold text-sm"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
                {accessRequests.map((request) => (
                  <tr key={`access-${request.id}`} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-700">{request.user_name}</td>
                    <td className="py-3 px-4 text-gray-700">solicitud de acceso ({request.access_type})</td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                          request.status.toLowerCase() === 'pendiente' ? 'bg-amber-100 text-amber-700' :
                          request.status.toLowerCase() === 'aprobado' ? 'bg-green-100 text-green-700' :
                          request.status.toLowerCase() === 'rechazado' ? 'bg-red-100 text-red-700' :
                          'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {request.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 space-x-2">
                      <button onClick={() => handleEditRequest(request, 'accessRequest')} className="text-blue-600 hover:text-blue-700 font-semibold text-sm">Editar</button>
                      <button onClick={() => handleDeleteRequest(request.id, 'accessRequest')} className="text-red-600 hover:text-red-900 font-semibold text-sm">Eliminar</button>
                    </td>
                  </tr>
                ))}
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
