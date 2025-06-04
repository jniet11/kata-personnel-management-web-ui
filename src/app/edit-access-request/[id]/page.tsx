"use client";

import { useEffect, useState, FormEvent, ChangeEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from "next/image";
import axios from 'axios';

interface AccessRequestEditData {
  id: string | number;
  user_id: string | number;
  user_name: string;
  access_type: string;
  status: string;
  user_type: string;
  created_at: string;
}

interface ApprovedUser {
  id: string | number;
  name: string;
  status: string;
}

const ALL_ACCESS_TYPES = ["GitHub", "Grafana", "AWS", "Confluence", "Figma", "JFROG"];
const USER_TYPES = ["PM", "UX", "QA", "Scrum Master", "Developer", "BA", "DevOps"];

export default function EditAccessRequestPage() {
  const router = useRouter();
  const params = useParams();
  const requestId = params.id as string;

  const [requestData, setRequestData] = useState<AccessRequestEditData | null>(null);
  const [approvedUsers, setApprovedUsers] = useState<ApprovedUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedUserType, setSelectedUserType] = useState<string>("");
  const [editedAccessTypes, setEditedAccessTypes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usersError, setUsersError] = useState<string | null>(null);

  useEffect(() => {
    if (requestId) {
      setIsFetchingData(true);
      setError(null);
      setUsersError(null);

      const fetchRequestDetails = axios.get<{ success: boolean, data?: AccessRequestEditData, error?: string }>(`http://localhost:4000/personnel-management/get-access-request-by-id/${requestId}`);
      const fetchApprovedUsersList = axios.get<ApprovedUser[]>("http://localhost:4000/personnel-management/get-users");

      Promise.all([fetchRequestDetails, fetchApprovedUsersList])
        .then(([requestDetailsResponse, approvedUsersResponse]) => {
          if (requestDetailsResponse.data.success && requestDetailsResponse.data.data) {
            const fetchedData = requestDetailsResponse.data.data;
            setRequestData(fetchedData);
            setSelectedUserId(String(fetchedData.user_id));
            setSelectedUserType(fetchedData.user_type || "");
            setEditedAccessTypes(fetchedData.access_type ? fetchedData.access_type.split(',').map(item => item.trim()) : []);
          } else {
            setError(requestDetailsResponse.data.error || "No se pudo cargar la solicitud.");
          }
          const filteredUsers = approvedUsersResponse.data.filter(user => user.status.toLowerCase() === "aprobado");
          setApprovedUsers(filteredUsers);
          if (filteredUsers.length === 0 && !usersError) {
            setUsersError("No hay usuarios aprobados disponibles para seleccionar.");
          }

        })
        .catch(err => {
          console.error("Error fetching data:", err);
          setError("Error al cargar los datos. Por favor, inténtelo más tarde.");
          if (err.config?.url?.includes('get-users') && !usersError) {
            setUsersError("No se pudieron cargar la lista de usuarios aprobados.");
          }
        })
        .finally(() => {
          setIsFetchingData(false);
        });
    }
  }, [requestId]);


  const handleUserChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedUserId(event.target.value);
  };

  const handleUserTypeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedUserType(event.target.value);
  };

  const handleAccessTypeChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = event.target;
    setEditedAccessTypes(prev =>
      checked ? [...prev, value] : prev.filter(type => type !== value)
    );
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!requestData) return;
    if (!selectedUserId) {
      setError("Por favor, seleccione un usuario.");
      return;
    }
    if (!selectedUserType) {
      setError("Por favor, seleccione un tipo de usuario.");
      return;
    }
    if (editedAccessTypes.length === 0) {
      setError("Por favor, seleccione al menos un tipo de acceso.");
      return;
    }


    setIsLoading(true);
    setError(null);

    try {
      await axios.put(`http://localhost:4000/personnel-management/update-access-request/${requestId}`, {
        user_id: selectedUserId,
        user_type: selectedUserType,
        access_type: editedAccessTypes.join(', ')
      });
      alert("Solicitud de acceso actualizada exitosamente!");
      router.push("/team-management");
    } catch (err) {
      console.error("Error updating access request:", err);
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data?.error || "Error al actualizar la solicitud de acceso.");
      } else {
        setError("Error de red o al procesar la solicitud de actualización.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetchingData) return <div className="container mx-auto p-6 text-center text-gray-600">Cargando datos...</div>;
  if (error && !requestData && !isFetchingData) return <div className="container mx-auto p-6 text-center text-red-500">{error}</div>;
  if (!requestData && !isFetchingData) return <div className="container mx-auto p-6"><p className="text-center text-gray-600">Solicitud no encontrada.</p></div>;

  return (
    <div className="bg-white p-6 md:p-8 rounded-xl shadow-xl w-full max-w-2xl mx-auto my-8">
      <div className="flex items-center mb-6">
        <div className="bg-blue-600 p-3 rounded-full mr-4">
          <Image className="shrink-0" src="/img/airplane-svgrepo-com.svg" alt="Editar Solicitud Acceso" width={48} height={48} />
        </div>
        <h1 className="text-2xl font-bold text-gray-700">Editar Solicitud de Acceso</h1>
      </div>
      {requestData && (
        <>
          <p className="text-gray-600 text-sm mb-2">Estado Actual: <span className="font-semibold">{requestData.status}</span></p>
          <p className="text-gray-600 text-sm mb-6">Fecha Solicitud: <span className="font-semibold">{new Date(requestData.created_at).toLocaleDateString()}</span></p>
        </>
      )}

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <div>
            <label
              htmlFor="user"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Nombre del Usuario
            </label>
            {usersError && !isFetchingData && approvedUsers.length === 0 ? (
              <p className="mt-1 text-sm text-red-500">{usersError}</p>
            ) : (
            <select
              name="user"
              id="user"
              value={selectedUserId}
              onChange={handleUserChange}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
              disabled={isFetchingData || approvedUsers.length === 0}
            >
              <option value="" disabled>Seleccione un usuario</option>
              {approvedUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
               {approvedUsers.length === 0 && !isFetchingData && !usersError && <option value="" disabled>No hay usuarios aprobados</option>}
            </select>
            )}
          </div>

          <div>
            <label
              htmlFor="userType"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Tipo de Usuario
            </label>
            <select name="userType" id="userType" value={selectedUserType} onChange={handleUserTypeChange} className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" required>
              <option value="" disabled>Seleccione un tipo</option>
              {USER_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Editar Accesos Solicitados
            </label>
            <div className="flex flex-col space-y-2">
              {ALL_ACCESS_TYPES.map(accessType => (
                <label key={accessType} className="inline-flex items-center">
                  <input
                    type="checkbox"
                    value={accessType}
                    checked={editedAccessTypes.includes(accessType)}
                    onChange={handleAccessTypeChange}
                    className="form-checkbox text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    {accessType}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
        {error && <p className="text-red-500 text-sm mt-4 mb-4">{error}</p>}
        <div className="mt-8 pt-5 border-t border-gray-200">
          <div className="flex justify-end">
            <button type="button" onClick={() => router.push("/team-management")} className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg mr-3 transition duration-200">Cancelar</button>
            <button type="submit" disabled={isLoading || isFetchingData || !requestData || (approvedUsers.length === 0 && !usersError)} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition duration-200 disabled:opacity-50">
              {isLoading ? "Actualizando..." : "Actualizar Solicitud"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
