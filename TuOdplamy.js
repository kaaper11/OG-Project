const { Item } = require("./RepresenativeCalsses/Item.js");
const { Ant } = require('./RepresenativeCalsses/Ant.js');

const items = require('./items.json');

const cos1 = new Item(items[0].name, items[0].weight, items[0].value);


const ti = Array(10).fill(1);
const ni = [];
for ( let i = 0; i < items.length; i++ ) {
    let it = new Item(items[i].name, items[i].weight, items[i].value);
    ni.push(it.oplacalnoscPrzedmiotu());
}

const ant = new Ant(10);
console.log(ant.pakujPlecak(ti,ni));

