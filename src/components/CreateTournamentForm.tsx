import { useState, useCallback, type FormEvent, type ChangeEvent } from 'react';
import { TextField, Button, Alert, Select, Textarea } from '@navikt/ds-react';

type TournamentType = 'round-robin' | 'knockout' | 'swiss';

interface FormState {
  name: string;
  description: string;
  type: TournamentType;
  rounds: string;
  roundDurationWeeks: string;
  registrationDeadline: string;
  startDate: string;
}

interface ApiResponse {
  success?: boolean;
  error?: string;
  tournamentId?: number;
}

const initialFormState: FormState = {
  name: '',
  description: '',
  type: 'round-robin',
  rounds: '10',
  roundDurationWeeks: '2',
  registrationDeadline: '',
  startDate: '',
};

const tournamentTypeDescriptions: Record<TournamentType, string> = {
  'round-robin': 'Alle spiller mot alle over flere runder. Best for sosiale turneringer.',
  'knockout': 'Tap én kamp og du er ute. Best for korte, intensive turneringer.',
  'swiss': 'Spillere med lik poengsum møtes. God balanse mellom lengde og rettferdighet.',
};

export default function CreateTournamentForm() {
  const [formData, setFormData] = useState<FormState>(initialFormState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState(false);

  const handleChange = useCallback(<K extends keyof FormState>(field: K) => (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value as FormState[K] }));
    if (error) setError(undefined);
  }, [error]);

  const validateForm = useCallback((): string | undefined => {
    if (!formData.name.trim()) {
      return 'Turneringsnavn er påkrevd';
    }
    const rounds = parseInt(formData.rounds);
    if (isNaN(rounds) || rounds < 1 || rounds > 20) {
      return 'Antall runder må være mellom 1 og 20';
    }
    const weeks = parseInt(formData.roundDurationWeeks);
    if (isNaN(weeks) || weeks < 1 || weeks > 4) {
      return 'Uker per runde må være mellom 1 og 4';
    }
    return undefined;
  }, [formData]);

  const handleSubmit = useCallback(async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(undefined);

    try {
      const response = await fetch('/api/tournaments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          type: formData.type,
          rounds: parseInt(formData.rounds),
          roundDurationWeeks: parseInt(formData.roundDurationWeeks),
          registrationDeadline: formData.registrationDeadline || undefined,
          startDate: formData.startDate || undefined
        })
      });

      const data: ApiResponse = await response.json();

      if (response.ok && data.tournamentId) {
        setSuccess(true);
        setTimeout(() => {
          window.location.href = `/admin/turnering/${data.tournamentId}`;
        }, 1000);
      } else {
        setError(data.error ?? 'Noe gikk galt');
      }
    } catch {
      setError('Kunne ikke koble til serveren. Prøv igjen senere.');
    } finally {
      setLoading(false);
    }
  }, [formData, validateForm]);

  if (success) {
    return (
      <Alert variant="success" role="status" aria-live="polite">
        Turneringen er opprettet! Du blir videresendt...
      </Alert>
    );
  }

  const totalWeeks = parseInt(formData.rounds) * parseInt(formData.roundDurationWeeks);
  const estimatedDuration = !isNaN(totalWeeks) ? `ca. ${totalWeeks} uker` : '';

  return (
    <form 
      onSubmit={handleSubmit} 
      className="card" 
      style={{ maxWidth: '600px' }}
      aria-label="Opprett turnering"
    >
      {error && (
        <Alert 
          variant="error" 
          role="alert"
          aria-live="assertive"
          style={{ marginBottom: 'var(--a-spacing-4)' }}
        >
          {error}
        </Alert>
      )}

      <div className="form-group">
        <TextField
          label="Turneringsnavn"
          value={formData.name}
          onChange={handleChange('name')}
          placeholder="F.eks. Vårens biljardturnering 2026"
        />
      </div>

      <div className="form-group">
        <Textarea
          label="Beskrivelse"
          description="Informasjon som vises til deltakerne"
          value={formData.description}
          onChange={handleChange('description')}
          placeholder="Beskriv turneringen, regler, premier osv..."
          maxRows={5}
        />
      </div>

      <div className="form-group">
        <Select
          label="Turneringstype"
          value={formData.type}
          onChange={handleChange('type')}
          description={tournamentTypeDescriptions[formData.type]}
        >
          <option value="round-robin">Round Robin (alle mot alle)</option>
          <option value="knockout">Utslagsturnering</option>
          <option value="swiss">Swiss-system</option>
        </Select>
      </div>

      <fieldset style={{ 
        border: 'none', 
        padding: 0, 
        margin: 0,
        marginBottom: 'var(--a-spacing-4)'
      }}>
        <legend style={{ 
          fontWeight: 'var(--a-font-weight-bold)',
          marginBottom: 'var(--a-spacing-2)'
        }}>
          Turneringslengde
          {estimatedDuration && (
            <span style={{ 
              fontWeight: 'normal', 
              color: 'var(--a-text-subtle)',
              marginLeft: 'var(--a-spacing-2)'
            }}>
              ({estimatedDuration})
            </span>
          )}
        </legend>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
          gap: 'var(--a-spacing-4)' 
        }}>
          <TextField
            label="Antall runder"
            type="number"
            value={formData.rounds}
            onChange={handleChange('rounds')}
            min="1"
            max="20"
          />
          <TextField
            label="Uker per runde"
            type="number"
            value={formData.roundDurationWeeks}
            onChange={handleChange('roundDurationWeeks')}
            min="1"
            max="4"
          />
        </div>
      </fieldset>

      <div className="form-group">
        <TextField
          label="Påmeldingsfrist"
          description="Når påmeldingen stenger"
          type="datetime-local"
          value={formData.registrationDeadline}
          onChange={handleChange('registrationDeadline')}
        />
      </div>

      <div className="form-group">
        <TextField
          label="Oppstartsdato"
          description="Når første runde starter"
          type="date"
          value={formData.startDate}
          onChange={handleChange('startDate')}
        />
      </div>

      <div className="button-group">
        <Button type="submit" loading={loading}>
          Opprett turnering
        </Button>
        <Button variant="tertiary" type="button" as="a" href="/admin">
          Avbryt
        </Button>
      </div>
    </form>
  );
}
