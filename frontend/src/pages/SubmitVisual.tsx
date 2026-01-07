import { useMemo, useState, useEffect } from "react";
import { apiPost, apiGet } from "../api/client";
import type { ColorType, Limpidity, VisualEvaluationCreate, VisualEvaluationResponse } from "../types/visual";
import "../styles/submit-visual.css";

// Tom por cor
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

// Intensidade legendas
const intensityOptions = [
  { value: 1, label: "Baixa" },
  { value: 2, label: "Média-Menos" },
  { value: 3, label: "Média" },
  { value: 4, label: "Média-Mais" },
  { value: 5, label: "Alta" },
];

// Limpidez legendas
const limpidityOptions: { value: Limpidity; label: string }[] = [
  { value: "limpido", label: "Límpido" },
  { value: "turvo", label: "Turvo" },
];

// Cor legendas
const colorTypeOptions: { value: ColorType; label: string }[] = [
  { value: "branco", label: "Branco" },
  { value: "rose", label: "Rosé" },
  { value: "tinto", label: "Tinto" },
];

interface SubmitVisualProps {
  participantId: string;
  eventId: string;
  // se fornecido, marca automaticamente como gabarito
  initialIsAnswerKey?: boolean;
  // se true, o checkbox de gabarito fica desabilitado (sommelier)
  lockAnswerKey?: boolean;
}

export default function SubmitVisual({ participantId, eventId }: SubmitVisualProps) {
  const [participantIdState] = useState(participantId);
  const [roundId, setRoundId] = useState<string | null>(null);
  const [roundName, setRoundName] = useState<string | null>(null);
  const [loadingRound, setLoadingRound] = useState(false);

  const [limpidity, setLimpidity] = useState<Limpidity>("limpido");
  const [intensity, setIntensity] = useState<number>(3);
  const [colorType, setColorType] = useState<ColorType>("tinto");
  const [colorTone, setColorTone] = useState<string>("rubi");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VisualEvaluationResponse | null>(null);
  const [error, setError] = useState("");

  const toneOptions = useMemo(() => TONES[colorType], [colorType]);

  // Fetch first open round for the event
  useEffect(() => {
    let mounted = true;

    async function fetchOpenRound() {
      setLoadingRound(true);
      try {
        const data = await apiGet<{ id: string; name: string }>(`/events/${eventId}/open-round`);
        if (!mounted) return;
        setRoundId(data.id);
        setRoundName(data.name);
      } catch (err) {
        setRoundId(null);
        setRoundName(null);
      } finally {
        setLoadingRound(false);
      }
    }

    fetchOpenRound();

    return () => {
      mounted = false;
    };
  }, [eventId]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setResult(null);

    if (!roundId) {
      setError("Nenhum round aberto para este evento");
      return;
    }

    const payload: VisualEvaluationCreate = {
      participant_id: participantIdState,
      round_id: roundId,
      limpidity,
      intensity,
      color_type: colorType,
      color_tone: colorTone,
    };

    setLoading(true);
    try {
      const res = await apiPost<VisualEvaluationCreate, VisualEvaluationResponse>("/visual-evaluations", payload);
      setResult(res);
    } catch (err: any) {
      setError(err?.message ?? "Erro ao enviar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="submit-visual">
      <header className="submit-visual__header">

        {loadingRound ? (
          <div className="submit-visual__meta">
            <div className="skeleton skeleton--line" />
            <div className="skeleton skeleton--line skeleton--short" />
          </div>
        ) : roundId ? (
          <div className="submit-visual__meta">
            <div>
              <strong className="meta-value">{roundName}</strong>{" "}
            </div>
          </div>
        ) : (
          <div className="submit-visual__meta">
            <span className="meta-muted">Nenhum round aberto para este evento.</span>
          </div>
        )}
      </header>

      {error && (
        <div className="alert alert-error" role="alert" aria-live="assertive">
          {error}
        </div>
      )}

      {result && (
        <div className="alert alert-success" role="status" aria-live="polite">
          <div className="alert-title">Enviado com sucesso</div>
          <div className="alert-body">
            <div>Score: {result.score}</div>
            <div className="meta-muted">submitted_at: {result.submitted_at}</div>
          </div>
        </div>
      )}

      <fieldset className="group" disabled={loadingRound || !roundId}>
        <legend className="group-title">Limpidez</legend>
        <div className="radio-grid">
          {limpidityOptions.map((opt) => (
            <label key={opt.value} className="radio-card">
              <input
                type="radio"
                name="limpidity"
                value={opt.value}
                checked={limpidity === opt.value}
                onChange={() => setLimpidity(opt.value)}
              />
              <span className="radio-label">{opt.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="group" disabled={loadingRound || !roundId}>
        <legend className="group-title">Intensidade</legend>
        <div className="radio-grid-list radio-grid--5">
          {intensityOptions.map((opt) => (
            <label key={opt.value} className="radio-card">
              <input
                type="radio"
                name="intensity"
                value={opt.value}
                checked={intensity === opt.value}
                onChange={() => setIntensity(opt.value)}
              />
              <span className="radio-label">{opt.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="group" disabled={loadingRound || !roundId}>
        <legend className="group-title">Cor</legend>
        <div className="radio-grid-list">
          {colorTypeOptions.map((opt) => (
            <label key={opt.value} className="radio-card">
              <input
                type="radio"
                name="colorType"
                value={opt.value}
                checked={colorType === opt.value}
                onChange={() => {
                  setColorType(opt.value);
                  setColorTone(TONES[opt.value][0].value);
                }}
              />
              <span className="radio-label">{opt.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="group" disabled={loadingRound || !roundId}>
        <legend className="group-title">Tom</legend>
        <div className="radio-grid-list">
          {toneOptions.map((t) => (
            <label key={t.value} className="radio-card">
              <input
                type="radio"
                name="tone"
                value={t.value}
                checked={colorTone === t.value}
                onChange={() => setColorTone(t.value)}
              />
              <span className="radio-label">{t.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <button type="submit" className="btn btn-primary submit-visual__submit" disabled={loading || loadingRound || !roundId}>
        {loading ? "Enviando..." : loadingRound ? "Aguardando round..." : !roundId ? "Sem round" : "Enviar avaliação"}
      </button>
    </form>
  );
}