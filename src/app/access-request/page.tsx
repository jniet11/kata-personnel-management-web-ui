"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import axios from "axios";

// Interfaz para los datos de usuario que esperamos de la API
// Similar a la interfaz RecentRequest en team-management/page.tsx
interface UserFromApi {
  id: string | number;
  name: string;
  status: string;
  // Podrías añadir más campos si son relevantes y vienen de la API
}

export default function AccessRequest() {
  const router = useRouter();
  const [approvedUsers, setApprovedUsers] = useState<UserFromApi[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [isLoadingUsers, setIsLoadingUsers] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [accessTypes, setAccessTypes] = useState<string[]>([]); // Para los checkboxes

  useEffect(() => {
    const fetchApprovedUsers = async () => {
      setIsLoadingUsers(true);
      setUsersError(null);
      try {
        const response = await axios.get<UserFromApi[]>("http://localhost:4000/personnel-management/get-users");
        const filteredUsers = response.data.filter(user => user.status.toLowerCase() === "aprobado");
        setApprovedUsers(filteredUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
        setUsersError("No se pudieron cargar los usuarios. Inténtelo más tarde.");
      } finally {
        setIsLoadingUsers(false);
      }
    };

    fetchApprovedUsers();
  }, []);

  const handleUserChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedUserId(event.target.value);
  };

  const handleCheckboxChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = event.target;
    setAccessTypes(prev =>
      checked ? [...prev, value] : prev.filter(type => type !== value)
    );
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    if (!selectedUserId) {
      setFormError("Por favor, seleccione un usuario.");
      return;
    }
    if (accessTypes.length === 0) {
      setFormError("Por favor, seleccione al menos un tipo de acceso.");
      return;
    }

    setIsSubmitting(true);
    const accessTypeString = accessTypes.join(", ");

    try {
      console.log('Los datos enviados son: ', {
        user_id: selectedUserId,
        access_type: accessTypeString,
      })
      await axios.post("http://localhost:4000/personnel-management/create-access-request", {
        user_id: selectedUserId,
        access_type: accessTypeString,
      });
      alert("Solicitud de acceso creada exitosamente!");
      router.push("/team-management");
    } catch (error) {
      console.error("Error creating access request:", error);
      if (axios.isAxiosError(error) && error.response) {
        setFormError(error.response.data?.error || "Error al crear la solicitud.");
      } else {
        setFormError("Error de red o al procesar la solicitud.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-xl shadow-xl w-full max-w-2xl mx-auto my-8">
      <div className="flex items-center mb-6">
        <div className="bg-blue-600 p-3 rounded-full mr-4">
          <img className="size-12 shrink-0" src="/img/airplane-svgrepo-com.svg" />
        </div>
        <h1 className="text-2xl font-bold text-gray-700">
          Solicitud de Accesos
        </h1>
      </div>

      <p className="text-gray-600 text-sm mb-6">
        Complete este formulario para solicitar acceso a aplicaciones o
        sistemas.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <div>
            <label
              htmlFor="usuario"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Nombre del Usuario
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
            >
              <option value="" disabled>Seleccione un usuario</option>
              {approvedUsers.length > 0 ? (
                approvedUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))
              ) : (
                <option value="" disabled>No hay usuarios aprobados disponibles</option>
              )}
            </select>
            )}
          </div>

          <div>
            <label
              htmlFor="tipoUsuario"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Tipo de Usuario
            </label>
            <select
              name="tipoUsuario"
              id="tipoUsuario"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">Seleccione un tipo</option>
              <option value="PM">PM</option>
              <option value="UX">UX</option>
              <option value="QA">QA</option>
              <option value="Scrum Master">Scrum Master</option>
              <option value="Developer">Developer</option>
              <option value="BA">BA</option>
              <option value="DevOps">DevOps</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Accesos Solicitados
            </label>
            <div className="flex flex-col space-y-2">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  value="GitHub"
                  checked={accessTypes.includes("GitHub")}
                  onChange={handleCheckboxChange}
                  className="form-checkbox text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  GitHub
                </span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  value="Grafana"
                  checked={accessTypes.includes("Grafana")}
                  onChange={handleCheckboxChange}
                  className="form-checkbox text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Grafana
                </span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  value="AWS"
                  checked={accessTypes.includes("AWS")}
                  onChange={handleCheckboxChange}
                  className="form-checkbox text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">AWS</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  value="Confluence"
                  checked={accessTypes.includes("Confluence")}
                  onChange={handleCheckboxChange}
                  className="form-checkbox text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Confluence</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  value="Figma"
                  checked={accessTypes.includes("Figma")}
                  onChange={handleCheckboxChange}
                  className="form-checkbox text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Figma</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  value="JFROG"
                  checked={accessTypes.includes("JFROG")}
                  onChange={handleCheckboxChange}
                  className="form-checkbox text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">JFROG</span>
              </label>
            </div>
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
              disabled={isSubmitting || isLoadingUsers}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition duration-200 disabled:opacity-50"
            >
              {isSubmitting ? "Enviando..." : "Enviar Solicitud"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
