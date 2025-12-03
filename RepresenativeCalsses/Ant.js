import fs from 'fs';
import { Item } from './Item.js';

const items = JSON.parse(fs.readFileSync(new URL('../items.json', import.meta.url)));

export class Ant {
    aktualnaWielkosc = 0;
    aktualnaWartosc = 0;
    listaWszytkich = items;
    listSpakowanych = [];

    constructor( maxWielkosc ) {
        this.maxWielkosc = maxWielkosc;
    }

    pakujPlecak(){
        let oplacalnosc = 0;
        let zapIndex = 0;

        while (this.aktualnaWielkosc < this.maxWielkosc && this.listaWszytkich.length > 0) {
            for (let x in this.listaWszytkich) {
                let item = new Item(this.listaWszytkich[x].name, this.listaWszytkich[x].weight, this.listaWszytkich[x].value);
                if (item.oplacalnoscPrzedmiotu() > oplacalnosc && item.czySieMiesci(this.maxWielkosc, this.aktualnaWielkosc)) {
                    oplacalnosc = item.oplacalnoscPrzedmiotu();
                    zapIndex = x;
                }
            }
            this.aktualnaWielkosc = this.aktualnaWielkosc + this.listaWszytkich[zapIndex].weight;
            this.aktualnaWartosc = this.aktualnaWartosc + this.listaWszytkich[zapIndex].value;
            this.listSpakowanych.push(this.listaWszytkich[zapIndex]);
            this.listaWszytkich.splice(zapIndex, 1);

            oplacalnosc = 0;
            zapIndex = 0;
        }
        return ({przedmioty: this.listSpakowanych, waga: this.aktualnaWielkosc, wartosc: this.aktualnaWartosc});

    }


}