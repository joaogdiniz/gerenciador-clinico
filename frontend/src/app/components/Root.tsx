import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router';
import { Moon, Sun } from 'lucide-react';

export default function Root() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col transition-colors duration-200 font-sans">
      {/* Cabeçalho Global (com o botão Dark Mode, que aparece em todas as telas) */}
      <header className="p-4 sm:p-6 flex justify-end">
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors text-zinc-600 dark:text-zinc-300"
          aria-label="Alternar modo escuro"
          title="Alternar modo escuro"
        >
          {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
        </button>
      </header>

      {/* Renderiza a tela atual com base na rota */}
      <Outlet />
    </div>
  );
}
