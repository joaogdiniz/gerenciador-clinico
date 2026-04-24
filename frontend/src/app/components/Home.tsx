import React from "react";
import { User } from "lucide-react";
import { useNavigate, useLocation } from "react-router";

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const userName = location.state?.user?.name || "Usuário";
  const userType = location.state?.user?.user_type || "CLIENTE";

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 text-center pb-24 w-full">
      {/* Ícone de Usuário sem foto */}
      <div className="mb-6 bg-zinc-100 dark:bg-zinc-900 p-8 rounded-full inline-flex items-center justify-center border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <User
          size={64}
          className="text-zinc-400 dark:text-zinc-500 stroke-[1.5]"
        />
      </div>

      {/* Texto de saudação */}
      <h1 className="text-2xl sm:text-3xl font-medium mb-12 text-zinc-800 dark:text-zinc-100 max-w-lg leading-relaxed">
        Olá, {userName}! O que você deseja fazer hoje?
      </h1>

      {/* Botões lado a lado */}
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md justify-center mb-8">
        {userType === "PRESTADOR" ? (
          <>
            <button 
              onClick={() => navigate('/register-service')}
              className="flex-1 bg-[#104d30] hover:bg-[#0a3320] dark:bg-[#16653f] dark:hover:bg-[#1a7a4c] text-white py-3.5 px-6 rounded-lg font-medium transition-all shadow-md active:scale-[0.98]"
            >
              Cadastro de serviços
            </button>
            <button className="flex-1 bg-[#104d30] hover:bg-[#0a3320] dark:bg-[#16653f] dark:hover:bg-[#1a7a4c] text-white py-3.5 px-6 rounded-lg font-medium transition-all shadow-md active:scale-[0.98]">
              Calendário
            </button>
          </>
        ) : (
          <>
            <button className="flex-1 bg-[#104d30] hover:bg-[#0a3320] dark:bg-[#16653f] dark:hover:bg-[#1a7a4c] text-white py-3.5 px-6 rounded-lg font-medium transition-all shadow-md active:scale-[0.98]">
              Ver histórico de consultas
            </button>
            <button className="flex-1 bg-[#104d30] hover:bg-[#0a3320] dark:bg-[#16653f] dark:hover:bg-[#1a7a4c] text-white py-3.5 px-6 rounded-lg font-medium transition-all shadow-md active:scale-[0.98]">
              Calendário
            </button>
          </>
        )}
      </div>

      <button
        onClick={() => navigate("/")}
        className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 text-sm underline transition-colors"
      >
        Retornar a tela de login
      </button>
    </main>
  );
}