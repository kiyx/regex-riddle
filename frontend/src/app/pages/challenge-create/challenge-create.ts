import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ToastService } from '../../components/toast/toast.service';
import { ApiService } from '../../services/api.service';

interface Step
{
  id: number;
  label: string;
}

@Component({
  selector: 'app-challenge-create',
  templateUrl: './challenge-create.html',
  styleUrls: ['./challenge-create.css'],
  imports: [RouterLink, FormsModule],
})
export class ChallengeCreatePage
{
  private readonly router = inject(Router);
  private readonly api = inject(ApiService);
  private readonly toast = inject(ToastService);

  readonly steps: Step[] = [
    { id: 0, label: 'Info' },
    { id: 1, label: 'Regex' },
    { id: 2, label: 'Esempi' },
    { id: 3, label: 'Controlli' },
  ];
  readonly currentStep = signal(0);

  readonly title = signal('');
  readonly description = signal('');
  readonly regex = signal('');
  readonly positiveExample = signal('');
  readonly negativeExample = signal('');
  readonly positiveControls = signal<string[]>(['']);
  readonly negativeControls = signal<string[]>(['']);

  readonly submitting = signal(false);
  readonly error = signal('');
  readonly success = signal(false);

  nextStep(): void
  {
    const step = this.currentStep();
    this.error.set('');

    if (step === 0)
    {
      const title = this.title().trim();
      if (!title)
      {
        const msg = 'Inserisci un titolo per la sfida';
        this.error.set(msg);
        this.toast.show(msg, 'warning');
        return;
      }
      if (title.length < 2)
      {
        const msg = 'Il titolo deve avere almeno 2 caratteri';
        this.error.set(msg);
        this.toast.show(msg, 'warning');
        return;
      }
    }

    if (step === 1)
    {
      const regex = this.regex().trim();
      if (!regex)
      {
        const msg = 'Inserisci la regex segreta';
        this.error.set(msg);
        this.toast.show(msg, 'warning');
        return;
      }
      const regexError = this.validateRegexStep();
      if (regexError)
      {
        this.error.set(regexError);
        this.toast.show(regexError, 'warning');
        return;
      }
    }

    if (step === 2)
    {
      const posEx = this.positiveExample().trim();
      const negEx = this.negativeExample().trim();
      if (!posEx || !negEx)
      {
        const msg = 'Inserisci entrambi gli esempi pubblici';
        this.error.set(msg);
        this.toast.show(msg, 'warning');
        return;
      }
      const exampleError = this.validateExamples();
      if (exampleError)
      {
        this.error.set(exampleError);
        this.toast.show(exampleError, 'warning');
        return;
      }
    }

    if (step === 3)
    {
      const pos = this.positiveControls().filter((l) => l.trim());
      const neg = this.negativeControls().filter((l) => l.trim());
      if (pos.length === 0 || neg.length === 0)
      {
        const msg = 'Inserisci almeno una stringa di controllo per tipo';
        this.error.set(msg);
        this.toast.show(msg, 'warning');
        return;
      }
      const ctrlError = this.validateControls();
      if (ctrlError)
      {
        this.error.set(ctrlError);
        this.toast.show(ctrlError, 'warning');
        return;
      }
    }

    if (step < this.steps.length - 1)
    {
      this.currentStep.update((s) => s + 1);
    }
  }

  prevStep(): void
  {
    if (this.currentStep() > 0)
    {
      this.currentStep.update((s) => s - 1);
    }
  }

  private validateRegexSyntax(): string | null
  {
    const re = this.regex().trim();
    if (re.includes('(?<=') || re.includes('(?<!'))
      return 'La regex contiene lookbehind: il backend usa RE2 che non li supporta.';
    if (re.includes('(?(1)') || re.includes('(?(group)'))
      return 'La regex contiene conditional groups: RE2 non li supporta.';
    if (re.includes('\\k<') || re.includes('\\k\''))
      return 'La regex contiene named backreferences: RE2 non le supporta.';
    try { new RegExp(re); }
    catch { return 'La regex segreta non è valida'; }
    return null;
  }

  private validateRegexStep(): string | null
  {
    return this.validateRegexSyntax();
  }

  private validateExamples(): string | null
  {
    const syntax = this.validateRegexSyntax();
    if (syntax) return syntax;
    try
    {
      const r = new RegExp(this.regex().trim());
      const pos = this.positiveExample().trim();
      if (!r.test(pos))
        return `L'esempio positivo "${pos}" NON matcha la regex: deve essere accettato`;
      const neg = this.negativeExample().trim();
      if (r.test(neg))
        return `L'esempio negativo "${neg}" matcha la regex: deve essere rifiutato`;
      return null;
    }
    catch { return 'La regex segreta non è valida'; }
  }

  private validateControls(): string | null
  {
    const syntax = this.validateRegexSyntax();
    if (syntax) return syntax;
    try
    {
      const r = new RegExp(this.regex().trim());
      const posCtrl = this.positiveControls().filter((l) => l.trim());
      for (const s of posCtrl)
        if (!r.test(s))
          return `Stringa di controllo positiva "${s}" non matcha la regex`;
      const negCtrl = this.negativeControls().filter((l) => l.trim());
      for (const s of negCtrl)
        if (r.test(s))
          return `Stringa di controllo negativa "${s}" matcha la regex`;
      return null;
    }
    catch { return 'La regex segreta non è valida'; }
  }

  private validateRegex(): string | null
  {
    const err = this.validateRegexSyntax();
    if (err) return err;
    const ex = this.validateExamples();
    if (ex) return ex;
    return this.validateControls();
  }

  submit(): void
  {
    const pos = this.positiveControls().filter((l) => l.trim());
    const neg = this.negativeControls().filter((l) => l.trim());

    if (!this.title().trim())
    {
      this.error.set('Titolo obbligatorio');
      this.currentStep.set(0);
      return;
    }
    if (!this.regex().trim())
    {
      this.error.set('Inserisci la regex segreta');
      this.currentStep.set(1);
      return;
    }
    if (!this.positiveExample().trim() || !this.negativeExample().trim())
    {
      this.error.set('Inserisci entrambi gli esempi');
      this.currentStep.set(2);
      return;
    }
    if (pos.length === 0 || neg.length === 0)
    {
      this.error.set('Inserisci almeno una stringa di controllo per tipo');
      this.currentStep.set(3);
      return;
    }

    const clientError = this.validateRegex();
    if (clientError)
    {
      this.error.set(clientError);
      this.toast.show(clientError, 'error');
      return;
    }

    this.submitting.set(true);
    this.error.set('');

    const payload: {
      title: string;
      description?: string;
      secretRegex: string;
      positiveExample: string;
      negativeExample: string;
      positiveControls: string[];
      negativeControls: string[];
    } = {
      title: this.title().trim(),
      secretRegex: this.regex().trim(),
      positiveExample: this.positiveExample().trim(),
      negativeExample: this.negativeExample().trim(),
      positiveControls: pos,
      negativeControls: neg,
    };
    const desc = this.description().trim();
    if (desc) payload.description = desc;

    this.api.createChallenge(payload).subscribe({
      next: (challenge) =>
      {
        this.success.set(true);
        this.submitting.set(false);
        this.toast.show('Sfida creata!', 'success');
        setTimeout(() => this.router.navigate(['/challenges', challenge.id]), 1200);
      },
      error: (err) =>
      {
        const msg = err.error?.message || 'Errore durante la creazione';
        this.error.set(msg);
        this.toast.show(msg, 'error');
        this.submitting.set(false);
      },
    });
  }

  addPositiveControl(): void
  {
    if (this.positiveControls().length < 10)
    {
      this.positiveControls.update((c) => [...c, '']);
    }
  }

  removePositiveControl(i: number): void
  {
    if (this.positiveControls().length > 1)
    {
      this.positiveControls.update((c) => c.filter((_, idx) => idx !== i));
    }
  }

  trackPosCtrl(i: number): number
  {
    return i;
  }

  addNegativeControl(): void
  {
    if (this.negativeControls().length < 10)
    {
      this.negativeControls.update((c) => [...c, '']);
    }
  }

  removeNegativeControl(i: number): void
  {
    if (this.negativeControls().length > 1)
    {
      this.negativeControls.update((c) => c.filter((_, idx) => idx !== i));
    }
  }

  trackNegCtrl(i: number): number
  {
    return i;
  }

  updatePositiveControl(i: number, event: Event): void
  {
    const value = (event.target as HTMLInputElement).value;
    this.positiveControls.update((c) =>
    {
      const arr = [...c];
      arr[i] = value;
      return arr;
    });
  }

  updateNegativeControl(i: number, event: Event): void
  {
    const value = (event.target as HTMLInputElement).value;
    this.negativeControls.update((c) =>
    {
      const arr = [...c];
      arr[i] = value;
      return arr;
    });
  }
}
