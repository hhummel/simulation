'use strict';

//Initialization

const Stock = require('./stock.js');
const Trader = require('./trader.js');
const Exchange = require('./exchange.js');
const CreateSVG = require('./draw.js');

const s = new Stock('S', 600, 5.0, -1.0, [10.0, 11.0, 12.0]);
const p = new Stock('P', 900, 5.0, 2.0, [22.0, 21.0, 20.0]);
const q = new Stock('Q', 1200, 35.0, 0.5, [30.0, 30.5, 31.0]);
const r = new Stock('R', 225, 15.0, 0.5, [5.0, 3.0, 1.0]);

const universe = new Map([[s.ticker, s], [p.ticker, p], [q.ticker, q], [r.ticker, r]]);

const portfolio = new Map(
  [
    ['Tom', [[['S', 100], ['P', 200], ['R', 25]]]],
    ['Dick', [[['P', 100], ['Q', 200], ['R', 25]]]],
    ['Harry', [[['S', 100], ['Q', 200], ['R', 25]]]],
    ['Curly', [[['S', 100], ['P', 200], ['R', 25]]]],
    ['Moe', [[['P', 100], ['Q', 200], ['R', 25]]]],
    ['Larry', [[['S', 100], ['Q', 200], ['R', 25]]]],
    ['Groucho', [[['S', 100], ['P', 200], ['R', 25]]]],
    ['Harpo', [[['P', 100], ['Q', 200], ['R', 25]]]],
    ['Zeppo', [[['S', 100], ['Q', 200], ['R', 25]]]],
  ]

);

const cash = new Map(
  [
    ['Tom', [500.00]],
    ['Dick', [1000.00]],
    ['Harry', [1500.00]],
    ['Curly', [500.00]],
    ['Moe', [1000.00]],
    ['Larry', [1500.00]],
    ['Groucho', [500.00]],
    ['Harpo', [1000.00]],
    ['Zeppo', [1500.00]],
  ]
);

let allCash = 0;
cash.forEach(arr => allCash += arr[0]);

//Cycle
const limit = 200;
const dataLimit = 10;
let cycle = 0;
let dataCycle = 0;

while (dataCycle++ < dataLimit) { 

while (true) {
  cycle += 1;

  //Make traders
  const t = new Trader('Tom', [0.1, -3, -2], portfolio.get('Tom')[0], cash.get('Tom')[0], universe, 1.0); 
  const u = new Trader('Dick', [0.2, -2, -3], portfolio.get('Dick')[0], cash.get('Dick')[0], universe, 1.0); 
  const v = new Trader('Harry', [0.3, -1, -1], portfolio.get('Harry')[0], cash.get('Harry')[0], universe, 1.0); 
  const c = new Trader('Curly', [0.2, -6, -4], portfolio.get('Curly')[0], cash.get('Curly')[0], universe, 0.5); 
  const m = new Trader('Moe', [0.4, -4, -6], portfolio.get('Moe')[0], cash.get('Moe')[0], universe, 0.5); 
  const l = new Trader('Larry', [0.6, -2, -2], portfolio.get('Larry')[0], cash.get('Larry')[0], universe, 0.5); 
  const g = new Trader('Groucho', [0.05, -1.5, -1], portfolio.get('Groucho')[0], cash.get('Groucho')[0], universe, 0.75); 
  const h = new Trader('Harpo', [0.1, -1, -1.5], portfolio.get('Harpo')[0], cash.get('Harpo')[0], universe, 0.75); 
  const z = new Trader('Zeppo', [0.15, -0.5, -0.5], portfolio.get('Zeppo')[0], cash.get('Zeppo')[0], universe, 0.75); 
  const traders = new Map(
    [
      [t.name, t], 
      [u.name, u], 
      [v.name, v],
      [c.name, c], 
      [m.name, m], 
      [l.name, l],
      [g.name, g], 
      [h.name, h], 
      [z.name, z],
    ]);

  //Do trades
  const exchange = new Exchange(universe, traders);
  const book = exchange.getOrderBook();
  const trades = exchange.getTrades(book);
  if (trades.length === undefined || trades.length === 0 || cycle === limit) {

    //Output cumulative result
    console.log("Stocks: ");
    universe.forEach((stock, ticker) => console.log(ticker, stock.price));
    console.log("Portfolios: ");
    portfolio.forEach((port, name) => console.log(name, port));
    console.log("Cash: ", cash);
    break;
  }
  const [newPrice, newPortfolio, newCash] = exchange.getUpdates(trades);

  //Update data structures
  universe.forEach((stock, ticker) => stock.price.unshift(newPrice.has(ticker) ? newPrice.get(ticker) : stock.price[0]));
  portfolio.forEach((array, name) => array.unshift(Array.from(newPortfolio.get(name))));
  cash.forEach((array, name) => array.unshift(newCash.get(name)));

  //Output cycle results
  console.log("Cycle: ", cycle);
  console.log("Trades: ", trades);

  //Test that cash and share totals are conserved.  Replace with assert.
  let cashTotal = 0;
  cash.forEach(arr => cashTotal += arr[0]);
  console.log("Cash total: ", cashTotal, " should equal ", allCash);
  const stockTotal = new Map([["S", 0], ["P", 0], ["Q", 0], ["R", 0]]);
  portfolio.forEach(trader => trader[0].forEach(arr => stockTotal.set(arr[0], stockTotal.get(arr[0]) + arr[1])));
  stockTotal.forEach((total, ticker) => console.log("Stock Total: ", ticker, total, " should equal ", universe.get(ticker).outstanding));
}

//dataCycle
if (dataCycle % 2 === 1) {
  q.eps += 2;
  q.book += 2;
} else {
  q.eps -= 2;
  q.book -= 2;
}

console.log("Data cycle Q eps: ", q.eps);
}
CreateSVG(universe, portfolio, cash);

