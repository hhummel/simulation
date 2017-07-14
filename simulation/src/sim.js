'use strict';

//Initialization

const Stock = require('./stock.js');
const Trader = require('./trader.js');
const Exchange = require('./exchange.js');
const CreateSVG = require('./draw.js');

const s = new Stock('S', 5900, 5.0, -1.0, [10.0, 11.0, 12.0]);
const p = new Stock('P', 4300, 5.0, 2.0, [22.0, 21.0, 20.0]);
const q = new Stock('Q', 6000, 35.0, 0.5, [30.0, 30.5, 31.0]);
const r = new Stock('R', 5600, 15.0, 0.5, [5.0, 3.0, 1.0]);

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
    ['Jermaine', [[['S', 300], ['P', 200], ['R', 125]]]],
    ['Marlon', [[['P', 300], ['Q', 200], ['R', 125]]]],
    ['Tito', [[['S', 400], ['Q', 200], ['R', 125]]]],
    ['Michael', [[['S', 400], ['P', 200], ['R', 125]]]],
    ['Randy', [[['P', 500], ['Q', 200], ['R', 125]]]],
    ['Jackie', [[['S', 500], ['Q', 200], ['R', 125]]]],
    ['Janet', [[['P', 600], ['Q', 200], ['R', 125]]]],
    ['La Toya', [[['S', 600], ['Q', 200], ['R', 1125]]]],
    ['Barry', [[['S', 1500], ['Q', 1200], ['R', 1125]]]],
    ['Robin', [[['P', 1600], ['Q', 1200], ['R', 1125]]]],
    ['Maurice', [[['S', 1600], ['Q', 1200], ['R', 1125]]]],
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
    ['Jermaine', [2000.00]],
    ['Marlon', [2500.00]],
    ['Tito', [2500.00]],
    ['Michael', [3000.00]],
    ['Randy', [2500.00]],
    ['Jackie', [2500.00]],
    ['Janet', [3000.00]],
    ['La Toya', [3500.00]],
    ['Barry', [1500.00]],
    ['Robin', [1000.00]],
    ['Maurice', [1500.00]],
  ]
);

let allCash = 0;
cash.forEach(arr => allCash += arr[0]);

//Cycle
const limit = 200;
const dataLimit = 20;
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
  const j0 = new Trader('Jermaine', [0.25, -2.5, -5], portfolio.get('Jermaine')[0], cash.get('Jermaine')[0], universe, 1.0); 
  const j1 = new Trader('Marlon', [0.35, -1.5, -3], portfolio.get('Marlon')[0], cash.get('Marlon')[0], universe, 1.0); 
  const j2 = new Trader('Tito', [0.25, -6.5, -6], portfolio.get('Tito')[0], cash.get('Tito')[0], universe, 0.5); 
  const j3 = new Trader('Michael', [0.45, -4.5, -8], portfolio.get('Michael')[0], cash.get('Michael')[0], universe, 0.5); 
  const j4 = new Trader('Randy', [0.65, -2.5, -4], portfolio.get('Randy')[0], cash.get('Randy')[0], universe, 0.5); 
  const j5 = new Trader('Jackie', [0.55, -2.0, -3], portfolio.get('Jackie')[0], cash.get('Jackie')[0], universe, 0.75); 
  const j6 = new Trader('Janet', [0.15, -1.5, -3.5], portfolio.get('Janet')[0], cash.get('Janet')[0], universe, 0.75); 
  const j7 = new Trader('La Toya', [0.55, -1.5, -2.5], portfolio.get('La Toya')[0], cash.get('La Toya')[0], universe, 0.75);
  const b0 = new Trader('Barry', [0.55, -2.0, -3], portfolio.get('Barry')[0], cash.get('Barry')[0], universe, 0.75); 
  const b1 = new Trader('Robin', [0.15, -1.5, -3.5], portfolio.get('Robin')[0], cash.get('Robin')[0], universe, 0.75); 
  const b2 = new Trader('Maurice', [0.55, -1.5, -2.5], portfolio.get('Maurice')[0], cash.get('Maurice')[0], universe, 0.75); 
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
      [j0.name, j0],
      [j1.name, j1],
      [j2.name, j2],
      [j3.name, j3],
      [j4.name, j4],
      [j5.name, j5],
      [j6.name, j6],
      [j7.name, j7],
      [b0.name, b0],
      [b1.name, b1],
      [b2.name, b2],
    ]);

  //Test section
  //traders.forEach(trader => trader.parameters[2] = 0);

  //Do trades
  const exchange = new Exchange(universe, traders);
  const book = exchange.getOrderBook();
  const trades = exchange.getTrades(book);
  if (trades.length === undefined || trades.length === 0 || cycle === limit) {

    //Output cumulative result
    //console.log("Stocks: ");
    //universe.forEach((stock, ticker) => console.log(ticker, stock.price));
    //console.log("Portfolios: ");
    //portfolio.forEach((port, name) => console.log(name, port));
    //console.log("Cash: ", cash);
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

  //Test that cash and share totals are conserved.
  let cashTotal = 0;
  cash.forEach(arr => cashTotal += arr[0]);
  if (Math.abs(cashTotal - allCash) > 0.001) console.log("Cash total: ", cashTotal, " should equal ", allCash);
  const stockTotal = new Map([["S", 0], ["P", 0], ["Q", 0], ["R", 0]]);
  portfolio.forEach(trader => trader[0].forEach(arr => stockTotal.set(arr[0], stockTotal.get(arr[0]) + arr[1])));
  stockTotal.forEach((total, ticker) => {
    const test = universe.get(ticker).outstanding;
    if (Math.abs(total - test) > 0.001) console.log("Stock Total: ", ticker, total, " should equal ", test);
  });
  let marketValue = 0;
  universe.forEach(stock => marketValue += stock.outstanding * stock.price[0]);
  console.log("Market value: ", marketValue);
}

//dataCycle
if (dataCycle % 2 === 1) {
  //s.eps += 10;
  //s.book *= 10;
  //p.eps *= 10;
  //p.book *= 10;
  q.eps *= 10;
  q.book *= 10;
  //r.eps *= 10;
  //r.book *= 10;

} else {
  //s.eps -= 10;
  //s.book /= 10;
  //p.eps /= 10;
  //p.book /= 10;
  q.eps /= 10;
  q.book /= 10;
  //r.eps /= 10;
  //r.book /= 10;
}
console.log("\n*****************************************************************\n");
console.log("Data cycle: ", dataCycle, " S eps: ", s.eps);
console.log("Data cycle: ", dataCycle, " P eps: ", p.eps);
console.log("Data cycle: ", dataCycle, " Q eps: ", q.eps);
console.log("Data cycle: ", dataCycle, " R eps: ", r.eps);
}
CreateSVG(universe, portfolio, cash);

