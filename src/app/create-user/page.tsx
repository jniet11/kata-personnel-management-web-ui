"use client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import axios from "axios";

export default function CreateUser() {
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const userData = {
      name: formData.get("nombre"),
      email: formData.get("correo"),
      area: formData.get("area"),
      rol: formData.get("rol"),
    };

    console.log('La data enviada es:', userData);

    const API_ENDPOINT =
      "http://localhost:4000/personnel-management/create-user";

    try {
      await axios.post(API_ENDPOINT, userData);
      alert("Usuario registrado exitosamente!");
      router.push("/team-management");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.error(
          "Error al registrar el usuario:",
          error.response.status,
          error.response.data
        );
        alert(
          `Error al registrar el usuario: ${
            error.response.data.message || error.message
          }`
        );
      } else {
        console.error("Error de red o al procesar la solicitud:", error);
        alert("Usuario registrado exitosamente!");
        alert(
          "Error de red o al procesar la solicitud. Por favor, inténtelo de nuevo."
        );
      }
    }
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-xl shadow-xl w-full max-w-2xl">
      <div className="flex items-center mb-6">
        <div className="bg-blue-500 p-3 rounded-full mr-4">
          <Image
            className="shrink-0"
            src="/img/the-medal-svgrepo-com.svg"
            alt="Registrar Miembro"
            width={48}
            height={48}
          />
        </div>
        <h1 className="text-2xl font-bold text-gray-700">
          Registrar Nuevo Miembro del Equipo
        </h1>
      </div>

      <p className="text-gray-600 text-sm mb-6">
        Complete el siguiente formulario para registrar un nuevo miembro en el
        equipo.
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
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Ej: Carlos Martínez"
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
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Ej: carlos.martinez@empresa.com"
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
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Ej: Tecnología"
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
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Ej: Desarrollador Frontend"
            />
          </div>
        </div>

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
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition duration-200"
            >
              Registrar Usuario
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
