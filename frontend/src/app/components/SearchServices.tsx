/// <reference types="vite/client" />
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { ArrowLeft, Calendar as CalendarIcon, Search, X, CheckCircle } from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  isBefore,
  startOfDay
} from "date-fns";
import { ptBR } from "date-fns/locale";

export default function SearchServices() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = location.state?.user;
  const userId = user?.id;

  // Estados de Busca
  const [searchTerm, setSearchTerm] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  
  // Estado de Serviços
  const [services, setServices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Estado do Calendário
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Estado do Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalDate, setModalDate] = useState<Date | null>(null);

  // Redireciona se não houver usuário
  useEffect(() => {
    if (!userId || user?.user_type !== "CLIENTE") {
      alert("Acesso negado. Apenas clientes podem acessar esta tela.");
      navigate("/");
    } else {
      fetchServices();
    }
  }, [userId]);

  const fetchServices = async () => {
    setIsLoading(true);
    try {
      const apiUrl = (import.meta as any).env.VITE_API_URL || "http://localhost:8000";
      
      let query = new URLSearchParams();
      if (searchTerm) query.append("name", searchTerm);
      if (minPrice) query.append("min_price", minPrice);
      if (maxPrice) query.append("max_price", maxPrice);

      const response = await fetch(`${apiUrl}/services/search?${query.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setServices(data);
      }
    } catch (err) {
      console.error("Erro ao buscar serviços:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Lógica do Calendário
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const daysInCalendar = eachDayOfInterval({
    start: startDate,
    end: endDate
  });

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
    // Quando muda de mês, a gente poderia refazer a busca, mas como a busca já traz a disponibilidade total filtrada, não é estritamente necessário.
  };
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  // Abrir Modal
  const openModalForDate = (date: Date) => {
    // Não permite abrir para dias no passado
    if (isBefore(date, startOfDay(new Date()))) {
        return;
    }
    setModalDate(date);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalDate(null);
  };

  // Agendar Serviço
  const handleSchedule = async (serviceId: number, providerId: number, slot: string) => {
    if (!modalDate) return;
    const dateStr = format(modalDate, "yyyy-MM-dd");
    const dateTime = `${dateStr} ${slot}`;

    if (!window.confirm(`Confirma o agendamento para ${dateTime}?`)) return;

    try {
      const apiUrl = (import.meta as any).env.VITE_API_URL || "http://localhost:8000";
      const payload = {
        customer_id: userId,
        provider_id: providerId,
        service_id: serviceId,
        date_time: dateTime
      };

      const response = await fetch(`${apiUrl}/appointments/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        alert("Agendamento realizado com sucesso!");
        closeModal();
        fetchServices(); // Atualiza a lista para remover o horário que foi ocupado
      } else {
        alert("Erro ao agendar o serviço. O horário pode não estar mais disponível.");
      }
    } catch (error) {
      console.error(error);
      alert("Erro de conexão ao tentar agendar.");
    }
  };

  // Funções Utilitárias para o Calendário
  const getServicesForDate = (dateStr: string) => {
    const availableServices: any[] = [];
    services.forEach(srv => {
      if (srv.availability && srv.availability[dateStr] && srv.availability[dateStr].length > 0) {
        availableServices.push({
          ...srv,
          available_slots: srv.availability[dateStr]
        });
      }
    });
    return availableServices;
  };

  return (
    <main className="flex-1 w-full min-h-screen bg-zinc-50 dark:bg-zinc-950 p-4 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-4xl bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        
        {/* Cabeçalho */}
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center">
            <button 
              onClick={() => navigate('/home', { state: { user: location.state?.user } })}
              className="p-2 -ml-2 mr-4 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-zinc-800 dark:text-zinc-100">Agendar Serviços</h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Busque serviços e encontre o melhor horário</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row">
          {/* Barra Lateral de Filtros */}
          <div className="w-full md:w-1/3 p-6 border-b md:border-b-0 md:border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
            <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-4 uppercase tracking-wider">Filtros de Busca</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">Nome do Serviço</label>
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Ex: Consulta"
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm focus:ring-2 focus:ring-[#104d30] dark:focus:ring-[#16653f] transition-all"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">Preço Mín.</label>
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    placeholder="R$ 0"
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm focus:ring-2 focus:ring-[#104d30] dark:focus:ring-[#16653f] transition-all"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">Preço Máx.</label>
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder="R$ 999"
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm focus:ring-2 focus:ring-[#104d30] dark:focus:ring-[#16653f] transition-all"
                  />
                </div>
              </div>

              <button
                onClick={fetchServices}
                className="w-full mt-4 bg-[#104d30] hover:bg-[#0a3320] dark:bg-[#16653f] dark:hover:bg-[#1a7a4c] text-white py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
              >
                Buscar
              </button>
            </div>
          </div>

          {/* Área do Calendário */}
          <div className="w-full md:w-2/3 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-medium text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
                <CalendarIcon size={20} className="text-[#104d30] dark:text-[#16653f]" />
                Calendário de Disponibilidade
              </h2>
              <div className="flex items-center gap-2">
                <button onClick={prevMonth} className="px-3 py-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-sm font-medium transition-colors border border-zinc-200 dark:border-zinc-700">
                  &lt;
                </button>
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 w-32 text-center capitalize">
                  {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
                </span>
                <button onClick={nextMonth} className="px-3 py-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-sm font-medium transition-colors border border-zinc-200 dark:border-zinc-700">
                  &gt;
                </button>
              </div>
            </div>

            {/* Grid do Calendário */}
            <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden bg-zinc-50 dark:bg-zinc-900/50">
              <div className="grid grid-cols-7 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
                  <div key={day} className="py-2 text-center text-[10px] sm:text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    {day}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7">
                {daysInCalendar.map((day) => {
                  const dateStr = format(day, "yyyy-MM-dd");
                  const isCurrentMonth = isSameMonth(day, currentMonth);
                  const isToday = isSameDay(day, new Date());
                  const isPast = isBefore(day, startOfDay(new Date()));
                  
                  const servicesForDay = getServicesForDate(dateStr);
                  const hasSlots = servicesForDay.length > 0;

                  // Cores: Verde, Roxo, Amarelo, Vermelho, Azul
                  const SERVICE_COLORS = [
                    "text-green-700 bg-green-100 border-green-200 dark:text-green-400 dark:bg-green-900/30 dark:border-green-800",
                    "text-purple-700 bg-purple-100 border-purple-200 dark:text-purple-400 dark:bg-purple-900/30 dark:border-purple-800",
                    "text-yellow-700 bg-yellow-100 border-yellow-200 dark:text-yellow-400 dark:bg-yellow-900/30 dark:border-yellow-800",
                    "text-red-700 bg-red-100 border-red-200 dark:text-red-400 dark:bg-red-900/30 dark:border-red-800",
                    "text-blue-700 bg-blue-100 border-blue-200 dark:text-blue-400 dark:bg-blue-900/30 dark:border-blue-800"
                  ];

                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => openModalForDate(day)}
                      disabled={!isCurrentMonth || isPast}
                      className={`
                        min-h-[90px] p-2 border-r border-b border-zinc-200 dark:border-zinc-800 relative
                        transition-colors flex flex-col justify-end
                        ${(!isCurrentMonth || isPast) ? "bg-zinc-100/50 dark:bg-zinc-900/50 text-zinc-400 dark:text-zinc-600 cursor-not-allowed" : "bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/80"}
                        ${hasSlots && isCurrentMonth && !isPast ? "bg-zinc-50 dark:bg-zinc-800/30" : ""}
                      `}
                    >
                      <span className={`
                        absolute top-2 left-2 text-sm font-medium flex items-center justify-center w-7 h-7 rounded-full
                        ${isToday ? "bg-[#104d30] dark:bg-[#16653f] text-white" : ""}
                      `}>
                        {format(day, "d")}
                      </span>
                      
                      {hasSlots && !isPast && (
                        <div className="flex flex-col items-start w-full overflow-hidden gap-0.5 mt-6">
                          {servicesForDay.map((srv, idx) => {
                            const colorClass = SERVICE_COLORS[idx % SERVICE_COLORS.length];
                            return (
                              <span key={srv.id} title={srv.name} className={`text-[9px] font-semibold px-1 py-0.5 rounded shadow-sm border truncate w-full text-left ${colorClass}`}>
                                {srv.available_slots.length} horários
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
            {isLoading && <p className="text-center text-sm text-zinc-500 mt-4">Buscando serviços...</p>}
          </div>
        </div>
      </div>

      {/* Modal de Agendamento */}
      {isModalOpen && modalDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-5 flex justify-between items-center border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 shrink-0">
              <div>
                <h3 className="text-lg font-medium text-zinc-800 dark:text-zinc-100">
                  Agendar Serviço
                </h3>
                <p className="text-sm text-zinc-500 capitalize mt-0.5">
                  {format(modalDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
                </p>
              </div>
              <button 
                onClick={closeModal}
                className="p-1.5 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              {getServicesForDate(format(modalDate, "yyyy-MM-dd")).length === 0 ? (
                <div className="text-center py-10 text-zinc-500">
                  Nenhum serviço disponível nesta data.
                </div>
              ) : (
                <div className="space-y-6">
                  {getServicesForDate(format(modalDate, "yyyy-MM-dd")).map((srv) => (
                    <div key={srv.id} className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 bg-zinc-50 dark:bg-zinc-900/50">
                      <div className="mb-3">
                        <h4 className="font-semibold text-zinc-800 dark:text-zinc-100 text-lg">{srv.name}</h4>
                        <p className="text-sm text-zinc-500">
                          R$ {srv.price.toFixed(2).replace('.', ',')} • {srv.duration} min
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {srv.available_slots.map((slot: string) => (
                          <button
                            key={slot}
                            onClick={() => handleSchedule(srv.id, srv.provider_id, slot)}
                            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium border border-[#104d30] dark:border-[#22c55e] text-[#104d30] dark:text-[#22c55e] hover:bg-[#e8f3ee] dark:hover:bg-[#16653f]/20 transition-colors"
                          >
                            <CheckCircle size={14} />
                            {slot}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
