import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { ArrowLeft, Calendar as CalendarIcon, Check, X } from "lucide-react";
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
  endOfWeek
} from "date-fns";
import { ptBR } from "date-fns/locale";

// Configurações dos horários disponíveis
const AVAILABLE_SLOTS = [
  "06:00-07:00",
  "07:00-08:00",
  "09:00-10:00",
  "10:00-11:00",
  "11:00-12:00",
  "15:00-16:00",
  "16:00-17:00",
  "17:00-18:00"
];

export default function RegisterService() {
  const navigate = useNavigate();
  const location = useLocation();
  const userId = location.state?.user?.id;

  // Estados do formulário
  const [nome, setNome] = useState("");
  const [preco, setPreco] = useState("");
  const [duracao, setDuracao] = useState("");

  // Estado do calendário e agendamentos
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // selectedDays guarda os dias e os horários escolhidos. Ex: { "2023-09-15": ["06:00-07:00", "09:00-10:00"] }
  const [selectedDays, setSelectedDays] = useState<Record<string, string[]>>({});

  // Estado do Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalDate, setModalDate] = useState<Date | null>(null);
  const [tempSlots, setTempSlots] = useState<string[]>([]); // Slots selecionados no modal temporariamente

  // Máscara de Moeda (ex: 1500 -> 15,00)
  const handlePrecoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ""); // Remove tudo que não for número
    if (value === "") {
      setPreco("");
      return;
    }
    // Formata o número (divide por 100)
    const numValue = (parseInt(value, 10) / 100).toFixed(2);
    // Formata usando vírgula e separa os milhares
    const formatted = numValue
      .replace(".", ",")
      .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
    setPreco(formatted);
  };

  const precoNumber = preco ? parseFloat(preco.replace(/\./g, "").replace(",", ".")) : 0;
  const duracaoNumber = duracao ? parseInt(duracao, 10) : 0;

  // Lógica do Calendário
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const daysInCalendar = eachDayOfInterval({
    start: startDate,
    end: endDate
  });

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  // Abrir o Modal
  const openModalForDate = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    setModalDate(date);
    setTempSlots(selectedDays[dateStr] || []);
    setIsModalOpen(true);
  };

  // Fechar o Modal
  const closeModal = () => {
    setIsModalOpen(false);
    setModalDate(null);
    setTempSlots([]);
  };

  // Alternar slot no Modal
  const toggleSlot = (slot: string) => {
    setTempSlots((prev) =>
      prev.includes(slot)
        ? prev.filter((s) => s !== slot)
        : [...prev, slot]
    );
  };

  // Salvar a seleção do Modal
  const saveSlotsForDate = () => {
    if (modalDate) {
      const dateStr = format(modalDate, "yyyy-MM-dd");
      setSelectedDays((prev) => {
        const newSelected = { ...prev };
        if (tempSlots.length > 0) {
          newSelected[dateStr] = tempSlots;
        } else {
          delete newSelected[dateStr];
        }
        return newSelected;
      });
    }
    closeModal();
  };

  // Validação
  const isValid = 
    nome.trim() !== "" &&
    precoNumber > 0 &&
    duracaoNumber > 0 &&
    Object.keys(selectedDays).length > 0;

  const handleSubmit = async () => {
    if (isValid) {
      if (!userId) {
        alert("Erro: Usuário não identificado. Por favor, faça login novamente.");
        navigate("/");
        return;
      }

      const payload = {
        provider_id: userId,
        name: nome,
        duration: duracaoNumber,
        price: precoNumber,
        availability: selectedDays
      };

      try {
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
        const response = await fetch(`${apiUrl}/services/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || "Erro ao cadastrar serviço no banco de dados.");
        }

        alert("Serviço cadastrado com sucesso!");
        navigate("/home", { state: { user: location.state?.user } });
      } catch (err: any) {
        console.error(err);
        alert(err.message);
      }
    }
  };

  return (
    <main className="flex-1 w-full min-h-screen bg-zinc-50 dark:bg-zinc-950 p-4 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-3xl bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        
        {/* Cabeçalho */}
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 mr-4 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-semibold text-zinc-800 dark:text-zinc-100">Cadastro de Serviço</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Preencha os detalhes e a disponibilidade do serviço</p>
          </div>
        </div>

        {/* Formulário */}
        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Nome do serviço:
              </label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Consulta Odontológica"
                className="w-full px-4 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#104d30] dark:focus:ring-[#16653f] transition-all"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Preço da consulta (R$):
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-400">R$</span>
                  <input
                    type="text"
                    value={preco}
                    onChange={handlePrecoChange}
                    placeholder="0,00"
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#104d30] dark:focus:ring-[#16653f] transition-all"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Duração (min):
                </label>
                <input
                  type="number"
                  value={duracao}
                  onChange={(e) => setDuracao(e.target.value)}
                  placeholder="Ex: 60"
                  min="1"
                  className="w-full px-4 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#104d30] dark:focus:ring-[#16653f] transition-all"
                />
              </div>
            </div>
          </div>

          <hr className="border-zinc-200 dark:border-zinc-800" />

          {/* Seção Calendário */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
                <CalendarIcon size={20} className="text-[#104d30] dark:text-[#16653f]" />
                Dias Disponíveis
              </h2>
              <div className="flex items-center gap-2">
                <button onClick={prevMonth} className="px-3 py-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-sm font-medium transition-colors border border-zinc-200 dark:border-zinc-700">
                  &lt;
                </button>
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 w-32 text-center capitalize">
                  {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
                </span>
                <button onClick={nextMonth} className="px-3 py-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-sm font-medium transition-colors border border-zinc-200 dark:border-zinc-700">
                  &gt;
                </button>
              </div>
            </div>

            {/* Grid do Calendário */}
            <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden bg-zinc-50 dark:bg-zinc-900/50">
              <div className="grid grid-cols-7 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
                  <div key={day} className="py-2 text-center text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    {day}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7">
                {daysInCalendar.map((day) => {
                  const dateStr = format(day, "yyyy-MM-dd");
                  const isCurrentMonth = isSameMonth(day, currentMonth);
                  const isToday = isSameDay(day, new Date());
                  const hasSlots = selectedDays[dateStr] && selectedDays[dateStr].length > 0;

                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => openModalForDate(day)}
                      disabled={!isCurrentMonth}
                      className={`
                        min-h-[80px] p-2 border-r border-b border-zinc-200 dark:border-zinc-800 relative
                        transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800/80
                        ${!isCurrentMonth ? "bg-zinc-100/50 dark:bg-zinc-900/50 text-zinc-400 dark:text-zinc-600 cursor-not-allowed" : "bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300"}
                        ${hasSlots ? "bg-[#e8f3ee] dark:bg-[#16653f]/20 hover:bg-[#d1e8dc]" : ""}
                      `}
                    >
                      <span className={`
                        absolute top-2 left-2 text-sm font-medium flex items-center justify-center w-7 h-7 rounded-full
                        ${isToday ? "bg-[#104d30] dark:bg-[#16653f] text-white" : ""}
                        ${hasSlots && !isToday ? "text-[#104d30] dark:text-[#22c55e]" : ""}
                      `}>
                        {format(day, "d")}
                      </span>
                      
                      {hasSlots && (
                        <div className="absolute bottom-2 left-2 flex flex-col items-start w-[calc(100%-16px)] overflow-hidden">
                          <span className="text-[10px] font-semibold text-[#104d30] dark:text-[#22c55e] bg-white dark:bg-zinc-900 px-1.5 py-0.5 rounded shadow-sm border border-[#104d30]/20 dark:border-[#22c55e]/20 truncate max-w-full">
                            {selectedDays[dateStr].length} horários
                          </span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
            <p className="text-xs text-zinc-500 mt-3 text-center">Clique em um dia para configurar os horários disponíveis.</p>
          </div>
        </div>

        {/* Rodapé com botão */}
        <div className="p-6 bg-zinc-50 dark:bg-zinc-900/50 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={!isValid}
            className={`
              px-8 py-3 rounded-lg font-medium transition-all shadow-sm
              ${isValid 
                ? "bg-[#104d30] hover:bg-[#0a3320] dark:bg-[#16653f] dark:hover:bg-[#1a7a4c] text-white active:scale-[0.98]" 
                : "bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 cursor-not-allowed"}
            `}
          >
            Cadastrar Serviço
          </button>
        </div>
      </div>

      {/* Modal Overlay */}
      {isModalOpen && modalDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl w-full max-w-md overflow-hidden transform scale-100 transition-all">
            <div className="p-5 flex justify-between items-center border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
              <div>
                <h3 className="text-lg font-medium text-zinc-800 dark:text-zinc-100">
                  Selecionar Horários
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
            
            <div className="p-6">
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                Quais horários o serviço estará disponível neste dia?
              </p>
              
              <div className="grid grid-cols-2 gap-3">
                {AVAILABLE_SLOTS.map((slot) => {
                  const isSelected = tempSlots.includes(slot);
                  return (
                    <button
                      key={slot}
                      onClick={() => toggleSlot(slot)}
                      className={`
                        flex items-center justify-between px-3 py-2.5 rounded-lg border text-sm font-medium transition-colors
                        ${isSelected 
                          ? "border-[#104d30] dark:border-[#22c55e] bg-[#e8f3ee] dark:bg-[#16653f]/20 text-[#104d30] dark:text-[#22c55e]" 
                          : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 text-zinc-700 dark:text-zinc-300"}
                      `}
                    >
                      {slot}
                      {isSelected && <Check size={16} />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex justify-end gap-3">
              <button
                onClick={closeModal}
                className="px-4 py-2.5 rounded-lg font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={saveSlotsForDate}
                className="px-6 py-2.5 rounded-lg font-medium bg-[#104d30] hover:bg-[#0a3320] dark:bg-[#16653f] dark:hover:bg-[#1a7a4c] text-white transition-colors"
              >
                Salvar Horários
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
