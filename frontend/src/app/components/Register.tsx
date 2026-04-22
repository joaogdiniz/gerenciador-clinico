import React, { useState } from "react";
import { useNavigate } from "react-router";

export default function Register() {
  const navigate = useNavigate();

  // Estados dos inputs
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Conectar com o backend no futuro, por enquanto apenas redireciona de volta para a tela de login
    navigate("/");
  };

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 w-full pb-24">
      <div className="w-full max-w-sm flex flex-col items-center">
        <h1 className="text-2xl font-medium mb-8 text-zinc-800 dark:text-zinc-100">
          Crie sua conta
        </h1>

        <form
          onSubmit={handleRegister}
          className="w-full flex flex-col gap-5"
        >
          {/* Caixa de Nome */}
          <div>
            <input
              type="text"
              placeholder="Nome completo"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-[#104d30] focus:ring-1 focus:ring-[#104d30] dark:focus:border-[#38a169] dark:focus:ring-[#38a169] transition-all"
            />
          </div>

          {/* Caixa de E-mail */}
          <div>
            <input
              type="email"
              placeholder="E-mail"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-[#104d30] focus:ring-1 focus:ring-[#104d30] dark:focus:border-[#38a169] dark:focus:ring-[#38a169] transition-all"
            />
          </div>

          {/* Caixa de Senha */}
          <div>
            <input
              type="password"
              placeholder="Senha"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-[#104d30] focus:ring-1 focus:ring-[#104d30] dark:focus:border-[#38a169] dark:focus:ring-[#38a169] transition-all"
            />
          </div>

          {/* Botões de Cadastro */}
          <div className="flex flex-col gap-3 mt-2">
            <button
              type="submit"
              className="w-full bg-[#104d30] hover:bg-[#0a3320] dark:bg-[#16653f] dark:hover:bg-[#1a7a4c] text-white py-3.5 px-6 rounded-lg font-medium transition-all shadow-md active:scale-[0.98]"
            >
              Cadastro de clientes
            </button>
            <button
              type="submit"
              className="w-full bg-transparent dark:bg-transparent text-[#104d30] dark:text-[#4ade80] border-2 border-[#104d30] dark:border-[#4ade80] hover:bg-zinc-50 dark:hover:bg-zinc-800/50 py-3.5 px-6 rounded-lg font-medium transition-all active:scale-[0.98]"
            >
              Cadastro de Prestador
            </button>
          </div>
        </form>

        {/* Link de Login */}
        <div className="mt-8">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="text-[#104d30] dark:text-[#4ade80] hover:underline font-medium text-[15px] transition-colors"
          >
            Já possuo uma conta
          </button>
        </div>
      </div>
    </main>
  );
}
