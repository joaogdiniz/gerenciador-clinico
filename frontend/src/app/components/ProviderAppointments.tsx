/// <reference types="vite/client" />
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { ArrowLeft, Clock, User, CheckCircle2, CircleDollarSign } from "lucide-react";

interface Appointment {
  id: number;
  service_name: string;
  date_time: string;
  price: number;
  customer_name: string;
  status: string;
}

export default function ProviderAppointments() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = location.state?.user;
  const userId = user?.id;

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!userId || user?.user_type !== "PRESTADOR") {
      alert("Acesso negado. Apenas prestadores podem acessar esta tela.");
      navigate("/");
    } else {
      fetchAppointments();
    }
  }, [userId]);

  const fetchAppointments = async () => {
    setIsLoading(true);
    try {
      const apiUrl = (import.meta as any).env.VITE_API_URL || "http://localhost:8000";
      const response = await fetch(`${apiUrl}/appointments/provider/${userId}`);
      if (response.ok) {
        const data = await response.json();
        
        // Ordenando do mais antigo (próximos eventos) para o mais recente
        data.sort((a: Appointment, b: Appointment) => {
          return new Date(a.date_time.split(" ")[0]).getTime() - new Date(b.date_time.split(" ")[0]).getTime();
        });
        
        setAppointments(data);
      }
    } catch (err) {
      console.error("Erro ao buscar agendamentos:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper para formatar a data (ex: "2023-09-15 10:00-11:00" -> "15/09/2023 das 10:00 às 11:00")
  const formatDateTime = (dateTimeStr: string) => {
    try {
      const [datePart, timePart] = dateTimeStr.split(" ");
      const [year, month, day] = datePart.split("-");
      const [start, end] = timePart.split("-");
      return `${day}/${month}/${year} • ${start} às ${end}`;
    } catch {
      return dateTimeStr;
    }
  };

  return (
    <main className="flex-1 w-full min-h-screen bg-zinc-50 dark:bg-zinc-950 p-4 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-4xl bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        
        {/* Cabeçalho */}
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/50">
          <div className="flex items-center">
            <button 
              onClick={() => navigate('/home', { state: { user: location.state?.user } })}
              className="p-2 -ml-2 mr-4 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-zinc-800 dark:text-zinc-100">Lista de Agendamentos</h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Veja os clientes que marcaram horários com você</p>
            </div>
          </div>
        </div>

        {/* Lista de Agendamentos */}
        <div className="p-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#104d30] dark:border-[#22c55e]"></div>
            </div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-20 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700">
              <Clock size={40} className="mx-auto text-zinc-300 dark:text-zinc-600 mb-3" />
              <p className="text-zinc-500 dark:text-zinc-400 font-medium">Nenhum agendamento encontrado.</p>
              <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-1">Quando os clientes marcarem horários, eles aparecerão aqui.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {appointments.map((app) => (
                <div key={app.id} className="relative border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md transition-shadow">
                  <div className="absolute top-4 right-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-[#e8f3ee] text-[#104d30] dark:bg-[#16653f]/20 dark:text-[#22c55e]">
                      <CheckCircle2 size={12} />
                      {app.status}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-100 mb-4 pr-24 truncate">
                    {app.service_name}
                  </h3>

                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-zinc-600 dark:text-zinc-300">
                      <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mr-3 shrink-0 text-blue-600 dark:text-blue-400">
                        <User size={16} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">Cliente</span>
                        <span className="font-medium">{app.customer_name}</span>
                      </div>
                    </div>

                    <div className="flex items-center text-sm text-zinc-600 dark:text-zinc-300">
                      <div className="w-8 h-8 rounded-full bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center mr-3 shrink-0 text-orange-600 dark:text-orange-400">
                        <Clock size={16} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">Data e Horário</span>
                        <span className="font-medium">{formatDateTime(app.date_time)}</span>
                      </div>
                    </div>

                    <div className="flex items-center text-sm text-zinc-600 dark:text-zinc-300">
                      <div className="w-8 h-8 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center mr-3 shrink-0 text-green-600 dark:text-green-400">
                        <CircleDollarSign size={16} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">Valor</span>
                        <span className="font-medium">R$ {app.price.toFixed(2).replace(".", ",")}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
