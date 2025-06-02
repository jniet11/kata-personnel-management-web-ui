"use client";
import { useRouter } from "next/navigation";

export default function AccessRequest() {
  const router = useRouter();

  return (
    <div className="bg-white p-6 md:p-8 rounded-xl shadow-xl w-full max-w-2xl">
      <div className="flex items-center mb-6">
        <div className="bg-yellow-500 p-3 rounded-full mr-4">
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

      <form action="#" method="POST">
        <div className="space-y-6">
          <div>
            <label
              htmlFor="usuario"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Nombre del Usuario
            </label>
            <input
              type="text"
              name="usuario"
              id="usuario"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"
              placeholder="Ej: Ana Torres"
            />
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
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"
            >
              <option value="">Seleccione un tipo</option>
              <option value="interno">Interno</option>
              <option value="externo">Externo</option>
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
                  className="form-checkbox text-yellow-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Correo Corporativo
                </span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  className="form-checkbox text-yellow-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Sistema de Gestión
                </span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  className="form-checkbox text-yellow-500"
                />
                <span className="ml-2 text-sm text-gray-700">VPN</span>
              </label>
            </div>
          </div>
        </div>

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
              onClick={() => router.push('/team-management')}
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-75 transition duration-200"
            >
              Enviar Solicitud
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
