'use strict';

//Initialization

let mom = true;
let impulse = 3.0;

const Stock = require('./stock.js');
const Trader = require('./trader.js');
const Exchange = require('./exchange.js');
const CreateSVG = require('./draw.js');
const DataStore = require('./dataStore.js');

const stockList = [
  new Stock('S', 9100, 5.0, -1.0, [10.0, 11.0, 12.0]),
  new Stock('P', 14300, 5.0, 2.0, [22.0, 21.0, 20.0]),
  new Stock('Q', 9200, 35.0, 0.5, [30.0, 30.5, 31.0]),
  new Stock('R', 8800, 15.0, 0.5, [5.0, 3.0, 1.0]),
];

const traderList = [
  ['Tom',   [0.1, -3, -2], 1.0], 
  ['Dick',  [0.2, -2, -3], 1.0], 
  ['Harry', [0.3, -1, -1], 1.0], 
  ['Curly', [0.2, -6, -4], 0.5], 
  ['Moe',   [0.4, -4, -6], 0.5], 
  ['Larry', [0.6, -2, -2], 0.5], 
  ['Groucho', [0.05, -1.5, -1], 0.75], 
  ['Harpo', [0.1, -1, -1.5], 0.75], 
  ['Zeppo', [0.15, -0.5, -0.5], 0.75], 
  ['Jermaine', [0.25, -2.5, -5], 1.0], 
  ['Marlon', [0.35, -1.5, -3], 1.0], 
  ['Tito', [0.25, -6.5, -6], 0.5], 
  ['Michael', [0.45, -4.5, -8], 0.5], 
  ['Randy', [0.65, -2.5, -4], 0.5], 
  ['Jackie', [0.55, -2.0, -3], 0.75], 
  ['Janet', [0.15, -1.5, -3.5], 0.75], 
  ['La Toya', [0.55, -1.5, -2.5], 0.75],
  ['Barry', [0.55, -2.0, -3], 0.75], 
  ['Robin', [0.15, -1.5, -3.5], 0.75], 
  ['Maurice', [0.55, -1.5, -2.5], 0.75],
  ['Donald', [1.0, -1.0, -5], 2.0],
  ['Ivana', [2.0, -2.0, -2], 0.5],
  ['Donald Jr', [1.0, -1.0, -7.0], 3.0],
  ['Eric', [1.0, -1.0, -5], 2.0],
  ['Ivanka', [2.0, -2.0, -2], 1.0],
  ['Jared', [3.0, -3.0, -2], 2.0],
  ['Marla', [3.0, -3.0, -1], 0.5],
  ['Tiffany', [2.0, -2.0, -1], 0.5],
  ['Melania', [1.0, -1.0, -1], 0.5],
  ['Barron', [1.0, -1.0, -1], 0.5],
]; 

const initialAssets = [
    ['Tom', [[['S', 100], ['P', 200], ['R', 25]]], [500.00]],
    ['Dick', [[['P', 100], ['Q', 200], ['R', 25]]], [1000.00]],
    ['Harry', [[['S', 100], ['Q', 200], ['R', 25]]], [1500.00]],
    ['Curly', [[['S', 100], ['P', 200], ['R', 25]]], [500.00]],
    ['Moe', [[['P', 100], ['Q', 200], ['R', 25]]], [1000.00]],
    ['Larry', [[['S', 100], ['Q', 200], ['R', 25]]], [1500.00]],
    ['Groucho', [[['S', 100], ['P', 200], ['R', 25]]],[500.00]],
    ['Harpo', [[['P', 100], ['Q', 200], ['R', 25]]], [1000.00]],
    ['Zeppo', [[['S', 100], ['Q', 200], ['R', 25]]], [1500.00]],
    ['Jermaine', [[['S', 300], ['P', 200], ['R', 125]]], [2000.00]],
    ['Marlon', [[['P', 300], ['Q', 200], ['R', 125]]],[2500.00]],
    ['Tito', [[['S', 400], ['Q', 200], ['R', 125]]], [2500.00]],
    ['Michael', [[['S', 400], ['P', 200], ['R', 125]]], [3000.00]],
    ['Randy', [[['P', 500], ['Q', 200], ['R', 125]]], [2500.00]],
    ['Jackie', [[['S', 500], ['Q', 200], ['R', 125]]], [2500.00]],
    ['Janet', [[['P', 600], ['Q', 200], ['R', 125]]], [3000.00]],
    ['La Toya', [[['S', 600], ['Q', 200], ['R', 1125]]], [3500.00]],
    ['Barry', [[['S', 1500], ['Q', 1200], ['R', 1125]]], [1500.00]],
    ['Robin', [[['P', 1600], ['Q', 1200], ['R', 1125]]], [1000.00]],
    ['Maurice', [[['S', 1600], ['Q', 1200], ['R', 1125]]], [1500.00]],
    ['Donald', [[]], [200000.00]],
    ['Ivana', [[]], [5000.00]],
    ['Donald Jr', [[]], [20000.00]],
    ['Eric', [[]], [15000.00]],
    ['Ivanka', [[['S', 1000], ['Q', 1000], ['R', 1000]]], [0.00]],
    ['Jared', [[['P', 10000]]], [100.00]],
    ['Marla', [[['S', 100], ['Q', 100], ['R', 100]]], [0.00]],
    ['Tiffany', [[['S', 100], ['Q', 100], ['R', 100]]], [0.00]],
    ['Melania', [[['S', 1000], ['Q', 1000], ['R', 1000]]], [20000.00]],
    ['Barron', [[['S', 100], ['Q', 100], ['R', 100]]], [0.00]],
];

const ds = new DataStore(stockList, traderList, initialAssets);

let allCash = 0;
ds.cash.forEach(arr => allCash += arr[0]);

//Cycle
const limit = 200;
const dataLimit = 20;
let cycle = 0;
let dataCycle = 0;

while (dataCycle++ < dataLimit) { 

while (true) {
  cycle += 1;
  const universe = ds.universe;
  const traderList = ds.traderList;
  const portfolio = ds.portfolio;
  const cash = ds.cash;

  //Make traders
  const traderArray = traderList.map(t => [
    t[0], 
    new Trader(
      t[0], 
      t[1], 
      portfolio.has(t[0]) ? portfolio.get(t[0])[0] : [], 
      cash.has(t[0]) ? cash.get(t[0])[0] : 0, 
      universe, 
      t[2]
    )
  ]);
  const traders = new Map(traderArray);
 
  //Test section
  if (mom === false) traders.forEach(trader => trader.parameters[2] = 0);

  //Do trades
  const exchange = new Exchange(ds.universe, traders);
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
  ds.universe.get('S').eps += impulse;
  ds.universe.get('S').book *= impulse;
  ds.universe.get('P').eps *= impulse;
  ds.universe.get('P').book *= impulse;
  ds.universe.get('Q').eps /= impulse;
  ds.universe.get('Q').book /= impulse;
  ds.universe.get('R').eps /= impulse;
  ds.universe.get('R').book /= impulse;

} else {
  ds.universe.get('S').eps -= impulse;
  ds.universe.get('S').book /= impulse;
  ds.universe.get('P').eps /= impulse;
  ds.universe.get('P').book /= impulse;
  ds.universe.get('Q').eps *= impulse;
  ds.universe.get('Q').book *= impulse;
  ds.universe.get('R').eps *= impulse;
  ds.universe.get('R').book *= impulse;
}
console.log("\n*****************************************************************\n");
console.log("Data cycle: ", dataCycle, " S eps: ", ds.universe.get('S').eps);
console.log("Data cycle: ", dataCycle, " P eps: ", ds.universe.get('P').eps);
console.log("Data cycle: ", dataCycle, " Q eps: ", ds.universe.get('Q').eps);
console.log("Data cycle: ", dataCycle, " R eps: ", ds.universe.get('R').eps);
}
CreateSVG(ds.universe, ds.portfolio, ds.cash);

