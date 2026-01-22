import { useMemo, useState, useEffect, useRef } from "react";
import { apiPost, apiGet } from "../api/client";
import type {
  ColorType,
  Limpidity,
  Condition,
  Sweetness,
  Quality,
  Grape,
  Country,
  EvaluationCreate,
  EvaluationResponse,
} from "../types/evaluations";
import "../styles/evaluation.css";

type RoundApiItem = {
  id: string;
  name: string;
  position: number;
  is_open: boolean;
  event_id: string;
};

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

const grapeOptions : Grape[] = [
  "Airén",
  "Albariño",
  "Barbera",
  "Cabernet Franc",
  "Cabernet Sauvignon",
  "Chardonnay",
  "Chenin Blanc",
  "Colombard",
  "Gamay",
  "Garnacha",
  "Gewürztraminer",
  "Macabeo",
  "Malbec",
  "Merlot",
  "Monastrell",
  "Moscato",
  "Nebbiolo",
  "Pinot Grigio",
  "Pinot Noir",
  "Riesling",
  "Sangiovese",
  "Sauvignon Blanc",
  "Semillon",
  "Syrah",
  "Tempranillo",
  "Touriga Nacional",
  "Trebbiano",
  "Verdejo",
  "Viognier",
  "Zinfandel"
];

const countryOptions = [
  "África do Sul",
  "Alemanha",
  "Argentina",
  "Armênia",
  "Austrália",
  "Áustria",
  "Bélgica",
  "Bolívia",
  "Brasil",
  "Bulgária",
  "Canadá",
  "Chile",
  "China",
  "Croácia",
  "Dinamarca",
  "Eslovênia",
  "Espanha",
  "Estados Unidos",
  "França",
  "Geórgia",
  "Grécia",
  "Hungria",
  "Israel",
  "Itália",
  "Líbano",
  "Macedônia do Norte",
  "Marrocos",
  "México",
  "Moldávia",
  "Nova Zelândia",
  "Países Baixos",
  "Portugal",
  "Reino Unido",
  "República Tcheca",
  "Romênia",
  "Suíça",
  "Tailândia",
  "Tunísia",
  "Uruguai"
];



interface Evaluation {
  participantId: string;
  eventId: string;
  initialIsAnswerKey: boolean;
  onEventClosed: () => void;
  scrollableRef?: React.RefObject<HTMLDivElement | null>;
}

function scrollToTop(scrollableRef?: React.RefObject<HTMLDivElement | null>) {
  try {
    if (scrollableRef?.current) {
      scrollableRef.current.scrollTop = 0;
      scrollableRef.current.scrollLeft = 0;
    } else {
      // Se não tem ref, tenta o window
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  } catch (e) {
    console.error("Erro ao fazer scroll:", e);
  }
}


export default function Evaluation({ participantId, eventId, initialIsAnswerKey, onEventClosed, scrollableRef }: Evaluation) {

  const formRef = useRef<HTMLFormElement>(null);

  const [isAnswerKey, setIsAnswerKey] = useState<boolean>(initialIsAnswerKey);

  const [canCloseRound, setCanCloseRound] = useState(false);
  const [closingRound, setClosingRound] = useState(false);
  const [closingEvent, setClosingEvent] = useState(false);

  const [roundId, setRoundId] = useState<string | null>(null);
  const [roundName, setRoundName] = useState<string | null>(null);
  const [loadingRound, setLoadingRound] = useState(false);

  const [limpidity, setLimpidity] = useState<Limpidity | null>(null);
  const [visualIntensity, setVisualIntensity] = useState<number | null>(null);
  const [colorType, setColorType] = useState<ColorType | null>(null);
  const [colorTone, setColorTone] = useState<string | null>(null);

  const [condition, setCondition] = useState<Condition | null>(null);
  const [aromaIntensity, setAromaIntensity] = useState<number | null>(null);
  const [aromas, setAromas] = useState<string | null>(null);

  const [sweetness, setSweetness] = useState<Sweetness | null>(null);
  const [tannin, setTannin] = useState<number | null>(null);
  const [alcohol, setAlcohol] = useState<number | null>(null);
  const [consistence, setConsistence] = useState<number | null>(null);
  const [acidity, setAcidity] = useState<number | null>(null);
  const [persistence, setPersistence] = useState<number | null>(null);
  const [flavors, setFlavors] = useState<string | null>(null);

  const [quality, setQuality] = useState<Quality | null>(null);
  const [grape, setGrape] = useState<Grape | null>(null);
  const [country, setCountry] = useState<Country | null>(null);
  const [vintage, setVintage] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [waiting, setWaiting] = useState(false);

  const toneOptions = useMemo(
    () => (colorType ? TONES[colorType] : []),
    [colorType]
  );

  function resetForm() {
    setLimpidity(null);
    setVisualIntensity(null);
    setColorType(null);
    setColorTone(null);
    setCondition(null);
    setAromaIntensity(null);
    setAromas(null);
    setSweetness(null);
    setTannin(null);
    setAlcohol(null);
    setConsistence(null);
    setAcidity(null);
    setPersistence(null);
    setFlavors(null);
    setQuality(null);
    setGrape(null);
    setCountry(null);
    setVintage(null);
  }

  function isEvaluationComplete() {
    const isTanninOk =
      colorType === "branco" ? true : tannin != null;
    return (
      limpidity &&
      colorType &&
      colorTone &&
      visualIntensity != null &&

      condition &&
      aromaIntensity != null &&

      sweetness &&
      isTanninOk &&
      alcohol != null &&
      consistence != null &&
      acidity != null &&
      persistence != null &&

      quality &&
      country &&
      grape
    );
  }
  useEffect(() => {
    loadPendingRound();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (roundId) {
      resetForm();
      setCanCloseRound(false);
      // Scroll para o topo após o novo round ser carregado
      requestAnimationFrame(() => {
        scrollToTop(scrollableRef);
        // Tenta fazer scroll no formulário também
        if (formRef.current) {
          formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        // Segunda chamada para garantir
        setTimeout(() => {
          scrollToTop(scrollableRef);
          if (formRef.current) {
            formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 50);
      });
    }
    setIsAnswerKey(initialIsAnswerKey);
  }, [roundId, scrollableRef]);

  useEffect(() => {
    if (!waiting || !onEventClosed) return;

    const interval = setInterval(async () => {
      try {
        const events = await apiGet<any[]>("/events");
        const event = events.find(e => e.id === eventId);

        if (event && event.is_open === false) {
          clearInterval(interval);
          onEventClosed();
        }
      } catch {
        // ignora erro momentâneo
      }
    }, 3000); // 3 segundos (ótimo equilíbrio)

    return () => clearInterval(interval);
  }, [waiting, eventId, onEventClosed]);

  async function loadPendingRound() {
    setLoadingRound(true);
    setError("");

    try {
      const [rounds, answered] = await Promise.all([
        apiGet<RoundApiItem[]>(`/rounds?event_id=${eventId}`),
        apiGet<string[]>(
          `/evaluations/answered-rounds?participant_id=${participantId}&event_id=${eventId}`
        ),
      ]);

      const openRounds = rounds
        .filter((r) => r.is_open)
        .sort((a, b) => a.position - b.position);

      const answeredSet = new Set(answered);
      const next = openRounds.find((r) => !answeredSet.has(r.id));

      if (next) {
        setRoundId(next.id);
        setRoundName(next.name);
        setWaiting(false);
      } else {
        setRoundId(null);
        setRoundName(null);
        setWaiting(true);
        scrollToTop();
      }
    } catch {
      setWaiting(true);
    } finally {
      setLoadingRound(false);
    }
  }

  async function closeRound() {

    if (!roundId) return;

    setClosingRound(true);
    setError("");

    try {
      await apiPost(`/rounds/${roundId}/close`, {});
      setCanCloseRound(false);
      await loadPendingRound(); // vai buscar o próximo round aberto
    } catch {
      setError("Erro ao fechar a rodada.");
    } finally {
      setClosingRound(false);
    }
  }

  async function closeEvent() {
    if (!eventId) return;

    setClosingEvent(true);
    setError("");

    try {
      await apiPost(`/events/${eventId}/close`, {});
      setWaiting(true); // evento acabou, não tem mais fluxo
    } catch {
      setError("Erro ao fechar o evento.");
    } finally {
      setClosingEvent(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!roundId) return;

    if (!isEvaluationComplete()) {
      setError("Preencha todos os campos obrigatórios.");
      return;
    }

    setLoading(true);
    scrollToTop(scrollableRef);

    try {
      const payload: EvaluationCreate = {
        participant_id: participantId,
        round_id: roundId,
        visualIntensity: visualIntensity!,
        color_type: colorType!,
        color_tone: colorTone!,
        limpidity: limpidity!,
        condition: condition!,
        aromaIntensity: aromaIntensity!,
        aromas: aromas!,
        sweetness: sweetness!,
        //        tannin: tannin!,
        alcohol: alcohol!,
        consistence: consistence!,
        acidity: acidity!,
        persistence: persistence!,
        flavors: flavors!,
        quality: quality!,
        grape: grape!,
        country: country!,
        vintage: vintage ? parseInt(vintage) : 0,
        is_answer_key: isAnswerKey,
        ...(colorType !== "branco" && tannin !== null && { tannin: tannin })
      };

      await apiPost<
        EvaluationCreate,
        EvaluationResponse
      >("/evaluations", payload);

      if (isAnswerKey) {
        setCanCloseRound(true);
      } else {
        await new Promise((r) => setTimeout(r, 800));
        await loadPendingRound();
      }

    } catch {
      setError("Erro ao enviar avaliação.");
    } finally {
      setLoading(false);
    }
  }

  if (waiting) {
    // SOMMELIER
    if (isAnswerKey) {
      return (
        <div className="alert">
          <p>Todos os rounds foram finalizados.</p>

          <div style={{ marginTop: 16 }}>
            <button
              type="button"
              className="btn btn-danger"
              disabled={closingEvent}
              onClick={closeEvent}
            >
              {closingEvent ? "Fechando evento..." : "Fechar evento"}
            </button>
          </div>
        </div>
      );
    }

    // PARTICIPANTE
    return (
      <div className="alert">
        <p>Aguarde a finalização do evento.</p>
      </div>
    );
  }


  return (
    <form onSubmit={onSubmit} className="evaluation" ref={formRef}>
      <h4>{roundName}</h4>

      {loading && (
        <div className="loading-overlay">
          <p>Enviando avaliação...</p>
        </div>
      )}

      {error && <div className="alert alert-error">{error}</div>}

      {/* Avaliação Visual */}
      <fieldset className="group" disabled={loadingRound || !roundId || canCloseRound}>
        <legend className="group-title">Avaliação Visual</legend>

        {/* Limpidez */}
        <fieldset className="group" disabled={loadingRound || !roundId || canCloseRound}>
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

        {/* Intensidade Visual */}
        <fieldset className="group" disabled={loadingRound || !roundId || canCloseRound}>
          <legend className="group-title">Intensidade</legend>
          <div className="radio-grid">
            {intensityOptions.map((opt) => (
              <label key={opt.value} className="radio-card">
                <input
                  type="radio"
                  name="visualIntensity"
                  value={opt.value}
                  checked={visualIntensity === opt.value}
                  onChange={() => setVisualIntensity(opt.value)}
                />
                <span className="radio-label">{opt.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {/* Cor */}
        <fieldset className="group" disabled={loadingRound || !roundId || canCloseRound}>
          <legend className="group-title">Cor</legend>
          <div className="radio-grid">
            {colorTypeOptions.map((opt) => (
              <label key={opt.value} className="radio-card">
                <input
                  type="radio"
                  name="colorType"
                  value={opt.value}
                  checked={colorType === opt.value}
                  onChange={() => {
                    setColorType(opt.value);
                    setColorTone(null);
                    if (opt.value === "branco") {
                      setTannin(null);
                    }
                  }}
                />
                <span className="radio-label">{opt.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {/* Tom */}
        {colorType && (
          <fieldset className="group" disabled={loadingRound || !roundId || canCloseRound}>
            <legend className="group-title">Tom</legend>
            <div className="radio-grid">
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
        )}
      </fieldset>

      {/* Avaliação Olfativa */}
      <fieldset className="group" disabled={loadingRound || !roundId || canCloseRound}>
        <legend className="group-title">Avaliação Olfativa</legend>

        {/* Condição */}
        <fieldset className="group" disabled={loadingRound || !roundId || canCloseRound}>
          <legend className="group-title">Condição</legend>
          <div className="radio-grid">
            {conditionOptions.map((opt) => (
              <label key={opt.value} className="radio-card">
                <input
                  type="radio"
                  name="condition"
                  value={opt.value}
                  checked={condition === opt.value}
                  onChange={() => setCondition(opt.value)}
                />
                <span className="radio-label">{opt.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {/* Intensidade Visual */}
        <fieldset className="group" disabled={loadingRound || !roundId || canCloseRound}>
          <legend className="group-title">Intensidade</legend>
          <div className="radio-grid">
            {intensityOptions.map((opt) => (
              <label key={opt.value} className="radio-card">
                <input
                  type="radio"
                  name="aromaIntensity"
                  value={opt.value}
                  checked={aromaIntensity === opt.value}
                  onChange={() => setAromaIntensity(opt.value)}
                />
                <span className="radio-label">{opt.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {/* Aromas */}
        <fieldset className="group" disabled={loadingRound || !roundId || canCloseRound}>
          <legend className="group-title">Aromas</legend>
          <input
            type="text"
            name="aroma"
            className="input"
            placeholder="Descreva os aromas percebidos"
            value={aromas?.valueOf() ?? ""}
            onChange={(e) => setAromas(e.target.value)}
          />
        </fieldset>

      </fieldset>

      {/* Avaliação Gustativa */}
      <fieldset className="group" disabled={loadingRound || !roundId || canCloseRound}>
        <legend className="group-title">Avaliação Gustativa</legend>

        {/* Doçura */}
        <fieldset className="group" disabled={loadingRound || !roundId || canCloseRound}>
          <legend className="group-title">Doçura</legend>
          <div className="radio-grid">
            {sweetnessOptions.map((opt) => (
              <label key={opt.value} className="radio-card">
                <input
                  type="radio"
                  name="sweetness"
                  value={opt.value}
                  checked={sweetness === opt.value}
                  onChange={() => setSweetness(opt.value)}
                />
                <span className="radio-label">{opt.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {/* Taninos */}
        {colorType !== "branco" && (
          <fieldset className="group" disabled={loadingRound || !roundId || canCloseRound}>
            <legend className="group-title">Taninos</legend>
            <div className="radio-grid">
              {intensityOptions2.map((opt) => (
                <label key={opt.value} className="radio-card">
                  <input
                    type="radio"
                    name="tannin"
                    value={opt.value}
                    checked={tannin === opt.value}
                    onChange={() => setTannin(opt.value)}
                  />
                  <span className="radio-label">{opt.label}</span>
                </label>
              ))}
            </div>
          </fieldset>
        )}

        {/* Álcool */}
        <fieldset className="group" disabled={loadingRound || !roundId || canCloseRound}>
          <legend className="group-title">Álcool</legend>
          <div className="radio-grid">
            {intensityOptions2.map((opt) => (
              <label key={opt.value} className="radio-card">
                <input
                  type="radio"
                  name="alcohol"
                  value={opt.value}
                  checked={alcohol === opt.value}
                  onChange={() => setAlcohol(opt.value)}
                />
                <span className="radio-label">{opt.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {/* Corpo */}
        <fieldset className="group" disabled={loadingRound || !roundId || canCloseRound}>
          <legend className="group-title">Corpo</legend>
          <div className="radio-grid">
            {intensityOptions2.map((opt) => (
              <label key={opt.value} className="radio-card">
                <input
                  type="radio"
                  name="consistence"
                  value={opt.value}
                  checked={consistence === opt.value}
                  onChange={() => setConsistence(opt.value)}
                />
                <span className="radio-label">{opt.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {/* Acidez */}
        <fieldset className="group" disabled={loadingRound || !roundId || canCloseRound}>
          <legend className="group-title">Acidez</legend>
          <div className="radio-grid">
            {intensityOptions.map((opt) => (
              <label key={opt.value} className="radio-card">
                <input
                  type="radio"
                  name="acidity"
                  value={opt.value}
                  checked={acidity === opt.value}
                  onChange={() => setAcidity(opt.value)}
                />
                <span className="radio-label">{opt.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {/* Final */}
        <fieldset className="group" disabled={loadingRound || !roundId || canCloseRound}>
          <legend className="group-title">Final</legend>
          <div className="radio-grid">
            {intensityOptions3.map((opt) => (
              <label key={opt.value} className="radio-card">
                <input
                  type="radio"
                  name="persistence"
                  value={opt.value}
                  checked={persistence === opt.value}
                  onChange={() => setPersistence(opt.value)}
                />
                <span className="radio-label">{opt.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {/* Sabores */}
        <fieldset className="group" disabled={loadingRound || !roundId || canCloseRound}>
          <legend className="group-title">Sabores</legend>
          <input
            type="text"
            name="sabor"
            className="input"
            placeholder="Descreva os sabores percebidos"
            value={flavors?.valueOf() ?? ""}
            onChange={(e) => setFlavors(e.target.value)}
          />
        </fieldset>

      </fieldset>

      {/* Informações Adicionais */}
      <fieldset className="group" disabled={loadingRound || !roundId || canCloseRound}>
        <legend className="group-title">Informações Adicionais</legend>

        {/* Qualidade */}
        <fieldset
          className="group"
          disabled={loadingRound || !roundId || canCloseRound}
        >
          <legend className="group-title">Qualidade</legend>

          <div className="field">
            <select
              id="qualitySelect"
              className="select select--clean"
              value={quality ?? ""}
              onChange={(e) => setQuality(e.target.value as Quality)}
            >
              <option value="">Selecione a qualidade</option>

              {qualityOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </fieldset>

        {/* Uva */}
        <fieldset className="group" disabled={loadingRound || !roundId || canCloseRound}>
          <legend className="group-title">Uva Principal</legend>

          <div className="field">
            <select
              className="select select--clean"
              value={grape ?? ""}
              onChange={(e) => setGrape(e.target.value as Grape)}
            >
              <option value="">Selecione a uva</option>

              {grapeOptions.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
        </fieldset>

        {/* País */}
        <fieldset className="group" disabled={loadingRound || !roundId || canCloseRound}>
          <legend className="group-title">País</legend>

          <div className="field">
            <select
              className="select select--clean"
              value={country ?? ""}
              onChange={(e) => setCountry(e.target.value as Country)}
            >
              <option value="">Selecione o país</option>

              {countryOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </fieldset>

        {/* Ano */}
        <fieldset className="group" disabled={loadingRound || !roundId || canCloseRound}>
          <legend className="group-title">Ano</legend>
          <input
            type="number"
            name="vintage"
            className="input"
            placeholder="Qual o ano de produção do vinho?"
            value={vintage?.valueOf() ?? ""}
            inputMode="numeric"
            pattern="[0-9]*"
            min="1900"
            max={new Date().getFullYear()}
            onChange={(e) => setVintage(e.target.value)}
          />
        </fieldset>


      </fieldset>

      {!(isAnswerKey && canCloseRound) && (
        <button className="btn btn-primary" disabled={loading || loadingRound}>
          {loading ? "Enviando..." : "Enviar avaliação"}
        </button>
      )}

      {isAnswerKey && canCloseRound && roundId && (
        <button
          type="button"
          className="btn btn-danger"
          disabled={closingRound}
          onClick={closeRound}
        >
          {closingRound ? "Fechando rodada..." : "Fechar rodada"}
        </button>
      )}
    </form>
  );
}
