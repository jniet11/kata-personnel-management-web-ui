"use client";
import { useRouter } from "next/navigation";

export default function ComputerAssignment() {
  const router = useRouter();

  return (
    <div className="bg-white p-6 md:p-8 rounded-xl shadow-xl w-full max-w-2xl mx-auto my-8">
      <div className="flex items-center mb-6">
        <div className="bg-gray-700 p-3 rounded-full mr-4">
          <img className="size-12 shrink-0" src="/img/computer-svgrepo-com.svg" />
        </div>
        <h1 className="text-2xl font-bold text-gray-700">
          Asignación de Computador
        </h1>
      </div>

      <p className="text-gray-600 text-sm mb-6">
        Asigne un equipo de cómputo a un nuevo ingreso.
      </p>

      <form action="#" method="POST">
        <div className="space-y-6">
          <div>
            <label
              htmlFor="nombre"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Nombre del Colaborador
            </label>
            <input
              type="text"
              name="nombre"
              id="nombre"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-gray-700 focus:border-gray-700 sm:text-sm"
              placeholder="Ej: Laura Pérez"
            />
          </div>

          <div>
            <label
              htmlFor="equipo"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Equipo Asignado
            </label>
            <select
              name="equipo"
              id="equipo"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-gray-700 focus:border-gray-700 sm:text-sm"
            >
              <option value="">Seleccione un equipo</option>
              <option value="laptop-dell">Laptop Dell</option>
              <option value="laptop-hp">Laptop HP</option>
              <option value="macbook">MacBook</option>
            </select>
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
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-gray-700 focus:border-gray-700 sm:text-sm"
              placeholder="Ej: SN123456789"
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
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-gray-700 focus:border-gray-700 sm:text-sm"
            />
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
              className="bg-gray-700 hover:bg-gray-800 text-white font-semibold py-2 px-4 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-gray-700 focus:ring-opacity-75 transition duration-200"
            >
              Asignar Computador
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
