import fs from 'fs';
import { Item } from './Item.js';

const items = JSON.parse(
    fs.readFileSync(new URL('../items.json', import.meta.url))
).map((it, index) => ({
    ...it,
    index
}));

export class Ant {
    alfa = 1;
    beta = 3;

    constructor(maxWielkosc) {
        this.maxWielkosc = maxWielkosc;
    }

    pakujPlecak(ti, ni) {
        let aktualnaWielkosc = 0;
        let aktualnaWartosc = 0;
        const listSpakowanych = [];

        let listaDostepnych = [...items];

        while (listaDostepnych.length > 0) {

            const atrakcyjnosc = listaDostepnych.map(it =>
                Math.pow(ti[it.index], this.alfa) *
                Math.pow(ni[it.index], this.beta)
            );

            const suma = atrakcyjnosc.reduce((a, b) => a + b, 0);
            if (suma === 0) break;

            const prawdopodobienstwo = atrakcyjnosc.map(a => a / suma);

            const idx = this.losujIndeks(prawdopodobienstwo);
            const chosen = listaDostepnych[idx];

            const item = new Item(
                chosen.name,
                chosen.weight,
                chosen.value,
                chosen.index
            );

            if (aktualnaWielkosc + item.weight <= this.maxWielkosc) {
                listSpakowanych.push(item);
                aktualnaWielkosc += item.weight;
                aktualnaWartosc += item.value;
            }

            listaDostepnych.splice(idx, 1);
        }

        return {
            przedmioty: listSpakowanych,
            waga: aktualnaWielkosc,
            wartosc: aktualnaWartosc
        };
    }

    losujIndeks(prawdopodobienstwo) {
        let r = Math.random();
        let acc = 0;
        for (let i = 0; i < prawdopodobienstwo.length; i++) {
            acc += prawdopodobienstwo[i];
            if (r <= acc) return i;
        }
        return prawdopodobienstwo.length - 1;
    }
}
