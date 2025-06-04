"use client";

import { useEffect, useState, FormEvent, ChangeEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import axios from "axios";

interface UserFormData {
  nombre: string;
  correo: string;
  area: string;
  role: string;
}

interface ApiUserData {
  id: string | number;
  name: string;
  email: string;
  department: string;
  role: string;
  area: string;
}

const initialFormData: UserFormData = {
  nombre: "",
  correo: "",
  area: "",
  role: "",
};

export default function EditUserCreationRequestPage() {
  const router = useRouter();
  const params = useParams();
  const requestId = params.id as string;

  const [formData, setFormData] = useState<UserFormData>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (requestId) {
      setIsFetchingData(true);
      setError(null);
      axios
        .get<ApiUserData[]>(
          `http://localhost:4000/personnel-management/get-users`
        )
        .then((response) => {
          const users = response.data;
          const userToEdit = users.find(user => String(user.id) === String(requestId));
          console.log("User to Edit:", userToEdit);

          if (userToEdit) {
            setFormData({
              nombre: userToEdit.name,
              correo: userToEdit.email,
              area: userToEdit.area,
              role: userToEdit.role,
            });
          } else {
            console.error(`Usuario con ID ${requestId} no encontrado en la lista.`);
            setError(`No se encontró el usuario con ID ${requestId} para editar.`);
          }
        })
        .catch((err) => {
          console.error("Error fetching user data for edit:", err);
          setError(
            "No se pudieron cargar los datos del usuario para editar. Por favor, inténtelo más tarde."
          );
        })
        .finally(() => {
          setIsFetchingData(false);
        });
    } else {
      setError("ID de solicitud no proporcionado.");
      setIsFetchingData(false);
    }
  }, [requestId]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!requestId) {
      setError("No se puede actualizar sin un ID de solicitud.");
      return;
    }
    setIsLoading(true);
    setError(null);

    const API_ENDPOINT_UPDATE = `http://localhost:4000/personnel-management/update-user/${requestId}`;
    const payloadForApi: Omit<ApiUserData, 'id'> = {
      name: formData.nombre,
      email: formData.correo,
      department: formData.area,
      role: formData.role,
      area: formData.area,
    };

    try {
      await axios.put(API_ENDPOINT_UPDATE, payloadForApi);
      alert("Usuario actualizado exitosamente!");
      router.push("/team-management");
    } catch (err) {
      console.error("Error updating user:", err);
      let errorMessage =
        "Error de red o al procesar la solicitud de actualización.";
      if (axios.isAxiosError(err) && err.response) {
        errorMessage =
          err.response.data?.message || "Error al actualizar el usuario.";
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetchingData) {
    return (
      <div className="container mx-auto p-6">
        <p className="text-center text-gray-600">
          Cargando datos para edición...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 md:p-8 rounded-xl shadow-xl w-full max-w-2xl mx-auto my-8">
      <div className="flex items-center mb-6">
        <div className="bg-blue-600 p-3 rounded-full mr-4">
          <Image
            className="shrink-0"
            src="/img/the-medal-svgrepo-com.svg"
            alt="Editar Miembro"
            width={48}
            height={48}
          />
        </div>
        <h1 className="text-2xl font-bold text-gray-700">
          Editar Miembro del Equipo
        </h1>
      </div>

      <p className="text-gray-600 text-sm mb-6">
        Modifique los datos del miembro del equipo y guarde los cambios.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <div>
            <label
              htmlFor="nombre"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Nombre completo
            </label>
            <input
              type="text"
              name="nombre"
              id="nombre"
              value={formData.nombre}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Ej: Carlos Martínez"
              required
            />
          </div>
          <div>
            <label
              htmlFor="correo"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Correo electrónico
            </label>
            <input
              type="email"
              name="correo"
              id="correo"
              value={formData.correo}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Ej: carlos.martinez@empresa.com"
              required
            />
          </div>
          <div>
            <label
              htmlFor="area"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Área / Departamento
            </label>
            <input
              type="text"
              name="area"
              id="area"
              value={formData.area}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Ej: Tecnología"
              required
            />
          </div>
          <div>
            <label
              htmlFor="rol"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Rol
            </label>
            <input
              type="text"
              name="rol"
              id="rol"
              value={formData.role}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Ej: Desarrollador Frontend"
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
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition duration-200 disabled:opacity-50"
            >
              {isLoading ? "Actualizando..." : "Actualizar Usuario"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
