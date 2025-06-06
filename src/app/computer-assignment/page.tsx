"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import axios from "axios";
import Image from "next/image";

interface ApprovedUser {
  id: string | number;
  name: string;
  status: string; 
}

interface ComputerData {
  id: string | number;
  serial_number: string;
  model: string | null;
  is_assigned: boolean;
}

export default function ComputerAssignment() {
  const router = useRouter();
  const [approvedUsers, setApprovedUsers] = useState<ApprovedUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [serialNumber, setSerialNumber] = useState<string>(""); 
  const [assignmentDate, setAssignmentDate] = useState<string>(""); 

  const [isLoadingUsers, setIsLoadingUsers] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [availableComputers, setAvailableComputers] = useState<ComputerData[]>([]);
  const [isLoadingComputers, setIsLoadingComputers] = useState(true);
  const [computersError, setComputersError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchApprovedUsers = async () => {
      setIsLoadingUsers(true);
      setUsersError(null);
      const currentToken = localStorage.getItem("jwtToken");
      if (!currentToken) {
        setUsersError("Sesión expirada. Por favor, inicie sesión de nuevo.");
        router.push("/login");
        setIsLoadingUsers(false);
        return;
      }

      try {
        const response = await axios.get<ApprovedUser[]>("http://localhost:4000/personnel-management/get-users", {
          headers: {
            Authorization: `Bearer ${currentToken}`,
          },
        });
        const filteredUsers = response.data.filter(user => user.status.toLowerCase() === "aprobado");
        setApprovedUsers(filteredUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          setUsersError("Sesión expirada o no autorizado. Redirigiendo al login.");
          router.push("/login");
        } else {
          setUsersError("No se pudieron cargar los usuarios. Inténtelo más tarde.");
        }
      } finally {
        setIsLoadingUsers(false);
      }
    };
    fetchApprovedUsers();

    const fetchAvailableComputers = async () => {
      setIsLoadingComputers(true);
      setComputersError(null);
      const currentToken = localStorage.getItem("jwtToken");
      if (!currentToken) {
        setComputersError("Sesión expirada. Por favor, inicie sesión de nuevo.");
        // Consider router.push("/login") here as well
        setIsLoadingComputers(false);
        return;
      }
      try {
        const response = await axios.get<{ success: boolean, data: ComputerData[] }>(
          "http://localhost:4000/personnel-management/get-computers",
          { headers: { Authorization: `Bearer ${currentToken}` } }
        );
        if (response.data.success) {
          setAvailableComputers(response.data.data);
        } else {
          setComputersError("No se pudieron cargar los computadores disponibles (API).");
        }
      } catch (error) {
        console.error("Error fetching available computers:", error);
        setComputersError("Error de red al cargar los computadores disponibles.");
      } finally {
        setIsLoadingComputers(false);
      }
    };
    fetchAvailableComputers();
  }, [router]); 

  const handleUserChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedUserId(event.target.value);
  };

  const handleSerialNumberChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSerialNumber(event.target.value);
  };

  const handleAssignmentDateChange = (event: ChangeEvent<HTMLInputElement>) => {
    setAssignmentDate(event.target.value);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    if (!selectedUserId) {
      setFormError("Por favor, seleccione un colaborador.");
      return;
    }
    if (!serialNumber.trim()) {
      setFormError("Por favor, ingrese el número de serie del equipo.");
      return;
    }
    setIsSubmitting(true);

    const payload: { user_id: string; serial_number: string; assigned_at?: string } = {
      user_id: selectedUserId,
      serial_number: serialNumber,
      assigned_at: assignmentDate,
    };

    if (assignmentDate) {
      payload.assigned_at = assignmentDate;
    }

    const token = localStorage.getItem("jwtToken");
    if (!token) {
      setFormError("Tu sesión ha expirado. Por favor, inicia sesión de nuevo.");
      router.push("/login");
      setIsSubmitting(false);
      return;
    }

    try {
      await axios.post("http://localhost:4000/personnel-management/create-assignment", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      alert("Computador asignado exitosamente!");
      router.push("/team-management");
    } catch (err) {
      console.error("Error al asignar computador:", err);
      let errorMessage = "Error de red o al procesar la solicitud de asignación.";
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        setFormError("Tu sesión ha expirado o no tienes permiso. Redirigiendo al login.");
        router.push("/login");
      } else if (axios.isAxiosError(err) && err.response) {
        errorMessage = err.response.data?.error || err.response.data?.message || "Error desconocido al asignar el computador.";
        setFormError(errorMessage);
      } else {
        setFormError(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-xl shadow-xl w-full max-w-2xl mx-auto my-8">
      <div className="flex items-center mb-6">
        <div className="bg-blue-600 p-3 rounded-full mr-4">
          <Image
            className="size-12 shrink-0"
            src="/img/computer-svgrepo-com.svg"
            alt="Asignación de Computador"
            width={48}
            height={48}
          />
        </div>
        <h1 className="text-2xl font-bold text-gray-700">
          Asignación de Computador
        </h1>
      </div>

      <p className="text-gray-600 text-sm mb-6">
        Asigne un equipo de cómputo a un nuevo ingreso.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <div>
            <label
              htmlFor="usuario"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Nombre del Colaborador
            </label>
            {isLoadingUsers ? (
              <p className="mt-1 text-sm text-gray-500">Cargando usuarios...</p>
            ) : usersError ? (
              <p className="mt-1 text-sm text-red-500">{usersError}</p>
            ) : (
              <select
                name="usuario"
                id="usuario"
                value={selectedUserId}
                onChange={handleUserChange}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
                disabled={approvedUsers.length === 0}
              >
                <option value="" disabled>Seleccione un usuario</option>
                {approvedUsers.map((user) => (
                  <option key={user.id} value={user.id}>{user.name}</option>
                ))}
                {approvedUsers.length === 0 && !isLoadingUsers && !usersError && <option value="" disabled>No hay usuarios aprobados</option>}
              </select>
            )}
          </div>

          <div>
            <label
              htmlFor="serial"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Número de Serie
            </label>
            <input
              type="text"
              name="serial"
              id="serial"
              value={serialNumber}
              onChange={handleSerialNumberChange}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Ej: SN123456789"
              required
            />
          </div>

          <div>
            <label
              htmlFor="fechaEntrega"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Fecha de Entrega
            </label>
            <input
              type="date"
              name="fechaEntrega"
              id="fechaEntrega"
              value={assignmentDate}
              onChange={handleAssignmentDateChange}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>
        {formError && <p className="text-red-500 text-sm mt-4">{formError}</p>}
        <div className="mt-8 pt-5 border-t border-gray-200">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => router.push('/team-management')}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg mr-3 transition duration-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isLoadingUsers || approvedUsers.length === 0}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition duration-200 disabled:opacity-50"
            >
              {isSubmitting ? "Asignando..." : "Asignar Computador"}
            </button>
          </div>
        </div>
      </form>

      <div className="mt-12 bg-gray-50 p-4 md:p-6 rounded-lg shadow">
        <h2 className="text-xl md:text-2xl font-semibold text-gray-700 mb-6">
          Computadores Disponibles para Asignar
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left table-auto">
            <thead className="bg-gray-100">
              <tr className="border-b-2 border-gray-200">
                <th className="py-3 px-4 text-gray-600 font-semibold text-sm">
                  ID
                </th>
                <th className="py-3 px-4 text-gray-600 font-semibold text-sm">
                  Número de Serie
                </th>
                <th className="py-3 px-4 text-gray-600 font-semibold text-sm">
                  Modelo
                </th>
                <th className="py-3 px-4 text-gray-600 font-semibold text-sm">
                  ¿Asignado?
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoadingComputers ? (
                <tr>
                  <td colSpan={4} className="text-center py-4 text-gray-500">
                    Cargando computadores...
                  </td>
                </tr>
              ) : computersError ? (
                <tr>
                  <td colSpan={4} className="text-center py-4 text-red-500">
                    {computersError}
                  </td>
                </tr>
              ) : availableComputers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-4 text-gray-500">
                    No hay computadores disponibles registrados.
                  </td>
                </tr>
              ) : (
                availableComputers.map((computer) => (
                  <tr key={computer.id} className={`border-b border-gray-200 hover:bg-gray-100 transition-colors ${computer.is_assigned ? 'bg-red-50 text-gray-500' : ''}`}>
                    <td className="py-3 px-4">{computer.id}</td>
                    <td className="py-3 px-4">{computer.serial_number}</td>
                    <td className="py-3 px-4">{computer.model || 'N/A'}</td>
                    <td className="py-3 px-4">{computer.is_assigned ? "Sí" : "No"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
