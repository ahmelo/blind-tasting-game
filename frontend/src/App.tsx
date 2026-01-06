import { useState, useEffect } from "react";
import Login from "./pages/Login";
import SubmitVisual from "./pages/SubmitVisual";
import Ranking from "./pages/Ranking";
import Winner from "./pages/Winner";
import Events from "./pages/Events";
import Rounds from "./pages/Rounds";
import { apiGet } from "./api/client";

type UserType = "sommelier" | "participant" | null;

export default function App() {
  const [user, setUser] = useState<{ type: UserType; info: any } | null>(null);
  const [sommelierView, setSommelierView] = useState<'menu' | 'events' | 'rounds' | 'gabarito'>('menu');

  // estados para gabarito (sommelier)
  const [gabaritoEvents, setGabaritoEvents] = useState<Array<{ id: string; name: string; access_code: string; is_open: boolean }>>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOpenEvents() {
      if (sommelierView !== 'gabarito') return;
      try {
        const events = await apiGet<any[]>('/events');
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
      <div>
        {sommelierView === 'menu' ? (
          <div>
            <h1>Menu Sommelier</h1>
            <button onClick={() => setSommelierView('events')}>CRUD Evento</button>
            <button onClick={() => setSommelierView('rounds')}>CRUD Round</button>
            <button onClick={() => setSommelierView('gabarito')}>Participar de evento (gabarito)</button>
            <button onClick={() => setUser(null)}>Sair</button>
          </div>
        ) : sommelierView === 'events' ? (
          <Events onBack={() => setSommelierView('menu')} />
        ) : sommelierView === 'rounds' ? (
          <Rounds onBack={() => setSommelierView('menu')} />
        ) : (
          <div>
            <h1>Gabarito (sommelier)</h1>
            <button onClick={() => setSommelierView('menu')}>Voltar</button>

            {gabaritoEvents.length === 0 ? (
              <p>Nenhum evento aberto no momento.</p>
            ) : (
              <div style={{ marginTop: 12, display: 'grid', gap: 12 }}>
                <label>
                  Evento
                  <select value={selectedEventId ?? ''} onChange={(e) => setSelectedEventId(e.target.value)}>
                    <option value="">-- selecione --</option>
                    {gabaritoEvents.map((ev) => (
                      <option key={ev.id} value={ev.id}>{`${ev.name} (${ev.access_code})`}</option>
                    ))}
                  </select>
                </label>

                {selectedEventId && (
                  <div>
                    <h2>Enviar gabarito para o evento selecionado</h2>
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
    );
  }

  if (user.type === "participant") {
    return (
      <div>
        <h1>Bem-vindo, {user.info.name}</h1>
        <SubmitVisual participantId={user.info.participant_id} eventId={user.info.event_id} />
        <Ranking eventId={user.info.event_id} />
        <Winner eventId={user.info.event_id} />
      </div>
    );
  }

  return null;
}
