import { useState, useEffect } from "react";
import Login from "./pages/Login";
import SubmitVisual from "./pages/SubmitVisual";
import Ranking from "./pages/Ranking";
import Winner from "./pages/Winner";
import Events from "./pages/Events";
import Rounds from "./pages/Rounds";
import { apiGet } from "./api/client";
import "./styles/ui.css";

type UserType = "sommelier" | "participant" | null;

export default function App() {
  const [user, setUser] = useState<{ type: UserType; info: any } | null>(null);
  const [sommelierView, setSommelierView] = useState<"menu" | "events" | "rounds" | "gabarito">("menu");

  // estados para gabarito (sommelier)
  const [gabaritoEvents, setGabaritoEvents] = useState<
    Array<{ id: string; name: string; access_code: string; is_open: boolean }>
  >([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOpenEvents() {
      if (sommelierView !== "gabarito") return;
      try {
        const events = await apiGet<any[]>("/events");
        setGabaritoEvents(events.filter((e) => e.is_open));
      } catch (err) {
        setGabaritoEvents([]);
      }
    }

    fetchOpenEvents();
  }, [sommelierView]);

  if (!user) {
    return <Login onLogin={(type, info) => setUser({ type, info })} />;
  }

  if (user.type === "sommelier") {
    return (
      <div className="app-shell">
        <header className="topbar">
          <div className="topbar-left">
            <div className="brand-dot" aria-hidden="true" />
            <div className="topbar-titles">
              <div className="topbar-title">Savoir-Vin</div>
              <div className="topbar-subtitle">Painel do Sommelier</div>
            </div>
          </div>

          <div className="topbar-right">
            <button className="btn btn-outline" onClick={() => setUser(null)}>
              Sair
            </button>
          </div>
        </header>

        <main className="content">
          <div className="container">
            {sommelierView === "menu" ? (
              <div className="card stack">
                <div className="menu-list">
                <button type="button" className="menu-item" onClick={() => setSommelierView("events")}>
                  <span className="menu-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24"><path d="M7 2a1 1 0 0 1 1 1v1h8V3a1 1 0 1 1 2 0v1h1a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h1V3a1 1 0 0 1 1-1Zm13 8H4v9a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-9Z"/></svg>
                  </span>
                  <span className="menu-text">
                    <span className="menu-title">Evento</span>
                    <span className="menu-desc">Criar, editar e abrir/fechar eventos</span>
                  </span>
                  <span className="menu-chevron" aria-hidden="true">›</span>
                </button>

                <button type="button" className="menu-item" onClick={() => setSommelierView("rounds")}>
                  <span className="menu-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24"><path d="M4 6a3 3 0 0 1 3-3h3a3 3 0 0 1 3 3v3a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V6Zm11 9a3 3 0 0 1 3-3h1a3 3 0 0 1 3 3v1a3 3 0 0 1-3 3h-1a3 3 0 0 1-3-3v-1ZM4 15a3 3 0 0 1 3-3h1a3 3 0 0 1 3 3v1a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-1Zm11-9a3 3 0 0 1 3-3h1a3 3 0 0 1 3 3v1a3 3 0 0 1-3 3h-1a3 3 0 0 1-3-3V6Z"/></svg>
                  </span>
                  <span className="menu-text">
                    <span className="menu-title">Round</span>
                    <span className="menu-desc">Gerenciar rounds e seus parâmetros</span>
                  </span>
                  <span className="menu-chevron" aria-hidden="true">›</span>
                </button>

                <button type="button" className="menu-item" onClick={() => setSommelierView("gabarito")}>
                  <span className="menu-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24"><path d="M9 11a1 1 0 0 1 1.707-.707l1.293 1.293 3.293-3.293A1 1 0 1 1 16.707 9l-4 4A1 1 0 0 1 11.293 13l-2-2A1 1 0 0 1 9 11Zm3-9a9 9 0 1 1 0 18A9 9 0 0 1 12 2Z"/></svg>
                  </span>
                  <span className="menu-text">
                    <span className="menu-title">Gabarito</span>
                    <span className="menu-desc">Participar de evento como resposta oficial</span>
                  </span>
                  <span className="menu-chevron" aria-hidden="true">›</span>
                </button>
              </div>
              </div>
            ) : sommelierView === "events" ? (
              <div className="stack">
                <div className="page-actions">
                  <button className="btn btn-ghost" onClick={() => setSommelierView("menu")}>
                    Voltar
                  </button>
                </div>
                <Events onBack={() => setSommelierView("menu")} />
              </div>
            ) : sommelierView === "rounds" ? (
              <div className="stack">
                <div className="page-actions">
                  <button className="btn btn-ghost" onClick={() => setSommelierView("menu")}>
                    Voltar
                  </button>
                </div>
                <Rounds onBack={() => setSommelierView("menu")} />
              </div>
            ) : (
              <div className="card stack">
                <div className="card-header row-between">
                  <div>
                    <h1 className="h1">Gabarito</h1>
                  </div>

                  <button className="btn btn-ghost" onClick={() => setSommelierView("menu")}>
                    Voltar
                  </button>
                </div>

                {gabaritoEvents.length === 0 ? (
                  <div className="empty">
                    <div className="empty-title">Nenhum evento aberto no momento.</div>
                    <div className="empty-subtitle">Abra um evento no CRUD de Eventos para habilitar o gabarito.</div>
                  </div>
                ) : (
                  <div className="stack">
                  {!selectedEventId ? (
                    <div className="menu-list">
                      {gabaritoEvents.map((ev) => (
                        <button
                          key={ev.id}
                          type="button"
                          className="menu-item"
                          onClick={() => setSelectedEventId(ev.id)}
                        >
                          <span className="menu-icon" aria-hidden="true">
                            <svg viewBox="0 0 24 24">
                              <path d="M12 2a4 4 0 0 1 4 4v2h1a3 3 0 0 1 3 3v7a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-7a3 3 0 0 1 3-3h1V6a4 4 0 0 1 4-4Zm2 6V6a2 2 0 1 0-4 0v2h4Z" />
                            </svg>
                          </span>

                          <span className="menu-text">
                            <span className="menu-title">{ev.name}</span>
                            <span className="menu-desc">Código: {ev.access_code}</span>
                          </span>

                          <span className="menu-chevron" aria-hidden="true">
                            ›
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="stack">
                      <div className="row-between">
                        <div className="menu-selected">
                          <div className="menu-selected__title">Evento selecionado</div>
                          <div className="menu-selected__subtitle">
                            {gabaritoEvents.find((e) => e.id === selectedEventId)?.name ?? "Evento"}
                          </div>
                        </div>

                        <button type="button" className="btn btn-ghost" onClick={() => setSelectedEventId(null)}>
                          Trocar
                        </button>
                      </div>

                      <div className="card card-inset stack">
                        <h2 className="h2">Enviar gabarito</h2>
                        <SubmitVisual
                          participantId={user.info.participant_id}
                          eventId={selectedEventId}
                          initialIsAnswerKey={true}
                        />
                      </div>
                    </div>
                  )}
                </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  if (user.type === "participant") {
    return (
      <div className="app-shell">
        <header className="topbar">
          <div className="topbar-left">
            <div className="brand-dot" aria-hidden="true" />
            <div className="topbar-titles">
              <div className="topbar-title">Degustação às Cegas</div>
              <div className="topbar-subtitle">Bem-vindo(a), {user.info.name}</div>
            </div>
          </div>

          <div className="topbar-right">
            <button className="btn btn-outline" onClick={() => setUser(null)}>
              Sair
            </button>
          </div>
        </header>

        <main className="content">
          <div className="container stack">
            <div className="card stack">
              <div className="card-header">
                <h1 className="h1">Avaliação Visual</h1>
              </div>
              <SubmitVisual participantId={user.info.participant_id} eventId={user.info.event_id} initialIsAnswerKey={false} />
            </div>

            <div className="card stack">
              <div className="card-header">
                <h2 className="h2">Ranking</h2>
              </div>
              <Ranking eventId={user.info.event_id} />
            </div>

            <div className="card stack">
              <div className="card-header">
                <h2 className="h2">Vencedor</h2>
              </div>
              <Winner eventId={user.info.event_id} />
            </div>
          </div>
        </main>
      </div>
    );
  }

  return null;
}