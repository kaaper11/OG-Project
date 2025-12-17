import fs from 'fs';
import { Ant } from './Ant.js';

const przedmioty = JSON.parse(
    fs.readFileSync(new URL('../items.json', import.meta.url))
).map((przedmiot, indeks) => ({
    ...przedmiot,
    index: indeks
}));

class KoloniaMrowek {
    constructor({
                    maksymalnaWielkoscPlecaka,
                    parowanie = 0.1,
                    Q = 2,
                    liczbaMrowek = 10,
                    procentElity = 0.1
                }) {
        this.maksymalnaWielkoscPlecaka = maksymalnaWielkoscPlecaka;
        this.parowanie = parowanie;
        this.Q = Q;
        this.liczbaMrowek = liczbaMrowek;
        this.procentElity = procentElity;

        this.feromony = przedmioty.map(() => 1.0);

        this.heurystyka = przedmioty.map(p => p.value / p.weight);

        this.najlepszeRozwiazanie = null;
        this.najlepszaWartosc = -Infinity;
    }

    wykonajIteracje() {
        const wynikiMrowek = [];

        for (let i = 0; i < this.liczbaMrowek; i++) {
            const mrowka = new Ant(this.maksymalnaWielkoscPlecaka);

            const wynik = mrowka.pakujPlecak(
                [...this.feromony],
                [...this.heurystyka]
            );

            wynikiMrowek.push(wynik);

            if (wynik.wartosc > this.najlepszaWartosc) {
                this.najlepszaWartosc = wynik.wartosc;
                this.najlepszeRozwiazanie = {
                    przedmioty: wynik.przedmioty.map(p => ({
                        index: p.index,
                        name: p.name,
                        weight: p.weight,
                        value: p.value
                    })),
                    waga: wynik.waga,
                    wartosc: wynik.wartosc
                };
            }
        }

        this.parujFeromony();

        this.aktualizujFeromony(wynikiMrowek);

        return {
            najlepszaWartosc: this.najlepszaWartosc,
            najlepszeRozwiazanie: this.najlepszeRozwiazanie,
            feromony: [...this.feromony]
        };
    }

    parujFeromony() {
        const wspolczynnik = 1 - this.parowanie;
        for (let i = 0; i < this.feromony.length; i++) {
            this.feromony[i] *= wspolczynnik;
        }
    }

    aktualizujFeromony(wynikiMrowek) {
        if (!wynikiMrowek.length) return;

        for (const wynik of wynikiMrowek) {
            const depozyt = this.Q * wynik.wartosc;
            for (const przedmiot of wynik.przedmioty) {
                this.feromony[przedmiot.index] += depozyt;
            }
        }

        const posortowane = [...wynikiMrowek]
            .sort((a, b) => b.wartosc - a.wartosc);

        const liczbaElity = Math.max(
            1,
            Math.round(this.procentElity * wynikiMrowek.length)
        );

        for (let i = 0; i < liczbaElity; i++) {
            const wynik = posortowane[i];
            const dodatkowyDepozyt = this.Q * wynik.wartosc;

            for (const przedmiot of wynik.przedmioty) {
                this.feromony[przedmiot.index] += dodatkowyDepozyt;
            }
        }
    }
}

export default KoloniaMrowek;
