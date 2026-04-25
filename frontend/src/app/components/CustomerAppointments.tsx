/// <reference types="vite/client" />
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { ArrowLeft, Clock, User, CircleDollarSign, Calendar, Trash2, CheckCircle2 } from "lucide-react";
import { isBefore, parseISO } from "date-fns";

interface Appointment {
  id: number;
  service_name: string;
  date_time: string;
  price: number;
  provider_name: string;
  status: string;
}

export default function CustomerAppointments() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = location.state?.user;
  const userId = user?.id;

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!userId || user?.user_type !== "CLIENTE") {
      alert("Acesso negado. Apenas clientes podem acessar esta tela.");
      navigate("/");
    } else {
      fetchAppointments();
    }
  }, [userId]);

  const fetchAppointments = async () => {
    setIsLoading(true);
    try {
      const apiUrl = (import.meta as any).env.VITE_API_URL || "http://localhost:8000";
      const response = await fetch(`${apiUrl}/appointments/customer/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setAppointments(data);
      }
    } catch (err) {
      console.error("Erro ao buscar agendamentos:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelAppointment = async (id: number) => {
    if (!window.confirm("Tem certeza que deseja cancelar este agendamento?")) return;

    try {
      const apiUrl = (import.meta as any).env.VITE_API_URL || "http://localhost:8000";
      const response = await fetch(`${apiUrl}/appointments/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("Agendamento cancelado com sucesso!");
        fetchAppointments(); // Atualiza a lista
      } else {
        alert("Erro ao cancelar agendamento.");
      }
    } catch (err) {
      console.error(err);
      alert("Erro de conexão.");
    }
  };

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

  // Separação lógica
  const now = new Date();
  const upcoming: Appointment[] = [];
  const past: Appointment[] = [];

  appointments.forEach((app) => {
    try {
      const [datePart, timePart] = app.date_time.split(" ");
      const [startTime] = timePart.split("-");
      const appDate = new Date(`${datePart}T${startTime}`);
      
      if (isBefore(appDate, now)) {
        past.push(app);
      } else {
        upcoming.push(app);
      }
    } catch {
      upcoming.push(app); // Fallback
    }
  });

  // Ordenação
  upcoming.sort((a, b) => a.date_time.localeCompare(b.date_time));
  past.sort((a, b) => b.date_time.localeCompare(a.date_time)); // Recentes primeiro no histórico

  const AppointmentCard = ({ app, isUpcoming }: { app: Appointment; isUpcoming: boolean }) => (
    <div className="relative border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md transition-shadow">
      <div className="absolute top-4 right-4">
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${isUpcoming ? 'bg-[#e8f3ee] text-[#104d30] dark:bg-[#16653f]/20 dark:text-[#22c55e]' : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'}`}>
          <CheckCircle2 size={12} />
          {isUpcoming ? "Agendado" : "Realizado"}
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
            <span className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">Profissional</span>
            <span className="font-medium">{app.provider_name}</span>
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

      {isUpcoming && (
        <button
          onClick={() => handleCancelAppointment(app.id)}
          className="mt-5 w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors text-sm font-medium"
        >
          <Trash2 size={16} />
          Cancelar Agendamento
        </button>
      )}
    </div>
  );

  return (
    <main className="flex-1 w-full min-h-screen bg-zinc-50 dark:bg-zinc-950 p-4 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-4xl">
        {/* Cabeçalho */}
        <div className="mb-8 flex items-center">
          <button 
            onClick={() => navigate('/home', { state: { user: location.state?.user } })}
            className="p-2 -ml-2 mr-4 rounded-full hover:bg-white dark:hover:bg-zinc-900 text-zinc-500 transition-colors shadow-sm border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 tracking-tight">Meus Agendamentos</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Gerencie suas consultas e veja seu histórico</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#104d30] dark:border-[#22c55e]"></div>
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <Calendar size={48} className="mx-auto text-zinc-300 dark:text-zinc-600 mb-4" />
            <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">Nenhuma consulta encontrada</h3>
            <p className="text-zinc-500 dark:text-zinc-400 mt-2 max-w-xs mx-auto">Você ainda não realizou nenhum agendamento no sistema.</p>
            <button 
              onClick={() => navigate('/search-services', { state: { user: location.state?.user } })}
              className="mt-6 text-[#104d30] dark:text-[#22c55e] font-semibold hover:underline"
            >
              Procurar serviços agora →
            </button>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Seção Próximas */}
            {upcoming.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-[#104d30]/10 dark:bg-[#16653f]/20 flex items-center justify-center text-[#104d30] dark:text-[#22c55e]">
                    <Clock size={20} />
                  </div>
                  <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-100">Próximas Consultas</h2>
                  <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-xs font-bold text-zinc-500">{upcoming.length}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {upcoming.map(app => <AppointmentCard key={app.id} app={app} isUpcoming={true} />)}
                </div>
              </section>
            )}

            {/* Seção Anteriores */}
            {past.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500">
                    <Calendar size={20} />
                  </div>
                  <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-100 text-opacity-70">Histórico Anterior</h2>
                  <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-xs font-bold text-zinc-500">{past.length}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-80">
                  {past.map(app => <AppointmentCard key={app.id} app={app} isUpcoming={false} />)}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
