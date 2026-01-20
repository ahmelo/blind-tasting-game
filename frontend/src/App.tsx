import { useState, useEffect, useRef } from "react";
import Login from "./pages/Login";
import Evaluation from "./pages/Evaluation";
import Ranking from "./pages/Ranking";
import Winner from "./pages/Winner";
import Events from "./pages/Events";
import Rounds from "./pages/Rounds";
import ParticipantResult from "./pages/ParticipantResult";
import { apiGet } from "./api/client";
import "./styles/ui.css";
import type { EvaluationResultResponse } from "./types/results";

type UserType = "sommelier" | "participant" | null;

type SommelierView =
  | "menu"
  | "events"
  | "rounds"
  | "gabarito"
  | "event-result";

export default function App() {
  const [user, setUser] = useState<{ type: UserType; info: any } | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const hamburgerRef = useRef<HTMLButtonElement | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [roundIds, setRoundIds] = useState<string[]>([]);
  const [participantResults, setParticipantResults] = useState<EvaluationResultResponse[]>([]);
  const [loadingResult, setLoadingResult] = useState(false);
  const [resultError, setResultError] = useState("");


  /* =========================
   * SOMMELIER STATE
   * ========================= */
  const [sommelierView, setSommelierView] = useState<SommelierView>("menu");
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [gabaritoEvents, setGabaritoEvents] = useState<
    Array<{ id: string; name: string; access_code?: string; is_open: boolean }>
  >([]);

  /* =========================
   * PARTICIPANT STATE
   * ========================= */
  const [eventIsOpen, setEventIsOpen] = useState<boolean | null>(null);

  /* ============================================================
   * PARTICIPANTE → acompanha status do evento
   * ============================================================ */
  useEffect(() => {
    if (!user || user.type !== "participant") return;

    const participant = user;

    async function loadEventStatus() {
      try {
        const events = await apiGet<any[]>("/events");
        const ev = events.find(
          (e) => e.id === participant.info.event_id
        );
        setEventIsOpen(ev ? ev.is_open : false);

        // Quando evento fecha, busca todos os rounds do evento
        if (ev && !ev.is_open) {
          const rounds = await apiGet<any[]>(
            `/rounds?event_id=${participant.info.event_id}`
          );
          setRoundIds(rounds.map((r) => r.id));
        }
      } catch {
        setEventIsOpen(false);
      }
    }

    loadEventStatus();
  }, [user]);

  async function loadParticipantResults() {
    if (roundIds.length === 0) {
      setResultError("Nenhum round encontrado para este evento.");
      return;
    }
    setLoadingResult(true);
    setResultError("");

    try {
      const responses = await Promise.all(
        roundIds.map(roundId =>
          apiGet<EvaluationResultResponse>(
            `/results/my-evaluation?round_id=${roundId}`
          )
        )
      );

      setParticipantResults(responses);
      setShowResult(true);
    } catch (err: any) {
      setResultError(err?.message || "Erro ao carregar resultados.");
    } finally {
      setLoadingResult(false);
    }
  }



  /* ============================================================
   * SOMMELIER → eventos abertos para gabarito
   * ============================================================ */
  useEffect(() => {
    if (sommelierView !== "gabarito") return;

    async function loadOpenEvents() {
      try {
        const events = await apiGet<any[]>("/events");
        setGabaritoEvents(events.filter((e) => e.is_open));
      } catch {
        setGabaritoEvents([]);
      }
    }

    loadOpenEvents();
  }, [sommelierView]);

  /* ============================================================
   * Listener menu
   * ============================================================ */

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;

      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        hamburgerRef.current &&
        !hamburgerRef.current.contains(target)
      ) {
        setMenuOpen(false);
      }
    }

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  /* ============================================================
   * LOGIN
   * ============================================================ */
  if (!user) {
    return <Login onLogin={(type, info) => setUser({ type, info })} />;
  }

  /* ============================================================
   * SOMMELIER
   * ============================================================ */
  if (user.type === "sommelier") {
    return (
      <div className="app-shell">
        <header className="topbar">
          <div className="topbar-left">
            <div className="brand-dot" />
            <div>
              <div className="topbar-title">Savoir-Vin</div>
              <div className="topbar-subtitle">Painel do Sommelier</div>
            </div>
          </div>

          <div className="topbar-right">
            {/* Desktop */}
            <button
              className="btn btn-outline btn-logout-desktop"
              onClick={() => {
                setMenuOpen(false);
                setUser(null);
              }}
            >
              Sair
            </button>

            {/* Mobile */}
            <button
              ref={hamburgerRef}
              className="hamburger"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menu"
            >
              ☰
            </button>
          </div>

          {menuOpen && (
            <div ref={menuRef} className="mobile-menu">
              <button
                className="mobile-menu-item"
                onClick={() => {
                  setMenuOpen(false);
                  setUser(null);
                }}
              >
                Sair
              </button>
            </div>
          )}
        </header>

        <main className="content">
          <div className="container">

            {/* ================= MENU ================= */}
            {sommelierView === "menu" && (
              <div className="card stack menu-list">
                <button
                  className="menu-item"
                  onClick={() => setSommelierView("events")}
                >
                  Evento
                </button>
                <button
                  className="menu-item"
                  onClick={() => setSommelierView("rounds")}
                >
                  Round
                </button>
                <button
                  className="menu-item"
                  onClick={() => {
                    setSelectedEventId(null);
                    setSommelierView("gabarito");
                  }}
                >
                  Gabarito
                </button>
              </div>
            )}

            {/* ================= EVENTS ================= */}
            {sommelierView === "events" && (
              <Events
                onBack={() => setSommelierView("menu")}
                onViewResult={(eventId: string) => {
                  setSelectedEventId(eventId);
                  setSommelierView("event-result");
                }}
              />
            )}

            {/* ================= ROUNDS ================= */}
            {sommelierView === "rounds" && (
              <Rounds onBack={() => setSommelierView("menu")} />
            )}

            {/* ================= GABARITO ================= */}
            {sommelierView === "gabarito" && (
              <div className="card stack">
                <div className="row-between">
                  <h1 className="h1">Gabarito</h1>
                  <button
                    className="btn btn-ghost"
                    onClick={() => setSommelierView("menu")}
                  >
                    Voltar
                  </button>
                </div>

                {gabaritoEvents.length === 0 && (
                  <div className="alert">
                    Nenhum evento aberto no momento.
                  </div>
                )}

                {!selectedEventId &&
                  gabaritoEvents.map((ev) => (
                    <button
                      key={ev.id}
                      className="menu-item"
                      onClick={() => setSelectedEventId(ev.id)}
                    >
                      {ev.name}
                    </button>
                  ))}

                {selectedEventId && (
                  <Evaluation
                    participantId={user.info.participant_id}
                    eventId={selectedEventId}
                    initialIsAnswerKey={true}
                    onEventClosed={() => setEventIsOpen(false)}
                  />
                )}
              </div>
            )}

            {/* ================= EVENT RESULT ================= */}
            {sommelierView === "event-result" && selectedEventId && (
              <div className="stack">
                <button
                  className="btn btn-ghost"
                  onClick={() => setSommelierView("events")}
                >
                  Voltar
                </button>

                <div className="card stack">
                  <Winner eventId={selectedEventId} />
                </div>

                <div className="card stack">
                  <div className="card-header">
                    <h2 className="h2">Ranking</h2>
                  </div>
                  <Ranking eventId={selectedEventId} />
                </div>


              </div>
            )}

          </div>
        </main>
      </div>
    );
  }

  /* ============================================================
   * PARTICIPANTE
   * ============================================================ */
  if (user.type === "participant") {
    
    return (
      <div className="app-shell">
        <header className="topbar">
          <div className="topbar-left">
            <div className="brand-dot" />
            <div>
              <div className="topbar-title">Degustação às Cegas</div>
              <div className="topbar-subtitle">
                Bem-vindo(a), {user.info.name}
              </div>
            </div>
          </div>

          <div className="topbar-right">
            {/* Desktop */}
            <button
              className="btn btn-outline btn-logout-desktop"
              onClick={() => {
                setMenuOpen(false);
                setUser(null);
              }}
            >
              Sair
            </button>

            {/* Mobile */}
            <button
              ref={hamburgerRef}
              className="hamburger"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menu"
            >
              ☰
            </button>
          </div>

          {menuOpen && (
            <div ref={menuRef} className="mobile-menu">
              <button
                className="mobile-menu-item"
                onClick={() => {
                  setMenuOpen(false);
                  setUser(null);
                }}
              >
                Sair
              </button>
            </div>
          )}
        </header>

        <main className="content">
          <div className="container stack">

            {eventIsOpen && (
              <Evaluation
                participantId={user.info.participant_id}
                eventId={user.info.event_id}
                initialIsAnswerKey={false}
                onEventClosed={() => setEventIsOpen(false)}
              />
            )}
  
            {/* Evento finalizado → Ranking + Winner + botão Ver Resultado */}
            {eventIsOpen === false && roundIds.length > 0 && !showResult && (
              <>
                <div className="card stack">
                  <Winner eventId={user.info.event_id} />
                </div>

                <div className="card stack">
                  <div className="card-header">
                    <h2 className="h2">Ranking</h2>
                  </div>
                  <Ranking eventId={user.info.event_id} />
                </div>

                <div className="stack" style={{ marginTop: "1rem" }}>
                  <button
                    className="btn btn-primary"
                    onClick={loadParticipantResults}
                  >
                    Ver Resultado
                  </button>
                </div>
              </>
            )}

            {loadingResult && (
              <div className="alert alert-info">
                Carregando resultados...
              </div>
            )}

            {resultError && (
              <div className="alert alert-error">
                {resultError}
              </div>
            )}


            {/* Tela de Resultado do Participante */}
            {showResult && participantResults.length > 0 && (
              <ParticipantResult
                results={participantResults}
                onBack={() => {setShowResult(false);
                  setParticipantResults([]);
                }}
              />
            )}
          </div>
        </main>
      </div>
    );
  }

  return null;
}
