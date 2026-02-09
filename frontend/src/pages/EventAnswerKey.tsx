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
  const [openRound, setOpenRound] = useState<string | null>(null);
  const [openBlock, setOpenBlock] = useState<string | null>(null);

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

      {items.map((ev) => {
        const roundOpen = openRound === ev.round_id;

        const makeBlock = (key: string, label: string, rows: { label: string; value: string }[]) => ({ key, label, rows });

        const visualRows = [
          { label: "Limpidez", value: getLabelForValue(limpidityOptions, ev.limpidity) },
          { label: "Intensidade", value: getLabelForValue(intensityOptions, ev.visualIntensity) },
          { label: "Cor", value: getLabelForValue(colorTypeOptions, ev.color_type) },
          { label: "Tom", value: getToneLabel(ev.color_type, ev.color_tone) },
        ];

        const olfactiveRows = [
          { label: "Condição", value: getLabelForValue(conditionOptions, ev.condition) },
          { label: "Intensidade", value: getLabelForValue(intensityOptions, ev.aromaIntensity) },
          { label: "Aromas", value: ev.aromas ?? "-" },
        ];

        const gustativeRows = [
          { label: "Doçura", value: getLabelForValue(sweetnessOptions, ev.sweetness) },
          ...(ev.color_type !== "branco" && ev.tannin != null ? [{ label: "Taninos", value: getLabelForValue(intensityOptions2, ev.tannin) }] : []),
          { label: "Álcool", value: getLabelForValue(intensityOptions2, ev.alcohol) },
          { label: "Corpo", value: getLabelForValue(intensityOptions2, ev.consistence) },
          { label: "Acidez", value: getLabelForValue(intensityOptions, ev.acidity) },
          { label: "Final", value: getLabelForValue(intensityOptions3, ev.persistence) },
          { label: "Sabores", value: ev.flavors ?? "-" },
        ];

        const generalRows = [
          { label: "Qualidade", value: getLabelForValue(qualityOptions, ev.quality) },
          ...(ev.grape ? [{ label: "Uva", value: ev.grape }] : []),
          ...(ev.country ? [{ label: "País", value: ev.country }] : []),
          ...(ev.vintage ? [{ label: "Safra", value: String(ev.vintage) }] : []),
        ];

        const blocks = [
          makeBlock("visual", "Avaliação Visual", visualRows),
          makeBlock("olfactive", "Avaliação Olfativa", olfactiveRows),
          makeBlock("gustative", "Avaliação Gustativa", gustativeRows),
          makeBlock("general", "Informações Adicionais", generalRows),
        ];

        return (
          <div key={ev.round_id} className="round-card">
            <div
              className="round-header"
              onClick={() => setOpenRound(roundOpen ? null : ev.round_id)}
            >
              <div>
                <h3>{ev.round_name}</h3>
              </div>
              <span className="round-toggle">{roundOpen ? "▲" : "▼"}</span>
            </div>

            {roundOpen && (
              <div className="round-content">
                {blocks.map((block) => {
                  const blockKey = `${ev.round_id}-${block.key}`;
                  const blockOpen = openBlock === blockKey;

                  return (
                    <div key={block.key} className="block-card">
                      <div
                        className="block-header"
                        onClick={() => setOpenBlock(blockOpen ? null : blockKey)}
                      >
                        <span className="block-title">{block.label}</span>
                        <span className="block-toggle">{blockOpen ? "−" : "+"}</span>
                      </div>

                      {blockOpen && (
                        <div className="block-content">
                          <table className="result-table desktop-only">
                            <thead>
                              <tr>
                                <th>Campo</th>
                                <th>Resposta (Sommelier)</th>
                              </tr>
                            </thead>
                            <tbody>
                              {block.rows.map((row, idx) => (
                                <tr key={idx}>
                                  <td>{row.label}</td>
                                  <td>{row.value}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>

                          <div className="mobile-only">
                            {block.rows.map((row, idx) => (
                              <div key={idx} className="mobile-result-item">
                                <div className="mobile-item-header">
                                  <span className="mobile-item-label">{row.label}</span>
                                </div>
                                <div className="mobile-item-row">
                                  <strong>{row.value}</strong>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      <button className="btn btn-ghost answer-key-back-button" onClick={onBack}>
        Voltar
      </button>
    </div>
  );
}
