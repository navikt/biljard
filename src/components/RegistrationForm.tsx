import { useState, useCallback, type FormEvent, type ChangeEvent } from 'react';
import { TextField, Button, Alert, ConfirmationPanel } from '@navikt/ds-react';

interface RegistrationFormProps {
  tournamentId: number;
}

interface FormState {
  name: string;
  email: string;
  slackHandle: string;
}

interface ApiResponse {
  success?: boolean;
  error?: string;
  participantId?: number;
}

const initialFormState: FormState = {
  name: '',
  email: '',
  slackHandle: '',
};

export default function RegistrationForm({ tournamentId }: RegistrationFormProps) {
  const [formData, setFormData] = useState<FormState>(initialFormState);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [confirmed, setConfirmed] = useState(false);

  const handleChange = useCallback((field: keyof FormState) => (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    if (error) setError(undefined);
  }, [error]);

  const handleSubmit = useCallback(async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!confirmed) {
      setError('Du må bekrefte at du har lest informasjonen');
      return;
    }

    setLoading(true);
    setError(undefined);

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tournamentId,
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          slackHandle: formData.slackHandle.trim() || undefined
        })
      });

      const data: ApiResponse = await response.json();

      if (response.ok && data.success) {
        setSuccess(true);
        setFormData(initialFormState);
        setConfirmed(false);
      } else {
        setError(data.error ?? 'Noe gikk galt. Prøv igjen.');
      }
    } catch {
      setError('Kunne ikke koble til serveren. Prøv igjen senere.');
    } finally {
      setLoading(false);
    }
  }, [tournamentId, formData, confirmed]);

  if (success) {
    return (
      <Alert variant="success" role="status" aria-live="polite">
        <strong>Du er nå påmeldt turneringen!</strong>
        <p>Du vil motta informasjon på e-post og kan følge med i #biljard på Slack.</p>
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card" aria-label="Påmeldingsskjema">
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
          label="Navn"
          value={formData.name}
          onChange={handleChange('name')}
          required
          autoComplete="name"
          aria-describedby="name-hint"
        />
      </div>

      <div className="form-group">
        <TextField
          label="E-post"
          type="email"
          value={formData.email}
          onChange={handleChange('email')}
          required
          autoComplete="email"
          description="Vi sender kampinformasjon til denne adressen"
        />
      </div>

      <div className="form-group">
        <TextField
          label="Slack-brukernavn"
          description="Valgfritt, men anbefalt. F.eks. jonas.nicolaysen"
          value={formData.slackHandle}
          onChange={handleChange('slackHandle')}
          autoComplete="off"
        />
      </div>

      <div className="form-group">
        <ConfirmationPanel
          checked={confirmed}
          onChange={() => setConfirmed(prev => !prev)}
          label="Jeg bekrefter at jeg kan delta i turneringen"
        >
          <ul style={{ margin: 0, paddingLeft: 'var(--a-spacing-5)' }}>
            <li>Jeg vil følge med på #biljard i Slack</li>
            <li>Jeg vil avtale kamptider med motstanderne mine</li>
            <li>Jeg forstår at turneringen strekker seg over flere uker</li>
          </ul>
        </ConfirmationPanel>
      </div>

      <Button 
        type="submit" 
        loading={loading}
        disabled={!confirmed}
      >
        Meld meg på
      </Button>
    </form>
  );
}
