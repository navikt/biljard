import { useState, useCallback, useMemo, useEffect, type KeyboardEvent, type MouseEvent } from 'react';
import { Button, Alert, Table, TextField, Heading, Tag, Modal } from '@navikt/ds-react';
import type { Tournament, Participant, Match } from '../lib/db';

interface Standing {
  participant: Participant;
  wins: number;
  losses: number;
  played: number;
}

interface TournamentAdminProps {
  tournament: Tournament;
  participants: Participant[];
  matches: Match[];
  standings: Standing[];
}

type TabId = 'info' | 'participants' | 'matches' | 'standings';
type MessageType = 'success' | 'error';

interface Message {
  type: MessageType;
  text: string;
}

interface TournamentApiResponse {
  tournament: Tournament;
  participants: Participant[];
  matches: Match[];
  standings: Standing[];
}

const STATUS_LABELS: Record<string, string> = {
  registration: 'Påmelding',
  active: 'Pågår',
  completed: 'Avsluttet',
};

const TYPE_LABELS: Record<string, string> = {
  'round-robin': 'Round Robin',
  'knockout': 'Utslagsturnering',
  'swiss': 'Swiss-system',
};

export default function TournamentAdmin({ 
  tournament: initialTournament, 
  participants: initialParticipants, 
  matches: initialMatches, 
  standings: initialStandings 
}: TournamentAdminProps) {
  const [tournament, setTournament] = useState(initialTournament);
  const [participants, setParticipants] = useState(initialParticipants);
  const [matches, setMatches] = useState(initialMatches);
  const [standings, setStandings] = useState(initialStandings);
  const [activeTab, setActiveTab] = useState<TabId>('info');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<Message | undefined>();
  const [editingMatch, setEditingMatch] = useState<Match | undefined>();
  const [matchScore1, setMatchScore1] = useState('');
  const [matchScore2, setMatchScore2] = useState('');

  const participantsMap = useMemo(() => 
    Object.fromEntries(participants.map(p => [p.id, p])),
    [participants]
  );

  const matchesByRound = useMemo(() => {
    const grouped: Record<number, Match[]> = {};
    for (const match of matches) {
      if (!grouped[match.round]) {
        grouped[match.round] = [];
      }
      grouped[match.round].push(match);
    }
    return grouped;
  }, [matches]);

  const clearMessage = useCallback(() => {
    setMessage(undefined);
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(clearMessage, 5000);
      return () => clearTimeout(timer);
    }
  }, [message, clearMessage]);

  const refreshData = useCallback(async () => {
    try {
      const response = await fetch(`/api/tournaments?id=${tournament.id}`);
      if (!response.ok) throw new Error('Failed to fetch');
      const data: TournamentApiResponse = await response.json();
      setTournament(data.tournament);
      setParticipants(data.participants);
      setMatches(data.matches);
      setStandings(data.standings);
    } catch {
      setMessage({ type: 'error', text: 'Kunne ikke oppdatere data' });
    }
  }, [tournament.id]);

  const updateStatus = useCallback(async (newStatus: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/tournaments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: tournament.id, status: newStatus })
      });

      if (response.ok) {
        await refreshData();
        setMessage({ type: 'success', text: `Status endret til "${STATUS_LABELS[newStatus] ?? newStatus}"` });
      } else {
        setMessage({ type: 'error', text: 'Kunne ikke endre status' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Noe gikk galt' });
    } finally {
      setLoading(false);
    }
  }, [tournament.id, refreshData]);

  const handleRemoveParticipant = useCallback(async (participantId: number) => {
    if (!window.confirm('Er du sikker på at du vil fjerne denne deltakeren?')) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/participants?id=${participantId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await refreshData();
        setMessage({ type: 'success', text: 'Deltaker fjernet' });
      } else {
        setMessage({ type: 'error', text: 'Kunne ikke fjerne deltaker' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Noe gikk galt' });
    } finally {
      setLoading(false);
    }
  }, [refreshData]);

  const openMatchEditor = useCallback((match: Match) => {
    setEditingMatch(match);
    setMatchScore1(match.player1_score?.toString() ?? '');
    setMatchScore2(match.player2_score?.toString() ?? '');
  }, []);

  const closeMatchEditor = useCallback(() => {
    setEditingMatch(undefined);
    setMatchScore1('');
    setMatchScore2('');
  }, []);

  const saveMatchResult = useCallback(async () => {
    if (!editingMatch) return;
    
    const score1 = parseInt(matchScore1);
    const score2 = parseInt(matchScore2);
    
    if (isNaN(score1) || isNaN(score2) || score1 < 0 || score2 < 0) {
      setMessage({ type: 'error', text: 'Ugyldig resultat - bruk positive tall' });
      return;
    }

    if (score1 === score2) {
      setMessage({ type: 'error', text: 'Kampen må ha en vinner (uavgjort ikke tillatt)' });
      return;
    }

    const winnerId = score1 > score2 ? editingMatch.player1_id : editingMatch.player2_id;
    
    setLoading(true);
    try {
      const response = await fetch('/api/matches', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingMatch.id,
          player1Score: score1,
          player2Score: score2,
          winnerId,
          playedAt: new Date().toISOString()
        })
      });

      if (response.ok) {
        await refreshData();
        closeMatchEditor();
        setMessage({ type: 'success', text: 'Resultat lagret' });
      } else {
        setMessage({ type: 'error', text: 'Kunne ikke lagre resultat' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Noe gikk galt' });
    } finally {
      setLoading(false);
    }
  }, [editingMatch, matchScore1, matchScore2, refreshData, closeMatchEditor]);

  const handleDeleteTournament = useCallback(async () => {
    if (!window.confirm('Er du sikker på at du vil slette denne turneringen? Dette kan ikke angres.')) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/tournaments?id=${tournament.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        window.location.href = '/admin';
      } else {
        setMessage({ type: 'error', text: 'Kunne ikke slette turnering' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Noe gikk galt' });
    } finally {
      setLoading(false);
    }
  }, [tournament.id]);

  const handleTabKeyDown = useCallback((e: KeyboardEvent<HTMLButtonElement>, tabId: TabId) => {
    const tabs: TabId[] = ['info', 'participants', 'matches', 'standings'];
    const currentIndex = tabs.indexOf(tabId);
    
    if (e.key === 'ArrowRight') {
      const nextIndex = (currentIndex + 1) % tabs.length;
      setActiveTab(tabs[nextIndex]);
    } else if (e.key === 'ArrowLeft') {
      const prevIndex = (currentIndex - 1 + tabs.length) % tabs.length;
      setActiveTab(tabs[prevIndex]);
    }
  }, []);

  const formatDate = (dateString: string | null, includeTime = false) => {
    if (!dateString) return '-';
    const options: Intl.DateTimeFormatOptions = includeTime 
      ? { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }
      : { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('nb-NO', options);
  };

  const completedMatches = matches.filter(m => m.winner_id !== null).length;
  const completionPercentage = matches.length > 0 
    ? Math.round((completedMatches / matches.length) * 100) 
    : 0;

  return (
    <div>
      {message && (
        <Alert 
          variant={message.type} 
          role="status"
          aria-live="polite"
          closeButton
          onClose={clearMessage}
          style={{ marginBottom: 'var(--a-spacing-4)' }}
        >
          {message.text}
        </Alert>
      )}

      <div 
        className="admin-tabs" 
        role="tablist" 
        aria-label="Administrer turnering"
      >
        {(['info', 'participants', 'matches', 'standings'] as const).map(tabId => (
          <button
            key={tabId}
            role="tab"
            aria-selected={activeTab === tabId}
            aria-controls={`panel-${tabId}`}
            id={`tab-${tabId}`}
            className={`admin-tab ${activeTab === tabId ? 'active' : ''}`}
            onClick={() => setActiveTab(tabId)}
            onKeyDown={(e) => handleTabKeyDown(e, tabId)}
          >
            {tabId === 'info' && 'Informasjon'}
            {tabId === 'participants' && `Deltakere (${participants.length})`}
            {tabId === 'matches' && `Kamper (${completedMatches}/${matches.length})`}
            {tabId === 'standings' && 'Tabell'}
          </button>
        ))}
      </div>

      <div
        role="tabpanel"
        id={`panel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
      >
        {activeTab === 'info' && (
          <div className="card">
            <Heading level="2" size="medium" spacing>Turneringsinformasjon</Heading>
            
            <dl className="info-list">
              <div className="info-row">
                <dt className="info-label">Navn</dt>
                <dd>{tournament.name}</dd>
              </div>
              <div className="info-row">
                <dt className="info-label">Beskrivelse</dt>
                <dd>{tournament.description || <span style={{ color: 'var(--a-text-subtle)' }}>Ingen beskrivelse</span>}</dd>
              </div>
              <div className="info-row">
                <dt className="info-label">Type</dt>
                <dd>{TYPE_LABELS[tournament.type] ?? tournament.type}</dd>
              </div>
              <div className="info-row">
                <dt className="info-label">Runder</dt>
                <dd>{tournament.rounds}</dd>
              </div>
              <div className="info-row">
                <dt className="info-label">Varighet per runde</dt>
                <dd>{tournament.round_duration_weeks} uker</dd>
              </div>
              <div className="info-row">
                <dt className="info-label">Påmeldingsfrist</dt>
                <dd>{formatDate(tournament.registration_deadline, true)}</dd>
              </div>
              <div className="info-row">
                <dt className="info-label">Oppstart</dt>
                <dd>{formatDate(tournament.start_date)}</dd>
              </div>
              {tournament.status === 'active' && matches.length > 0 && (
                <div className="info-row">
                  <dt className="info-label">Fremgang</dt>
                  <dd>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${completionPercentage}%` }}
                        role="progressbar"
                        aria-valuenow={completionPercentage}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      />
                    </div>
                    <span style={{ marginLeft: 'var(--a-spacing-2)' }}>
                      {completionPercentage}% ({completedMatches} av {matches.length} kamper)
                    </span>
                  </dd>
                </div>
              )}
            </dl>

            <Heading level="3" size="small" spacing style={{ marginTop: 'var(--a-spacing-6)' }}>
              Endre status
            </Heading>
            <div className="button-group">
              {tournament.status === 'registration' && (
                <Button 
                  variant="primary" 
                  onClick={() => updateStatus('active')}
                  loading={loading}
                  disabled={participants.length < 2}
                >
                  Start turnering
                </Button>
              )}
              {tournament.status === 'registration' && participants.length < 2 && (
                <p style={{ color: 'var(--a-text-subtle)', marginTop: 'var(--a-spacing-2)' }}>
                  Minst 2 deltakere kreves for å starte
                </p>
              )}
              {tournament.status === 'active' && (
                <Button 
                  variant="primary" 
                  onClick={() => updateStatus('completed')}
                  loading={loading}
                >
                  Avslutt turnering
                </Button>
              )}
              {tournament.status === 'completed' && (
                <Button 
                  variant="secondary" 
                  onClick={() => updateStatus('active')}
                  loading={loading}
                >
                  Gjenåpne turnering
                </Button>
              )}
            </div>

            <div style={{ 
              marginTop: 'var(--a-spacing-8)', 
              paddingTop: 'var(--a-spacing-4)', 
              borderTop: '1px solid var(--a-border-subtle)' 
            }}>
              <Heading level="3" size="small" spacing>Faresone</Heading>
              <Button variant="danger" onClick={handleDeleteTournament} loading={loading}>
                Slett turnering
              </Button>
            </div>
          </div>
        )}

        {activeTab === 'participants' && (
          <div className="card">
            <Heading level="2" size="medium" spacing>Deltakere</Heading>
            
            {participants.length > 0 ? (
              <div className="table-container">
                <Table>
                  <Table.Header>
                    <Table.Row>
                      <Table.HeaderCell scope="col">Navn</Table.HeaderCell>
                      <Table.HeaderCell scope="col">E-post</Table.HeaderCell>
                      <Table.HeaderCell scope="col">Slack</Table.HeaderCell>
                      <Table.HeaderCell scope="col">Registrert</Table.HeaderCell>
                      <Table.HeaderCell scope="col">
                        <span className="visually-hidden">Handlinger</span>
                      </Table.HeaderCell>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {participants.map(p => (
                      <Table.Row key={p.id}>
                        <Table.DataCell>{p.name}</Table.DataCell>
                        <Table.DataCell>{p.email}</Table.DataCell>
                        <Table.DataCell>{p.slack_handle ?? '-'}</Table.DataCell>
                        <Table.DataCell>{formatDate(p.registered_at)}</Table.DataCell>
                        <Table.DataCell>
                          <Button 
                            variant="tertiary-neutral" 
                            size="small" 
                            onClick={() => handleRemoveParticipant(p.id)}
                            aria-label={`Fjern ${p.name}`}
                          >
                            Fjern
                          </Button>
                        </Table.DataCell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table>
              </div>
            ) : (
              <p style={{ color: 'var(--a-text-subtle)' }}>
                Ingen deltakere registrert ennå.
              </p>
            )}
          </div>
        )}

        {activeTab === 'matches' && (
          <div className="card">
            <Heading level="2" size="medium" spacing>Kamper</Heading>
            
            {Object.keys(matchesByRound).length > 0 ? (
              Object.entries(matchesByRound).map(([round, roundMatches]) => {
                const roundCompleted = roundMatches.filter(m => m.winner_id !== null).length;
                return (
                  <div key={round} style={{ marginBottom: 'var(--a-spacing-6)' }}>
                    <Heading level="3" size="small" spacing>
                      Runde {round}
                      <Tag 
                        variant={roundCompleted === roundMatches.length ? 'success' : 'warning'} 
                        size="small"
                        style={{ marginLeft: 'var(--a-spacing-2)' }}
                      >
                        {roundCompleted}/{roundMatches.length}
                      </Tag>
                    </Heading>
                    <div className="table-container">
                      <Table size="small">
                        <Table.Header>
                          <Table.Row>
                            <Table.HeaderCell scope="col">Spiller 1</Table.HeaderCell>
                            <Table.HeaderCell scope="col">Spiller 2</Table.HeaderCell>
                            <Table.HeaderCell scope="col">Resultat</Table.HeaderCell>
                            <Table.HeaderCell scope="col">
                              <span className="visually-hidden">Handlinger</span>
                            </Table.HeaderCell>
                          </Table.Row>
                        </Table.Header>
                        <Table.Body>
                          {roundMatches.map(match => {
                            const player1 = participantsMap[match.player1_id];
                            const player2 = participantsMap[match.player2_id];
                            const isPlayer1Winner = match.winner_id === match.player1_id;
                            const isPlayer2Winner = match.winner_id === match.player2_id;
                            
                            return (
                              <Table.Row key={match.id}>
                                <Table.DataCell>
                                  <span style={{ 
                                    fontWeight: isPlayer1Winner ? 'bold' : 'normal',
                                    color: isPlayer1Winner ? 'var(--a-text-success)' : undefined
                                  }}>
                                    {player1?.name ?? 'Ukjent'}
                                    {isPlayer1Winner && ' 🏆'}
                                  </span>
                                </Table.DataCell>
                                <Table.DataCell>
                                  <span style={{ 
                                    fontWeight: isPlayer2Winner ? 'bold' : 'normal',
                                    color: isPlayer2Winner ? 'var(--a-text-success)' : undefined
                                  }}>
                                    {player2?.name ?? 'Ukjent'}
                                    {isPlayer2Winner && ' 🏆'}
                                  </span>
                                </Table.DataCell>
                                <Table.DataCell>
                                  {match.winner_id !== null ? (
                                    <Tag variant="success" size="small">
                                      {match.player1_score} - {match.player2_score}
                                    </Tag>
                                  ) : (
                                    <Tag variant="neutral" size="small">Ikke spilt</Tag>
                                  )}
                                </Table.DataCell>
                                <Table.DataCell>
                                  <Button 
                                    variant="tertiary" 
                                    size="small"
                                    onClick={() => openMatchEditor(match)}
                                    aria-label={`${match.winner_id !== null ? 'Endre' : 'Registrer'} resultat for ${player1?.name} vs ${player2?.name}`}
                                  >
                                    {match.winner_id !== null ? 'Endre' : 'Registrer'}
                                  </Button>
                                </Table.DataCell>
                              </Table.Row>
                            );
                          })}
                        </Table.Body>
                      </Table>
                    </div>
                  </div>
                );
              })
            ) : (
              <p style={{ color: 'var(--a-text-subtle)' }}>
                Ingen kamper generert. Start turneringen for å generere kamper.
              </p>
            )}
          </div>
        )}

        {activeTab === 'standings' && (
          <div className="card">
            <Heading level="2" size="medium" spacing>Tabell</Heading>
            
            {standings.length > 0 ? (
              <div className="table-container">
                <Table>
                  <Table.Header>
                    <Table.Row>
                      <Table.HeaderCell scope="col">#</Table.HeaderCell>
                      <Table.HeaderCell scope="col">Spiller</Table.HeaderCell>
                      <Table.HeaderCell scope="col">Spilt</Table.HeaderCell>
                      <Table.HeaderCell scope="col">Seire</Table.HeaderCell>
                      <Table.HeaderCell scope="col">Tap</Table.HeaderCell>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {standings.map((standing, index) => (
                      <Table.Row key={standing.participant.id}>
                        <Table.DataCell>
                          {index === 0 && '🥇 '}
                          {index === 1 && '🥈 '}
                          {index === 2 && '🥉 '}
                          {index + 1}
                        </Table.DataCell>
                        <Table.DataCell style={{ fontWeight: index < 3 ? 'bold' : undefined }}>
                          {standing.participant.name}
                        </Table.DataCell>
                        <Table.DataCell>{standing.played}</Table.DataCell>
                        <Table.DataCell style={{ color: 'var(--a-text-success)' }}>
                          {standing.wins}
                        </Table.DataCell>
                        <Table.DataCell style={{ color: standing.losses > 0 ? 'var(--a-text-danger)' : undefined }}>
                          {standing.losses}
                        </Table.DataCell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table>
              </div>
            ) : (
              <p style={{ color: 'var(--a-text-subtle)' }}>
                Ingen resultater ennå.
              </p>
            )}
          </div>
        )}
      </div>

      <Modal 
        open={editingMatch !== undefined} 
        onClose={closeMatchEditor}
        aria-labelledby="modal-heading"
      >
        <Modal.Header closeButton>
          <Heading level="2" size="medium" id="modal-heading">
            Registrer resultat
          </Heading>
        </Modal.Header>
        <Modal.Body>
          {editingMatch && (
            <>
              <p style={{ marginBottom: 'var(--a-spacing-4)' }}>
                <strong>
                  {participantsMap[editingMatch.player1_id]?.name ?? 'Spiller 1'}
                </strong>
                {' vs '}
                <strong>
                  {participantsMap[editingMatch.player2_id]?.name ?? 'Spiller 2'}
                </strong>
              </p>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: 'var(--a-spacing-4)', 
                marginBottom: 'var(--a-spacing-4)' 
              }}>
                <TextField
                  label={participantsMap[editingMatch.player1_id]?.name ?? 'Spiller 1'}
                  type="number"
                  value={matchScore1}
                  onChange={(e) => setMatchScore1(e.target.value)}
                  min="0"
                  autoFocus
                />
                <TextField
                  label={participantsMap[editingMatch.player2_id]?.name ?? 'Spiller 2'}
                  type="number"
                  value={matchScore2}
                  onChange={(e) => setMatchScore2(e.target.value)}
                  min="0"
                />
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={saveMatchResult} loading={loading}>
            Lagre
          </Button>
          <Button variant="tertiary" onClick={closeMatchEditor}>
            Avbryt
          </Button>
        </Modal.Footer>
      </Modal>

      <style>{`
        .admin-tabs {
          display: flex;
          gap: var(--a-spacing-1);
          border-bottom: 1px solid var(--a-border-subtle);
          margin-bottom: var(--a-spacing-6);
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }

        .admin-tab {
          padding: var(--a-spacing-3) var(--a-spacing-4);
          background: none;
          border: none;
          border-bottom: 3px solid transparent;
          cursor: pointer;
          font-size: var(--a-font-size-medium);
          color: var(--a-text-subtle);
          white-space: nowrap;
          transition: color 0.2s, border-color 0.2s;
        }

        .admin-tab:hover {
          color: var(--a-text-default);
        }

        .admin-tab:focus-visible {
          outline: 2px solid var(--a-border-focus);
          outline-offset: -2px;
        }

        .admin-tab.active {
          color: var(--a-text-action);
          border-bottom-color: var(--a-border-action);
          font-weight: bold;
        }

        .info-list {
          display: flex;
          flex-direction: column;
          gap: var(--a-spacing-3);
          margin: 0;
        }

        .info-row {
          display: flex;
          flex-wrap: wrap;
          gap: var(--a-spacing-2) var(--a-spacing-4);
        }

        .info-label {
          font-weight: bold;
          min-width: 150px;
          color: var(--a-text-subtle);
        }

        .info-row dd {
          margin: 0;
          flex: 1;
          min-width: 200px;
        }

        .progress-bar {
          display: inline-block;
          width: 120px;
          height: 8px;
          background: var(--a-surface-subtle);
          border-radius: var(--a-border-radius-full);
          overflow: hidden;
          vertical-align: middle;
        }

        .progress-fill {
          height: 100%;
          background: var(--a-surface-success);
          transition: width 0.3s ease;
        }

        .visually-hidden {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }

        @media (max-width: 640px) {
          .info-row {
            flex-direction: column;
            gap: var(--a-spacing-1);
          }

          .info-label {
            min-width: unset;
          }
        }
      `}</style>
    </div>
  );
}
