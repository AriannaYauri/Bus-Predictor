'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaBus, FaClock, FaInfoCircle, FaBolt, FaRocket, FaRegClock, FaCheckCircle, FaLightbulb, FaMapMarkerAlt } from 'react-icons/fa';

interface PredictionForm {
  route: 'C' | 'E9';
  hour: string;
}

interface PredictionResponse {
  lambda: number | null;
  probNext1: number | null;
  probNext5: number | null;
  probNext10: number | null;
  probNext15: number | null;
}

const LINES = {
  C: {
    name: 'Línea C',
    color: 'bg-blue-600',
    text: 'Servicio regular con alta frecuencia',
    freq: 'Cada 8 minutos',
    conf: '85%',
    schedule: '6:50 - 9:00 AM',
    icon: <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-lg">C</span>,
  },
  E9: {
    name: 'Expreso 9',
    color: 'bg-red-500',
    text: 'Servicio expreso con paradas limitadas',
    freq: 'Cada 12 minutos',
    conf: '78%',
    schedule: '6:50 - 9:00 AM',
    icon: <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-500 text-white font-bold text-lg">E9</span>,
  },
};

const PROB_ICONS = [
  <FaBolt className="text-yellow-400 text-2xl" />,
  <FaRocket className="text-pink-400 text-2xl" />,
  <FaRegClock className="text-orange-400 text-2xl" />,
  <FaCheckCircle className="text-green-400 text-2xl" />,
];

const PROB_LABELS = [
  'en 1 minuto',
  'en 5 minutos',
  'en 10 minutos',
  'en 15 minutos',
];

// Carrito animado SVG
function AnimatedCar() {
  return (
    <div className="flex justify-center items-center py-8">
      <svg width="80" height="40" viewBox="0 0 80 40" className="animate-car-move">
        <rect x="10" y="15" width="60" height="18" rx="5" fill="#3B82F6" />
        <rect x="18" y="19" width="15" height="8" rx="2" fill="#E5E7EB" />
        <rect x="37" y="19" width="15" height="8" rx="2" fill="#E5E7EB" />
        <circle cx="22" cy="35" r="5" fill="#1F2937" />
        <circle cx="58" cy="35" r="5" fill="#1F2937" />
        <circle cx="22" cy="35" r="2" fill="#6B7280" />
        <circle cx="58" cy="35" r="2" fill="#6B7280" />
        <circle cx="12" cy="20" r="2" fill="#FCD34D" />
        <circle cx="68" cy="20" r="2" fill="#FCD34D" />
      </svg>
      <style jsx>{`
        @keyframes car-move {
          0% { transform: translateX(-40px); opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateX(40px); opacity: 0; }
        }
        .animate-car-move {
          animation: car-move 2s cubic-bezier(0.4,0,0.2,1);
        }
      `}</style>
    </div>
  );
}

export default function Home() {
  const [submittedData, setSubmittedData] = useState<{ route: 'C' | 'E9'; hour: string } | null>({ route: 'C', hour: '07:30' });
  const [showCar, setShowCar] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<PredictionForm>({
    defaultValues: {
      route: 'C',
      hour: '07:30',
    },
  });
  const selectedRoute = watch('route') || 'C';

  // Consejos personalizados
  function getRecommendation(route: 'C' | 'E9', data: PredictionResponse | undefined) {
    if (!data || data.lambda === null) return '';
    const p1 = data.probNext1 ?? 0;
    const p5 = data.probNext5 ?? 0;
    const p15 = data.probNext15 ?? 0;
    if (p1 < 0.2) return 'La probabilidad de que llegue un bus en 1 minuto es baja. Llega con tiempo extra.';
    if (p5 > 0.6) return '¡Buen momento! Es probable que llegue un bus pronto.';
    if (p15 < 0.6) return 'La frecuencia es baja en este horario. Considera alternativas o espera más tiempo.';
    if (route === 'C') return 'Buen momento para el Línea C. Te recomendamos llegar unos minutos antes.';
    if (route === 'E9') return 'El Expreso 9 tiene menor frecuencia a esta hora. Considera llegar con tiempo extra.';
    return '';
  }

  // Validación de horario
  function isHourValid(hour: string) {
    if (!hour) return false;
    const [hours, minutes] = hour.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes;
    const minTime = 6 * 60 + 50; // 6:50
    const maxTime = 9 * 60 + 0;  // 9:00
    return totalMinutes >= minTime && totalMinutes <= maxTime;
  }

  // Manejar submit con animación de carrito
  const onSubmit = (data: PredictionForm) => {
    if (!isHourValid(data.hour)) return;
    setShowCar(true);
    setSubmittedData(data);
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center py-8 px-2 bg-blue-900">
      {/* Header */}
      <div className="w-full max-w-2xl rounded-2xl bg-white/5 border border-white/10 shadow-lg p-6 flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 text-white text-2xl"><FaMapMarkerAlt /></span>
          <div>
            <h1 className="text-xl font-bold text-gray-100">Predictor de Buses</h1>
            <p className="text-sm text-white">Estación Angamos</p>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-xs text-gray-200 mb-1">Hora actual</span>
          <span className="text-2xl font-mono text-white">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>

      {/* Mensaje grande de horario permitido */}
      <div className="w-full max-w-2xl mb-6">
        <div className="rounded-xl bg-white/80 border border-blue-200 shadow p-4 text-center">
          <span className="block text-lg md:text-2xl font-bold text-blue-700">Predicción válida solo para horarios entre 6:50 y 9:00 AM</span>
        </div>
      </div>

      {/* Selección de línea */}
      <div className="w-full max-w-2xl rounded-2xl bg-white/10 border border-white/10 shadow-lg p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <FaBus className="text-blue-300 text-lg" />
          <span className="font-semibold text-white">Selecciona tu línea de bus</span>
        </div>
        <div className="flex gap-4">
          {(['C', 'E9'] as const).map((route) => (
            <label
              key={route}
              className={`flex-1 cursor-pointer rounded-xl border-2 p-4 flex flex-col gap-1 items-start transition-all duration-200 ${selectedRoute === route ? 'border-white/80 bg-white/20 shadow-md' : 'border-transparent bg-white/5 hover:bg-white/10'}`}
            >
              <input
                type="radio"
                value={route}
                {...register('route', { required: true })}
                className="hidden"
              />
              <div className="flex items-center gap-3 mb-1">
                {LINES[route].icon}
                <span className="font-bold text-white text-lg">{LINES[route].name}</span>
              </div>
              <span className="text-blue-100 text-sm">{LINES[route].text}</span>
              <span className="text-blue-200 text-xs mt-1">{LINES[route].freq} • {LINES[route].conf} confiabilidad</span>
            </label>
          ))}
        </div>
      </div>

      {/* Selección de hora */}
      <div className="w-full max-w-2xl rounded-2xl bg-white/10 border border-white/10 shadow-lg p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <FaClock className="text-blue-300 text-lg" />
          <span className="font-semibold text-white">¿A qué hora llegarás a la estación?</span>
        </div>
        <form onSubmit={handleSubmit((data) => onSubmit(data))} className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <input
              type="time"
              {...register('hour', { 
                required: 'Selecciona una hora',
                validate: (value) => {
                  if (!value) return 'Selecciona una hora';
                  const [hours, minutes] = value.split(':').map(Number);
                  const totalMinutes = hours * 60 + minutes;
                  const minTime = 6 * 60 + 50; // 6:50
                  const maxTime = 9 * 60 + 0;  // 9:00
                  if (totalMinutes < minTime || totalMinutes > maxTime) {
                    return 'La hora debe estar entre 06:50 y 09:00';
                  }
                  return true;
                }
              })}
              min="06:50"
              max="09:00"
              step="60"
              className="px-4 py-2 rounded-lg bg-white/20 text-white font-mono text-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-400/40 w-32"
            />
            <span className="text-white font-mono text-lg">AM</span>
            <button type="submit" className="ml-4 px-5 py-2 rounded-lg bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition">Consultar</button>
          </div>
          <span className="text-blue-200 text-xs mt-1">Servicio disponible de 6:50 AM a 9:00 AM</span>
          {errors.hour && <span className="text-red-400 text-xs mt-1">{errors.hour.message}</span>}
        </form>
      </div>

      {/* Probabilidades */}
      <div className="w-full max-w-2xl rounded-2xl bg-white/10 border border-white/10 shadow-lg p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <span className={`inline-block w-3 h-3 rounded-full ${selectedRoute === 'C' ? 'bg-blue-500' : 'bg-red-500'}`}></span>
          <span className="font-semibold text-white">Probabilidades para {LINES[selectedRoute].name}</span>
        </div>
        {/* Carrito animado al cambiar horario */}
        {showCar ? (
          <AnimatedCar />
        ) : (
          <div className="text-center text-blue-100 py-8">No hay datos disponibles para este minuto.</div>
        )}
      </div>

      {/* Información de línea */}
      <div className="w-full max-w-2xl rounded-2xl bg-white/10 border border-white/10 shadow-lg p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <FaInfoCircle className="text-blue-300 text-lg" />
          <span className="font-semibold text-white">Información de {LINES[selectedRoute].name}</span>
        </div>
        {submittedData && submittedData.lambda !== null ? (
          <div className="flex flex-wrap gap-8 text-blue-100 text-sm">
            <div>
              <span className="block font-bold text-white">Frecuencia estimada</span>
              <span>
                {submittedData.lambda > 0
                  ? `Cada ${(1 / submittedData.lambda).toFixed(1)} min`
                  : '--'}
              </span>
            </div>
            <div>
              <span className="block font-bold text-white">Confiabilidad (≤10 min)</span>
              <span>
                {submittedData.lambda > 0
                  ? `${((1 - Math.exp(-submittedData.lambda * 10)) * 100).toFixed(1)}%`
                  : '--'}
              </span>
            </div>
            <div>
              <span className="block font-bold text-white">Tasa de llegada (λ)</span>
              <span>
                {submittedData.lambda > 0
                  ? `${submittedData.lambda.toFixed(3)} buses/min`
                  : '--'}
              </span>
            </div>
            <div>
              <span className="block font-bold text-white">Horario</span>
              <span>6:50 - 9:00 AM</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-8 text-blue-100 text-sm">
            <div>
              <span className="block font-bold text-white">Frecuencia estimada</span>
              <span>--</span>
            </div>
            <div>
              <span className="block font-bold text-white">Confiabilidad (≤10 min)</span>
              <span>--</span>
            </div>
            <div>
              <span className="block font-bold text-white">Tasa de llegada (λ)</span>
              <span>--</span>
            </div>
            <div>
              <span className="block font-bold text-white">Horario</span>
              <span>6:50 - 9:00 AM</span>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="w-full max-w-2xl text-center text-blue-200 text-xs mt-2">
        Predicciones basadas en datos históricos • Sistema en tiempo real
      </div>

      <style jsx global>{`
        .soft-bg-gradient {
          background: radial-gradient(ellipse 120% 100% at 50% 0%, #e3f0ff 0%, #f3e8ff 60%, #ffe8f3 100%);
        }
      `}</style>
    </div>
  );
}
