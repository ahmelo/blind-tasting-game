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
                <div className="card-header">
                  <h1 className="h1">Menu</h1>
                  <p className="muted">Escolha uma ação para gerenciar ou participar com gabarito.</p>
                </div>

                <div className="menu-grid">
                  <button className="menu-card" onClick={() => setSommelierView("events")}>
                    <div className="menu-card-title">CRUD Evento</div>
                    <div className="menu-card-subtitle">Criar, editar e abrir/fechar eventos</div>
                  </button>

                  <button className="menu-card" onClick={() => setSommelierView("rounds")}>
                    <div className="menu-card-title">CRUD Round</div>
                    <div className="menu-card-subtitle">Gerenciar rounds e seus parâmetros</div>
                  </button>

                  <button className="menu-card" onClick={() => setSommelierView("gabarito")}>
                    <div className="menu-card-title">Gabarito</div>
                    <div className="menu-card-subtitle">Participar de evento como resposta oficial</div>
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
                    <p className="muted">Selecione um evento aberto para enviar o gabarito.</p>
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
                    <div className="field">
                      <label className="label" htmlFor="eventSelect">
                        Evento
                      </label>
                      <select
                        id="eventSelect"
                        className="select"
                        value={selectedEventId ?? ""}
                        onChange={(e) => setSelectedEventId(e.target.value)}
                      >
                        <option value="">-- selecione --</option>
                        {gabaritoEvents.map((ev) => (
                          <option key={ev.id} value={ev.id}>
                            {`${ev.name} (${ev.access_code})`}
                          </option>
                        ))}
                      </select>
                    </div>

                    {selectedEventId && (
                      <div className="card card-inset stack">
                        <h2 className="h2">Enviar gabarito</h2>
                        <SubmitVisual
                          participantId={user.info.participant_id}
                          eventId={selectedEventId}
                          initialIsAnswerKey={true}
                          lockAnswerKey={true}
                        />
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
              <div className="topbar-subtitle">Bem-vindo, {user.info.name}</div>
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
                <p className="muted">Preencha sua avaliação. Seus destaques e ações seguem o padrão do sistema.</p>
              </div>

              <SubmitVisual participantId={user.info.participant_id} eventId={user.info.event_id} />
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