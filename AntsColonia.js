// RepresenativeCalsses/AntsColonia.js
import fs from 'fs';
import { Ant } from './Ant.js';
import { Item } from './Item.js';

const items = JSON.parse(
    fs.readFileSync(new URL('../items.json', import.meta.url))
);

class AntsColonia {
    /**
     * @param {object} opts
     *  - maxWielkosc: pojemność plecaków mrówek
     *  - evaporation: współczynnik parowania (np. 0.1)
     *  - Q: ilość feromonu (tutaj ustawiamy 2, ale można nadpisać)
     *  - antsPerIter: ile mrówek w jednej iteracji (tutaj 10)
     *  - p: ułamek elit (0..1) - 0.1 = 10%
     */
    constructor({ maxWielkosc, evaporation = 0.1, Q = 2, antsPerIter = 10, p = 0.1 }) {
        this.maxWielkosc = maxWielkosc;
        this.evaporation = evaporation;
        this.Q = Q; // zgodnie z wymaganiem Q = 2 domyślnie
        this.antsPerIter = antsPerIter;
        this.p = p;

        // inicjalizacja feromonów: startujemy od 1.0 dla każdego przedmiotu
        this.pheromones = items.map(() => 1.0);

        // heurystyka (ni) = value / weight
        this.heuristics = items.map(it => {
            const w = Number(it.weight) || 1;
            const v = Number(it.value) || 0;
            return w === 0 ? v : v / w;
        });

        // najlepsze rozwiązanie znalezione dotychczas (max value)
        this.bestSolution = null; // {przedmioty: [...], waga, wartosc}
        this.bestValue = -Infinity;
    }

    /**
     * Wykonuje jedną iterację algorytmu:
     * - tworzy antsPerIter mrówek,
     * - każda mrówka pakuje plecak (korzysta z Ant.pakujPlecak z branchu Kacper),
     * - ocenia rozwiązania i aktualizuje bestSolution,
     * - paruje feromony,
     * - aktualizuje feromony na podstawie rozwiązań mrówek (z elitą p).
     *
     * Zwraca wyniki mrówek i aktualny najlepszy wynik.
     */
    iterate() {
        // 1) Stwórz mrówki i poproś je o spakowanie plecaków
        const antsResults = [];
        for (let i = 0; i < this.antsPerIter; i++) {
            const ant = new Ant(this.maxWielkosc);

            // Ant.pakujPlecak oczekuje dwóch tablic: ti (feromony) oraz ni (heurystyki).
            // Przekazujemy kopie, bo Ant je modyfikuje (splice itp. w Kacprze).
            const tiCopy = [...this.pheromones];
            const niCopy = [...this.heuristics];

            const result = ant.pakujPlecak(tiCopy, niCopy);
            // result: {przedmioty: [...Item], waga: number, wartosc: number}
            antsResults.push(result);

            // aktualizacja globalnego najlepszego
            if (result.wartosc > this.bestValue) {
                this.bestValue = result.wartosc;
                this.bestSolution = {
                    przedmioty: result.przedmioty.map(it => ({ name: it.name, weight: it.weight, value: it.value })),
                    waga: result.waga,
                    wartosc: result.wartosc
                };
            }
        }

        // 2) Parowanie feromonów
        this.evaporatePheromones();

        // 3) Aktualizacja feromonów wg mrówek (oraz dodatkowo wg elit)
        this.updatePheromones(antsResults);

        // zwróć podsumowanie iteracji
        return {
            antsResults,
            bestSolution: this.bestSolution,
            bestValue: this.bestValue,
            pheromones: [...this.pheromones] // kopia
        };
    }

    /** Parowanie feromonów: pheromone = pheromone * (1 - evaporation) */
    evaporatePheromones() {
        const factor = 1 - this.evaporation;
        for (let i = 0; i < this.pheromones.length; i++) {
            this.pheromones[i] = this.pheromones[i] * factor;
            // zabezpieczenie przed zanikiem do 0 (opcjonalne)
            if (this.pheromones[i] < 1e-9) this.pheromones[i] = 1e-9;
        }
    }

    /**
     * Dodaje feromony na podstawie jakości rozwiązań.
     * - każda mrówka deponuje deposit = Q * wartosc_spakowanych_przedmiotow na każdym spakowanym przedmiocie,
     * - dodatkowo najlepsze k = max(1, round(p * antsCount)) mrówek (elita) dostają dodatkowy taki sam depozyt.
     *
     * ants - tablica wyników: { przedmioty: [Item], waga, wartosc }
     */
    updatePheromones(ants) {
        if (!Array.isArray(ants) || ants.length === 0) return;

        // Najpierw zwykłe deponowanie feromonu przez każdą mrówkę
        for (const res of ants) {
            const deposit = this.Q * (Number(res.wartosc) || 0);

            // każdy spakowany przedmiot: zwiększ feromon na indeksie odpowiadającym items.json
            for (const packedItem of res.przedmioty) {
                const idx = this._findItemIndex(packedItem);
                if (idx >= 0) {
                    this.pheromones[idx] += deposit;
                }
            }
        }

        // Elita: dodatkowy depozyt dla najlepszych p*ants mrówek
        const antsSorted = [...ants].sort((a, b) => (b.wartosc || 0) - (a.wartosc || 0));
        const eliteCount = Math.max(1, Math.round(this.p * ants.length)); // p = 0.1 -> 1 dla 10 ants
        for (let i = 0; i < eliteCount; i++) {
            const res = antsSorted[i];
            const extraDeposit = this.Q * (Number(res.wartosc) || 0); // dodatkowy depozyt
            for (const packedItem of res.przedmioty) {
                const idx = this._findItemIndex(packedItem);
                if (idx >= 0) {
                    this.pheromones[idx] += extraDeposit;
                }
            }
        }
    }

    /**
     * Pomocnicza: znajduje index przedmiotu z items.json pasujący do danego Item (porównuje po name, a jeśli brak, to po weight+value).
     */
    _findItemIndex(packedItem) {
        // preferuj porównanie po nazwie jeżeli istnieje
        if (packedItem && packedItem.name) {
            const byName = items.findIndex(it => it.name === packedItem.name);
            if (byName >= 0) return byName;
        }
        // fallback: porównaj po weight i value
        const w = Number(packedItem.weight);
        const v = Number(packedItem.value);
        for (let i = 0; i < items.length; i++) {
            if (Number(items[i].weight) === w && Number(items[i].value) === v) return i;
        }
        return -1; // nie znaleziono
    }
}

export default AntsColonia;
