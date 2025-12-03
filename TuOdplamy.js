const { Item } = require("./RepresenativeCalsses/Item.js");
const { Ant } = require('./RepresenativeCalsses/Ant.js');

const items = require('./items.json');

const cos1 = new Item(items[0].name, items[0].weight, items[0].value);

const ant = new Ant(10);
console.log(ant.pakujPlecak());

//cos1.wyswietlPrzedmiot()
