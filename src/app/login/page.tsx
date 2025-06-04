/* eslint-disable @next/next/no-async-client-component */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Image from "next/image"; // Importar el componente Image de Next.js

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Asume que tu backend tiene un endpoint de login que responde con un JWT
      const response = await axios.post("http://localhost:4000/personnel-management/login", {
        email,
        password,
      });

      console.log("Respuesta de autenticación:", response);

      if (response.data && response.data.token) {
        // Almacenar el token JWT (puedes usar localStorage, sessionStorage o cookies)
        // localStorage es simple para este ejemplo, pero considera opciones más seguras para producción.
        localStorage.setItem("jwtToken", response.data.token);

        // Redirigir al usuario a la página principal después del login
        router.push("/team-management");
      } else {
        setError("Respuesta de autenticación inválida.");
      }
    } catch (err) {
      console.error("Error during login:", err);
      if (axios.isAxiosError(err) && err.response) {
        // Manejar errores específicos de la API (ej. credenciales inválidas)
        setError(err.response.data?.message || "Error en la autenticación.");
      } else {
        setError("Error de red o del servidor.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col md:flex-row rounded-lg shadow-xl overflow-hidden max-w-4xl w-full m-4">
        {/* Sección de la imagen ajustada */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-10 bg-white"> {/* Contenedor exterior para centrar y dar espacio */}
          <div className="relative w-full max-w-xs aspect-square"> {/* Contenedor adicional para la imagen, ajusta max-w-xs y aspect-square según necesites */}
            <Image
              src="/img/global-svgrepo-com.svg" // Asegúrate de que esta ruta sea correcta
              alt="Login illustration"
              layout="fill" // Hace que la imagen llene el contenedor padre (el div con 'relative')
              objectFit="contain" // 'contain' asegura que toda la imagen sea visible dentro del contenedor, manteniendo su aspect ratio. Usa 'cover' si quieres que llene el espacio recortándose.
              priority // Opcional: si es una imagen LCP (Largest Contentful Paint)
            />
          </div>
        </div>

        {/* Sección del formulario */}
        <div className="w-full md:w-1/2 p-8 bg-white"> {/* Añadido bg-white para el fondo del formulario */}
          <h1 className="text-2xl font-bold text-center mb-6"> {/* text-gray-800 eliminado para heredar de globals.css */}
            Iniciar Sesión
          </h1>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-sm font-semibold mb-2" // text-gray-700 eliminado
              >
                Correo Electrónico
              </label>
              <input
                type="email"
                id="email"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mb-6">
              <label
                htmlFor="password"
                className="block text-sm font-semibold mb-2" // text-gray-700 eliminado
              >
                Contraseña
              </label>
              <input
                type="password"
                id="password"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && (
              <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
            )}
            <button
              type="submit"
              className={`w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200 ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={loading}
            >
              {loading ? "Iniciando..." : "Entrar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}