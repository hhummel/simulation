'use strict';

const Stock = require('./stock');
const Trader = require('./trader');
const Exchange = require('./exchange');

const s = new Stock('S', 1000, 5.0, -1.0, [10.0, 11.0, 12.0]);
const p = new Stock('P', 3000, 5.0, 2.0, [22.0, 21.0, 20.0]);
const q = new Stock('Q', 4000, 35.0, 0.5, [30.0, 30.5, 31.0]);

const universe = new Map([[s.ticker, s], [p.ticker, p], [q.ticker, q]]);

const t = new Trader('Tom', [0.1, 3, -2], [['S', 100], ['P', 200]], 500.00, universe); 
const u = new Trader('Dick', [0.2, 2, -3], [['P', 100], ['Q', 200]], 1000.00, universe); 
const v = new Trader('Harry', [0.3, 1, -1], [['S', 100], ['Q', 200]], 1500.00, universe); 

//const traders = new Map([[t['name'], t], [u['name'], u], [v['name'], v]]);
const traders = new Map([[t.name, t], [u.name, u], [v.name, v]]);

const exchange = new Exchange(universe, traders);

console.log(exchange.getOrderBook());



