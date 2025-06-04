/* eslint-disable @next/next/no-async-client-component */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Image from "next/image";

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
      const response = await axios.post("http://localhost:4000/login", {
        email,
        password,
      });

      console.log("Respuesta de autenticación:", response);

      if (response.data && response.data.token) {
        localStorage.setItem("jwtToken", response.data.token);
        router.push("/team-management");
      } else {
        setError("Respuesta de autenticación inválida.");
      }
    } catch (err) {
      console.error("Error during login:", err);
      if (axios.isAxiosError(err) && err.response) {
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
        <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-10 bg-white">
          <div className="relative w-full max-w-xs aspect-square">
            <Image
              src="/img/global-svgrepo-com.svg"
              alt="Login illustration"
              layout="fill"
              objectFit="contain"
              priority
            />
          </div>
        </div>

        <div className="w-full md:w-1/2 p-8 bg-white">
          <div className="relative">
            {loading && (
              <div className="absolute inset-0 bg-white bg-opacity-75 flex flex-col justify-center items-center z-10 rounded-lg">
                <svg
                  className="animate-spin h-10 w-10 text-blue-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <p className="mt-2 text-blue-600 font-semibold">Iniciando sesión...</p>
              </div>
            )}
            <h1 className="text-2xl font-bold text-center mb-6">
              Iniciar Sesión en Gestión de Ingresos y Recursos de Equipo
            </h1>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold mb-2"
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
                  disabled={loading}
                />
              </div>
              <div className="mb-6">
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold mb-2"
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
                  disabled={loading}
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
                Entrar
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}