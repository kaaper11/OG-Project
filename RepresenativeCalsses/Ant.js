import fs from 'fs';
import { Item } from './Item.js';

const items = JSON.parse(fs.readFileSync(new URL('../items.json', import.meta.url)));

export class Ant {
    aktualnaWielkosc = 0;
    aktualnaWartosc = 0;
    listaWszytkich = items;
    listSpakowanych = [];
    alfa = 1;
    beta = 3;

    constructor( maxWielkosc ) {
        this.maxWielkosc = maxWielkosc;
    }


    pakujPlecak(tii, nii){
        this.aktualnaWielkosc = 0;
        this.aktualnaWartosc = 0;
        this.listSpakowanych = [];

        let listaDostepnych = [...this.listaWszytkich];
        const ti = [...tii];
        const ni = [...nii]


        while (this.aktualnaWielkosc < this.maxWielkosc && listaDostepnych.length > 0) {

            const atrakcyjnosc = [];
            for ( let i = 0; i < listaDostepnych.length; i++ ) {
                atrakcyjnosc.push(Math.pow(ti[i], this.alfa) * Math.pow(ni[i], this.beta))
            }

            let suma = atrakcyjnosc.reduce( (a, b) => a + b, 0);

            const prawdopodobiensto = [];
            for ( let i = 0; i < listaDostepnych.length; i++ ) {
                prawdopodobiensto.push(atrakcyjnosc[i]/suma)
            }

            let indeks = this.losujIndeks(prawdopodobiensto);

            let itemInd = new Item(listaDostepnych[indeks].name, listaDostepnych[indeks].weight, listaDostepnych[indeks].value);
            if (itemInd.czySieMiesci(this.maxWielkosc, this.aktualnaWielkosc)){
                this.listSpakowanych.push(itemInd);
                this.aktualnaWielkosc += itemInd.weight;
                this.aktualnaWartosc += itemInd.value;
            }

            listaDostepnych.splice(indeks,1);
            ti.splice(indeks,1);
            ni.splice(indeks,1);


        }
        return ({przedmioty: this.listSpakowanych, waga: this.aktualnaWielkosc, wartosc: this.aktualnaWartosc});
        
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