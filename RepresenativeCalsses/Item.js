export class Item {
    constructor(name, weight, value, index) {
        this.name = name;
        this.weight = Number(weight);
        this.value = Number(value);
        this.index = index; // 🔥 KLUCZ
    }

    wyswietlPrzedmiot() {
        console.log(`${this.name} ( waga: ${this.weight}, wartość: ${this.value} )`);
    }

    oplacalnoscPrzedmiotu() {
        return this.value / this.weight;
    }

    czySieMiesci(max, ileJest) {
        return ileJest + this.weight <= max;
    }
}
