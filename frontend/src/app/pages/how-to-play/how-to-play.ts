import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-how-to-play',
  templateUrl: './how-to-play.html',
  styleUrls: ['./how-to-play.css'],
})
export class HowToPlayPage
{
  readonly activeTab = signal(0);

  readonly tabs = [
    {
      title: 'Cos\'è?',
      icon: '<path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/><path d="M12 6a4 4 0 1 0 4 4 4 4 0 0 0-4-4zm0 6a2 2 0 1 1 2-2 2 2 0 0 1-2 2z"/>',
      content: 'RegexRiddle è un gioco di enigmi in cui i giocatori creano e risolvono sfide basate su espressioni regolari. Una sfida consiste in una regex segreta nota solo all\'autore, più indizi pubblici.',
      detail: 'Come risolutore, cerchi di indovinare la regex esatta. Il sistema controlla la tua proposta contro le stringhe di controllo nascoste.',
    },
    {
      title: 'Creare',
      icon: '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>',
      content: 'Quando crei una sfida, devi fornire un titolo, la regex segreta, un esempio positivo e uno negativo, più fino a 10 stringhe di controllo positive e 10 negative.',
      detail: 'Solo tu conosci la regex segreta e le stringhe di controllo. Gli altri vedranno solo gli esempi pubblici e dovranno indovinare il pattern nascosto.',
    },
    {
      title: 'Risolvere',
      icon: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
      content: 'Scegli una sfida dalla bacheca. Vedrai titolo, descrizione, esempio positivo e negativo. Scrivi la tua regex proposta nel campo apposito.',
      detail: 'Vinci quando la tua regex matcha TUTTE le stringhe positive e ZERO negative tra quelle nascoste. La cronologia mostra i tuoi tentativi.',
    },
    {
      title: 'Classifica',
      icon: '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>',
      content: 'Ogni sfida risolta ti fa guadagnare un posto nella classifica. La classifica è ordinata per sfide risolte e media tentativi.',
      detail: 'Meno tentativi = posizione più alta. Sfida te stesso a risolvere al primo colpo!',
    },
    {
      title: 'Regex 101',
      icon: '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>',
      content: 'Ecco i pattern più comuni per iniziare:',
      detail: '',
      isTable: true,
    },
  ];

  setTab(i: number): void
  {
    this.activeTab.set(i);
  }
}
