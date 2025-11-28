"use client";

import {useState, useEffect} from "react";
import EditorLogin from "./EditorLogin";

interface EditorAuthWrapperProps {
  children: React.ReactNode;
}

export default function EditorAuthWrapper({children}: EditorAuthWrapperProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Verificar autenticación en localStorage
    const checkAuth = () => {
      const authStatus = localStorage.getItem("editor_authenticated") === "true";
      setIsAuthenticated(authStatus);
    };

    checkAuth();

    // Escuchar cambios en la autenticación
    window.addEventListener("editor_auth_change", checkAuth);

    return () => {
      window.removeEventListener("editor_auth_change", checkAuth);
    };
  }, []);

  // Mostrar loading mientras se verifica
  if (isAuthenticated === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="text-sm text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado, mostrar login
  if (!isAuthenticated) {
    return <EditorLogin />;
  }

  // Si está autenticado, mostrar el contenido
  return <>{children}</>;
}

