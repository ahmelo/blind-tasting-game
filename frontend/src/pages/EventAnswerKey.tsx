import { useEffect, useState } from "react";
import { apiGet } from "../api/client";
import "../styles/event_answer_key.css";
import type {
  ColorType,
  Condition,
  Country,
  Grape,
  Limpidity,
  Quality,
  Sweetness,
} from "../types/evaluations";

type AnswerKeyItem = {
  round_id: string;
  round_name: string;
  visualIntensity: number;
  color_type: ColorType;
  color_tone: string;
  limpidity: Limpidity;
  condition: Condition;
  aromaIntensity: number;
  aromas?: string;
  sweetness: Sweetness;
  tannin?: number;
  alcohol: number;
  consistence: number;
  acidity: number;
  persistence: number;
  flavors?: string;
  quality: Quality;
  grape?: Grape;
  country?: Country;
  vintage?: number;
};

// Mapeamento de intensidades para labels (mesmo padrão de Evaluation.tsx)
const intensityOptions = [
  { value: 1, label: "Baixa" },
  { value: 2, label: "Média-Menos" },
  { value: 3, label: "Média" },
  { value: 4, label: "Média-Mais" },
  { value: 5, label: "Alta" },
];

const intensityOptions2 = [
  { value: 1, label: "Baixo" },
  { value: 2, label: "Médio-Menos" },
  { value: 3, label: "Médio" },
  { value: 4, label: "Médio-Mais" },
  { value: 5, label: "Alto" },
];

const intensityOptions3 = [
  { value: 1, label: "Pouco" },
  { value: 2, label: "Médio-Menos" },
  { value: 3, label: "Médio" },
  { value: 4, label: "Médio-Mais" },
  { value: 5, label: "Longo" },
];

const limpidityOptions: { value: Limpidity; label: string }[] = [
  { value: "limpido", label: "Límpido" },
  { value: "turvo", label: "Turvo" },
];

const conditionOptions: { value: Condition; label: string }[] = [
  { value: "correto", label: "Correto" },
  { value: "defeituoso", label: "Defeituoso" },
];

const colorTypeOptions: { value: ColorType; label: string }[] = [
  { value: "branco", label: "Branco" },
  { value: "rose", label: "Rosé" },
  { value: "tinto", label: "Tinto" },
];

const sweetnessOptions: { value: Sweetness; label: string }[] = [
  { value: "seco", label: "Seco" },
  { value: "demi-sec", label: "Demi-Sec" },
  { value: "doce", label: "Doce" },
];

const qualityOptions: { value: Quality; label: string }[] = [
  { value: "pobre", label: "Pobre" },
  { value: "aceitável", label: "Aceitável" },
  { value: "boa", label: "Boa" },
  { value: "muito boa", label: "Muito Boa" },
  { value: "excelente", label: "Excelente" },
];

const TONES: Record<ColorType, { label: string; value: string }[]> = {
  branco: [
    { label: "Esverdeado", value: "esverdeado" },
    { label: "Palha", value: "palha" },
    { label: "Dourado", value: "dourado" },
    { label: "Âmbar", value: "ambar" },
  ],
  rose: [
    { label: "Salmão", value: "salmao" },
    { label: "Alaranjado", value: "alaranjado" },
    { label: "Cor-de-Rosa", value: "cor_de_rosa" },
    { label: "Avermelhado", value: "avermelhado" },
  ],
  tinto: [
    { label: "Púrpura", value: "purpura" },
    { label: "Rubi", value: "rubi" },
    { label: "Granada", value: "granada" },
    { label: "Acastanhado", value: "acastanhado" },
  ],
};

// Função auxiliar para obter o label de uma opção
function getLabelForValue(
  options: { value: number | string; label: string }[],
  value: number | string | undefined
): string {
  if (value === undefined || value === null) return "-";
  return options.find((opt) => opt.value === value)?.label ?? String(value);
}

// Função para obter label de tom
function getToneLabel(colorType: ColorType | undefined, colorTone: string | undefined): string {
  if (!colorType || !colorTone) return "-";
  const tones = TONES[colorType];
  return tones.find((t) => t.value === colorTone)?.label ?? colorTone;
}

export default function EventAnswerKey({
  eventId,
  onBack,
}: {
  eventId: string;
  onBack: () => void;
}) {
  const [items, setItems] = useState<AnswerKeyItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await apiGet<AnswerKeyItem[]>(
          `/events/${eventId}/answer-key`
        );
        setItems(data);
      } catch {
        setError("Erro ao carregar o gabarito.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [eventId]);

  if (loading) return <p>Carregando gabarito…</p>;
  if (error) return <p className="alert alert-error">{error}</p>;

  return (
    <div className="answer-key-container">
      <h2 className="answer-key-title">Gabarito do Evento</h2>

      {items.map((ev) => (
        <div key={ev.round_id} className="answer-key-round">
          <h4>
            {ev.round_name}
          </h4>

          {/* Avaliação Visual */}
          <fieldset className="answer-key-group">
            <legend className="answer-key-group-title">Avaliação Visual</legend>

            <div className="answer-key-field">
              <span className="answer-key-label">Limpidez:</span>
              <span className="answer-key-value">{getLabelForValue(limpidityOptions, ev.limpidity)}</span>
            </div>

            <div className="answer-key-field">
              <span className="answer-key-label">Intensidade:</span>
              <span className="answer-key-value">{getLabelForValue(intensityOptions, ev.visualIntensity)}</span>
            </div>

            <div className="answer-key-field">
              <span className="answer-key-label">Cor:</span>
              <span className="answer-key-value">{getLabelForValue(colorTypeOptions, ev.color_type)}</span>
            </div>

            <div className="answer-key-field">
              <span className="answer-key-label">Tom:</span>
              <span className="answer-key-value">{getToneLabel(ev.color_type, ev.color_tone)}</span>
            </div>
          </fieldset>

          {/* Avaliação Olfativa */}
          <fieldset className="answer-key-group">
            <legend className="answer-key-group-title">Avaliação Olfativa</legend>

            <div className="answer-key-field">
              <span className="answer-key-label">Condição:</span>
              <span className="answer-key-value">{getLabelForValue(conditionOptions, ev.condition)}</span>
            </div>

            <div className="answer-key-field">
              <span className="answer-key-label">Intensidade:</span>
              <span className="answer-key-value">{getLabelForValue(intensityOptions, ev.aromaIntensity)}</span>
            </div>

            <div className="answer-key-field">
              <span className="answer-key-label">Aromas:</span>
              <span className="answer-key-value">
                {ev.aromas ? ev.aromas : <span className="answer-key-empty">Não informado</span>}
              </span>
            </div>
          </fieldset>

          {/* Avaliação Gustativa */}
          <fieldset className="answer-key-group">
            <legend className="answer-key-group-title">Avaliação Gustativa</legend>

            <div className="answer-key-field">
              <span className="answer-key-label">Doçura:</span>
              <span className="answer-key-value">{getLabelForValue(sweetnessOptions, ev.sweetness)}</span>
            </div>

            {ev.color_type !== "branco" && ev.tannin != null && (
              <div className="answer-key-field">
                <span className="answer-key-label">Taninos:</span>
                <span className="answer-key-value">{getLabelForValue(intensityOptions2, ev.tannin)}</span>
              </div>
            )}

            <div className="answer-key-field">
              <span className="answer-key-label">Álcool:</span>
              <span className="answer-key-value">{getLabelForValue(intensityOptions2, ev.alcohol)}</span>
            </div>

            <div className="answer-key-field">
              <span className="answer-key-label">Corpo:</span>
              <span className="answer-key-value">{getLabelForValue(intensityOptions2, ev.consistence)}</span>
            </div>

            <div className="answer-key-field">
              <span className="answer-key-label">Acidez:</span>
              <span className="answer-key-value">{getLabelForValue(intensityOptions, ev.acidity)}</span>
            </div>

            <div className="answer-key-field">
              <span className="answer-key-label">Final:</span>
              <span className="answer-key-value">{getLabelForValue(intensityOptions3, ev.persistence)}</span>
            </div>

            <div className="answer-key-field">
              <span className="answer-key-label">Sabores:</span>
              <span className="answer-key-value">
                {ev.flavors ? ev.flavors : <span className="answer-key-empty">Não informado</span>}
              </span>
            </div>
          </fieldset>

          {/* Informações Adicionais */}
          <fieldset className="answer-key-group">
            <legend className="answer-key-group-title">Informações Adicionais</legend>

            <div className="answer-key-field">
              <span className="answer-key-label">Qualidade:</span>
              <span className="answer-key-value">{getLabelForValue(qualityOptions, ev.quality)}</span>
            </div>

            {ev.grape && (
              <div className="answer-key-field">
                <span className="answer-key-label">Uva:</span>
                <span className="answer-key-value">{ev.grape}</span>
              </div>
            )}

            {ev.country && (
              <div className="answer-key-field">
                <span className="answer-key-label">País:</span>
                <span className="answer-key-value">{ev.country}</span>
              </div>
            )}

            {ev.vintage && (
              <div className="answer-key-field">
                <span className="answer-key-label">Safra:</span>
                <span className="answer-key-value">{ev.vintage}</span>
              </div>
            )}
          </fieldset>
        </div>
      ))}

      <button className="btn btn-ghost answer-key-back-button" onClick={onBack}>
        Voltar
      </button>
    </div>
  );
}
