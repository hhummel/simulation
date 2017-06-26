'use strict';

const Stock = require('./stock');
const Trader = require('./trader');

const s = new Stock('S', 1000, 2.0, 1.0, [10.0, 11.0, 12.0]);
const p = new Stock('P', 3000, 1.0, 2.0, [20.0, 21.0, 22.0]);
const q = new Stock('Q', 4000, 0.5, 3.0, [30.0, 31.0, 32.0]);

const universe = new Map([[s.ticker, s], [p.ticker, p], [q.ticker, q]]);

const t = new Trader('Tom', [0,1,2], [['S', 100], ['P', 200]], 500.00, universe); 
const u = new Trader('Dick', [1,2,3], [['P', 100], ['Q', 200]], 1000.00, universe); 
const v = new Trader('Harry', [3,2,1], [['S', 100], ['Q', 200]], 1500.00, universe); 

const traders = new Map([



