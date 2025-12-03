export class Item {
    constructor(name, weight, value) {
        this.name = name;
        this.weight = weight;
        this.value = value;
    }

    wyswietlPrzedmiot() {
        console.log(`${this.name} ( waga: ${this.weight}, wartość: ${this.value} )`);
    }

    oplacalnoscPrzedmiotu(){
        return this.value/this.weight;
    }

    czySieMiesci(max, ileJest){
        if (ileJest + this.weight <= max) {
            return true;
        }
        return false;
    }

}