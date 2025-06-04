"use client";

import { useEffect, useState, FormEvent, ChangeEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import axios from "axios";

interface ComputerAssignmentEditData {
  assignment_id: string | number;
  user_id: string | number;
  user_name: string;
  user_email: string;
  computer_id?: string | number;
  computer_serial: string;
  computer_model?: string;
  assigned_at: string;
  status?: string;
}

interface ApprovedUser {
  id: string | number;
  name: string;
  status: string;
}

export default function EditComputerAssignmentPage() {
  const router = useRouter();
  const params = useParams();
  const assignmentId = params.id as string;

  const [assignmentData, setAssignmentData] =
    useState<ComputerAssignmentEditData | null>(null);
  const [approvedUsers, setApprovedUsers] = useState<ApprovedUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [editedComputerSerialNumber, setEditedComputerSerialNumber] =
    useState<string>("");
  const [editedAssignedAt, setEditedAssignedAt] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usersError, setUsersError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    if (!token) {
      router.push("/login");
      return;
    }

    setAssignmentData(null);
    setSelectedUserId("");
    setEditedComputerSerialNumber("");
    setEditedAssignedAt("");
    setError(null);
    setUsersError(null);
    setIsFetchingData(true);

    if (assignmentId && assignmentId !== "undefined") {
      const authHeaders = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const fetchAssignmentDetails = axios.get<{
        success: boolean;
        data?: ComputerAssignmentEditData;
        error?: string;
      }>(
        `http://localhost:4000/personnel-management/get-assignment-by-id/${assignmentId}`,
        authHeaders
      );
      const fetchApprovedUsersList = axios.get<ApprovedUser[]>(
        "http://localhost:4000/personnel-management/get-users",
        authHeaders
      );

      Promise.all([fetchAssignmentDetails, fetchApprovedUsersList])
        .then(([assignmentDetailsResponse, approvedUsersResponse]) => {
          if (
            assignmentDetailsResponse.status === 401 ||
            approvedUsersResponse.status === 401
          ) {
            alert("Sesión expirada o no autorizado. Redirigiendo al login.");
            router.push("/login");
            return;
          }

          if (
            assignmentDetailsResponse.data.success &&
            assignmentDetailsResponse.data.data
          ) {
            const fetchedData = assignmentDetailsResponse.data.data;
            setAssignmentData(fetchedData);
            setSelectedUserId(String(fetchedData.user_id));
            setEditedComputerSerialNumber(fetchedData.computer_serial || "");
            if (fetchedData.assigned_at) {
              const date = new Date(fetchedData.assigned_at);
              setEditedAssignedAt(date.toISOString().split("T")[0]);
            }
          } else {
            setError(
              assignmentDetailsResponse.data.error ||
                "No se pudo cargar la asignación."
            );
          }

          const filteredUsers = approvedUsersResponse.data.filter(
            (user) => user.status.toLowerCase() === "aprobado"
          );
          setApprovedUsers(filteredUsers);
          if (
            filteredUsers.length === 0 &&
            !usersError &&
            approvedUsersResponse.data
          ) {
            setUsersError(
              "No hay usuarios aprobados disponibles para seleccionar."
            );
          }
        })
        .catch((err) => {
          console.error("Error fetching data:", err);
          if (axios.isAxiosError(err) && err.response?.status === 401) {
            alert("Sesión expirada o no autorizado. Redirigiendo al login.");
            router.push("/login");
          } else {
            setError(
              "Error al cargar los datos. Por favor, inténtelo más tarde."
            );
            if (err.config?.url?.includes("get-assignment-by-id")) {
              setError("No se pudo cargar la asignación.");
            } else if (err.config?.url?.includes("get-users")) {
              setUsersError(
                "No se pudieron cargar la lista de usuarios aprobados."
              );
            }
          }
        })
        .finally(() => {
          setIsFetchingData(false);
        });
    } else {
      setError(
        assignmentId === "undefined"
          ? "El ID de la asignación es 'undefined'."
          : "ID de asignación no válido o no proporcionado."
      );
      setIsFetchingData(false);
    }
  }, [assignmentId, router]);

  const handleUserChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedUserId(event.target.value);
  };

  const handleComputerSerialNumberChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    setEditedComputerSerialNumber(event.target.value);
  };

  const handleAssignedAtChange = (event: ChangeEvent<HTMLInputElement>) => {
    setEditedAssignedAt(event.target.value);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!assignmentData) return;
    if (!selectedUserId) {
      setError("Por favor, seleccione un usuario.");
      return;
    }
    if (!editedComputerSerialNumber) {
      setError("Por favor, ingrese el número de serie del equipo.");
      return;
    }
    setIsLoading(true);
    setError(null);

    const token = localStorage.getItem("jwtToken");
    if (!token) {
      alert("Tu sesión ha expirado. Por favor, inicia sesión de nuevo.");
      router.push("/login");
      setIsLoading(false);
      return;
    }

    try {
      await axios.put(
        `http://localhost:4000/personnel-management/update-assignment/${assignmentId}`,
        {
          user_id: selectedUserId,
          computer_serial_number: editedComputerSerialNumber,
          assigned_at: editedAssignedAt,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("Asignación actualizada exitosamente!");
      router.push("/team-management");
    } catch (err) {
      console.error("Error updating assignment:", err);
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        alert("Tu sesión ha expirado o no tienes permiso. Redirigiendo al login.");
        router.push("/login");
      } else if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data?.error || err.response.data?.message || "Error al actualizar la asignación.");
      } else {
        setError("Error de red o al procesar la solicitud de actualización.");
      }
    } finally {
      setIsLoading(false);
    }
  };
  if (isFetchingData)
    return (
      <div className="container mx-auto p-6 text-center text-gray-600">
        Cargando datos...
      </div>
    );
  if (error && !assignmentData && !isFetchingData)
    return (
      <div className="container mx-auto p-6 text-center text-red-500">
        {error}
      </div>
    );
  if (!assignmentData && !isFetchingData)
    return (
      <div className="container mx-auto p-6">
        <p className="text-center text-gray-600">Asignación no encontrada.</p>
      </div>
    );

  return (
    <div className="bg-white p-6 md:p-8 rounded-xl shadow-xl w-full max-w-2xl mx-auto my-8">
      <div className="flex items-center mb-6">
        <div className="bg-blue-600 p-3 rounded-full mr-4">
          <Image
            className="shrink-0"
            src="/img/computer-svgrepo-com.svg"
            alt="Editar Asignación"
            width={48}
            height={48}
          />
        </div>
        <h1 className="text-2xl font-bold text-gray-700">
          Editar Asignación de Computador
        </h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <div>
            <label
              htmlFor="user"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Colaborador Asignado
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
                <option value="" disabled>
                  Seleccione un usuario
                </option>
                {approvedUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
                {approvedUsers.length === 0 &&
                  !isFetchingData &&
                  !usersError && (
                    <option value="" disabled>
                      No hay usuarios aprobados
                    </option>
                  )}
              </select>
            )}
          </div>

          <div>
            <label
              htmlFor="computerSerial"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Número de Serie del Equipo
            </label>
            <input
              type="text"
              name="computerSerial"
              id="computerSerial"
              value={editedComputerSerialNumber}
              onChange={handleComputerSerialNumberChange}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
            />
          </div>

          <div>
            <label
              htmlFor="assignedAt"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Fecha de Asignación
            </label>
            <input
              type="date"
              name="assignedAt"
              id="assignedAt"
              value={editedAssignedAt}
              onChange={handleAssignedAtChange}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
            />
          </div>
        </div>
        {error && <p className="text-red-500 text-sm mt-4 mb-4">{error}</p>}
        <div className="mt-8 pt-5 border-t border-gray-200">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => router.push("/team-management")}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg mr-3 transition duration-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={
                isLoading ||
                isFetchingData ||
                !assignmentData ||
                (approvedUsers.length === 0 && !usersError)
              }
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition duration-200 disabled:opacity-50"
            >
              {isLoading ? "Actualizando..." : "Actualizar Asignación"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
