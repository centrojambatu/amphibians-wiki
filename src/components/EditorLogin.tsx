"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const VALID_USERNAME = "admin";
const VALID_PASSWORD = "jambatu2024";

export default function EditorLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Verificar si ya está autenticado
    const isAuthenticated =
      localStorage.getItem("editor_authenticated") === "true";

    if (isAuthenticated) {
      router.refresh();
    }
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Simular validación (solo frontend)
    setTimeout(() => {
      if (username === VALID_USERNAME && password === VALID_PASSWORD) {
        // Guardar autenticación en localStorage
        localStorage.setItem("editor_authenticated", "true");
        localStorage.setItem("editor_username", username);
        setIsLoading(false);
        // Disparar evento personalizado para notificar al wrapper
        window.dispatchEvent(new Event("editor_auth_change"));
        router.refresh();
      } else {
        setError("Usuario o contraseña incorrectos");
        setIsLoading(false);
      }
    }, 300);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-2xl border-2 border-black">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-black">
            <Lock className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-black">Editor de Citas</h1>
          <p className="mt-2 text-sm text-gray-700">
            Ingresa tus credenciales para continuar
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              className="mb-2 block text-sm font-medium text-black"
              htmlFor="username"
            >
              Usuario
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-black" />
              <Input
                autoComplete="username"
                className="pl-10 bg-white border-2 border-black text-black placeholder:text-gray-500 focus:border-black focus:ring-black"
                id="username"
                placeholder="Ingresa tu usuario"
                required
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label
              className="mb-2 block text-sm font-medium text-black"
              htmlFor="password"
            >
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-black" />
              <Input
                autoComplete="current-password"
                className="pl-10 bg-white border-2 border-black text-black placeholder:text-gray-500 focus:border-black focus:ring-black"
                id="password"
                placeholder="Ingresa tu contraseña"
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 border-2 border-red-500 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <Button
            className="w-full bg-black text-white hover:bg-gray-800 border-2 border-black"
            disabled={isLoading}
            type="submit"
          >
            {isLoading ? "Verificando..." : "Iniciar Sesión"}
          </Button>
        </form>

        <div className="mt-6 border-t-2 border-black pt-4">
          <p className="text-center text-xs text-gray-700">
            Acceso restringido al personal autorizado
          </p>
        </div>
      </div>
    </div>
  );
}
