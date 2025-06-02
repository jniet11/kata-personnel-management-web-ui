"use client";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Image from 'next/image';

interface RecentRequest {
  id: string | number;
  name: string;
  request: string;
  status: string;
}

export default function  TeamManagement() {
  const router = useRouter();
  const [recentRequests, setRecentRequests] = useState<RecentRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecentRequests = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await axios.get<RecentRequest[]>('http://localhost:4000/personnel-management/get-users');
        setRecentRequests(response.data);
      } catch (err) {
        console.error("Error fetching recent requests:", err);
        setError("No se pudieron cargar las solicitudes recientes. Inténtelo más tarde.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentRequests();
  }, []);

  const handleDeleteRequest = async (requestId: string | number) => {
    const requestToDelete = recentRequests.find(req => req.id === requestId);

    if (!requestToDelete) {
      console.error("Solicitud no encontrada para eliminar:", requestId);
      alert("Error: No se encontró la solicitud especificada.");
      return;
    }

    const isUserCreationRequest = requestToDelete.request.toLowerCase() === "creacion de usuario";

    if (confirm(`¿Estás seguro de que quieres procesar la eliminación para "${requestToDelete.name}" (${requestToDelete.request})?`)) {
      if (isUserCreationRequest) {
        try {
          const API_ENDPOINT_DELETE_USER = `http://localhost:4000/personnel-management/delete-user/${requestToDelete.id}`;
          await axios.delete(API_ENDPOINT_DELETE_USER);
          alert(`El usuario "${requestToDelete.name}" (ID: ${requestToDelete.id}) ha sido eliminado exitosamente.`);
          setRecentRequests(prevRequests => prevRequests.filter(req => req.id !== requestId));
        } catch (error) {
          console.error("Error al eliminar el usuario:", error);
          if (axios.isAxiosError(error) && error.response) {
            alert(`Error al eliminar el usuario: ${error.response.data?.message || error.message}`);
          } else {
            alert("Error de red o al procesar la solicitud de eliminación del usuario.");
          }
        }
      } else {
        alert(`La eliminación para el tipo de solicitud "${requestToDelete.request}" no es una eliminación de usuario directa o requiere un proceso diferente.`);
      }
    }
  };

  return (
    <div className="container mx-auto bg-white">
      <h1 className="text-3xl font-bold text-center text-gray-700 mb-10">
        Gestión de Ingresos y Recursos de Equipo
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center mb-4">
            <div className="bg-blue-500 p-3 rounded-full mr-4">
              {/* Usar next/image para los íconos */}
              <Image
                className="shrink-0"
                src="/img/the-medal-svgrepo-com.svg"
                alt="Creación de Usuario"
                width={48}
                height={48}
              />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-700">
                Creación de Usuario
              </h2>
            </div>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Registrar a una nueva persona en el equipo.
          </p>
          <button
            onClick={() => router.push('/create-user')}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
          >
            Registrar nuevo ingreso
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center mb-4">
            <div className="bg-blue-500 p-3 rounded-full mr-4">
              <Image
                className="shrink-0"
                src="/img/airplane-svgrepo-com.svg"
                alt="Solicitud de Accesos"
                width={48}
                height={48}
              />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-700">
                Solicitud de Accesos
              </h2>
            </div>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Solicitar permisos para un nuevo miembro del equipo.
          </p>
          <button
            onClick={() => router.push('/access-request')}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
          >
            Solicitar acceso
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center mb-4">
            <div className="bg-blue-500 p-3 rounded-full mr-4">
              <Image
                className="shrink-0"
                src="/img/computer-svgrepo-com.svg"
                alt="Asignación de Computadores"
                width={48}
                height={48}
              />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-700">
                Asignación de Computadores
              </h2>
            </div>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Asignar un equipo portátil a un nuevo ingreso.
          </p>
          <button
            onClick={() => router.push('/computer-assignment')}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
          >
            Asignar computador
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold text-gray-700 mb-6">
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
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="text-center py-4">Cargando solicitudes...</td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={4} className="text-center py-4 text-red-500">{error}</td>
                </tr>
              ) : recentRequests.length > 0 ? (
                recentRequests.map((request) => (
                  <tr key={request.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-700">{request.name}</td>
                    <td className="py-3 px-4 text-gray-700">{request.request}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                          request.status.toLowerCase() === 'pendiente' ? 'bg-yellow-200 text-yellow-700' :
                          request.status.toLowerCase() === 'aprobada' ? 'bg-green-200 text-green-700' :
                          request.status.toLowerCase() === 'rechazada' ? 'bg-red-200 text-red-700' :
                          'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {request.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 space-x-2"> {/* Añadido space-x-2 para espaciar los botones */}
                      <button
                        onClick={() => router.push(`/team-management/edit-request/${request.id}`)}
                        className="text-indigo-600 hover:text-indigo-900 font-semibold text-sm"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteRequest(request.id)}
                        className="text-red-600 hover:text-red-900 font-semibold text-sm"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-center py-4">No hay solicitudes recientes.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
