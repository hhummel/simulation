'use strict';

const Stock = require('./stock.js');
const Trader = require('./trader.js');
const Exchange = require('./exchange.js');
const CreateSVG = require('./draw.js');
const DataStore = require('./dataStore.js');
const Cycle = require('./cycle.js');

//Set parameters

let mom = 1.0;

//Price make asymmetric jumps
let impulse = 3.0;
const limit = 100000;
const dataLimit = 20;
const cycleLimit = 100;

//Set initial conditions
const stockList = require('./stockList_0.js');
const traderList = require('./traderList_0.js');
const initialAssets = require('./initialAssets_0.js');

const ds = new DataStore(stockList, traderList, initialAssets);

let allCash = 0;
ds.cash.forEach(arr => allCash += arr[0]);

//Cycle

let cycle = 0;
let dataCycle = 0;

while (dataCycle <= dataLimit) { 

  //Total positive, neutral, negative for the cycle
  let positive = 0;
  let neutral = 0;
  let negative = 0;
  let thisCycle = 0;

  while (true) {
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
    traders.forEach(trader => trader.parameters[2] *= mom);

    //Do trades
    const exchange = new Exchange(ds.universe, traders);
    const book = exchange.getOrderBook();
    const trades = exchange.getTrades(book);
    if (trades.length === undefined || trades.length === 0 || thisCycle >= cycleLimit ) {

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
    //console.log("Cycle: ", cycle);
    //console.log("Trades: ", trades);

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
    //console.log("Market value: ", marketValue);

    //Output positive, neutral, negative
    traders.forEach((trader, name) => {
      //console.log(name, trader.positive, trader.neutral, trader.negative);
      positive += trader.positive;
      neutral += trader.neutral;
      negative += trader.negative;
    });
    cycle += 1;
    thisCycle += 1;
  }

  //Output results
  console.log("\n*****************************************************************\n");
  console.log("Data cycle: ", dataCycle, " S eps: ", ds.universe.get('S').eps);
  console.log("Data cycle: ", dataCycle, " P eps: ", ds.universe.get('P').eps);
  console.log("Data cycle: ", dataCycle, " Q eps: ", ds.universe.get('Q').eps);
  console.log("Data cycle: ", dataCycle, " R eps: ", ds.universe.get('R').eps);
  console.log("Data cycle: ", dataCycle, " S price: ", ds.universe.get('S').price[0]);
  console.log("Data cycle: ", dataCycle, " P price: ", ds.universe.get('P').price[0]);
  console.log("Data cycle: ", dataCycle, " Q price: ", ds.universe.get('Q').price[0]);
  console.log("Data cycle: ", dataCycle, " R price: ", ds.universe.get('R').price[0]);


  //Save results to data store
  ds.cycles.push(new Cycle(cycle, dataCycle, ds.universe));

  const wealth = new Map();
  ds.cash.forEach((balance, name) => wealth.set(name, balance[0]));
  //console.log("Cash:");
  //ds.cash.forEach((balance, name) => console.log(name, ": ", balance[0]));
  //ds.portfolio.forEach((trader, name) => {
  //  console.log(name, "Portfolio value: ", trader[0].reduce((acc, stock) => acc + stock[1]*ds.universe.get(stock[0]).price[0], 0));
  //});
  ds.portfolio.forEach((trader, name) => {
    wealth.set(name, wealth.get(name) + trader[0].reduce((acc, stock) => acc + stock[1]*ds.universe.get(stock[0]).price[0], 0));
  });
  //ds.portfolio.forEach((trader, name) => {
  //  console.log(name, "Portfolio holdings: ", trader[0].map(stock => [stock[1], ds.universe.get(stock[0]).price[0]]));
  //});
  console.log("Wealth: ", wealth);

  console.log("Positive: ", positive, " Neutral: ", neutral, " Negative: ", negative);

  //Next dataCycle fundamental stock data
  if (dataCycle === 0) {
    ds.universe.get('S').eps += impulse/2;
    ds.universe.get('S').book *= impulse/2;
    ds.universe.get('P').eps *= impulse/2;
    ds.universe.get('P').book *= impulse/2;
    ds.universe.get('Q').eps /= impulse/2;
    ds.universe.get('Q').book /= impulse/2;
    ds.universe.get('R').eps /= impulse/2;
    ds.universe.get('R').book /= impulse/2;
  } else if (dataCycle > 0 && dataCycle < dataLimit && dataCycle % 2 === 1) {
    ds.universe.get('S').eps -= impulse;
    ds.universe.get('S').book /= impulse;
    ds.universe.get('P').eps /= impulse;
    ds.universe.get('P').book /= impulse;
    ds.universe.get('Q').eps *= impulse;
    ds.universe.get('Q').book *= impulse;
    ds.universe.get('R').eps *= impulse;
    ds.universe.get('R').book *= impulse;
  } else if (dataCycle > 0 && dataCycle < dataLimit && dataCycle % 2 === 0) {
    ds.universe.get('S').eps += impulse;
    ds.universe.get('S').book *= impulse;
    ds.universe.get('P').eps *= impulse;
    ds.universe.get('P').book *= impulse;
    ds.universe.get('Q').eps /= impulse;
    ds.universe.get('Q').book /= impulse;
    ds.universe.get('R').eps /= impulse;
    ds.universe.get('R').book /= impulse;
  } else {
    ds.universe.get('S').eps -= impulse/2;
    ds.universe.get('S').book /= impulse/2;
    ds.universe.get('P').eps /= impulse/2;
    ds.universe.get('P').book /= impulse/2;
    ds.universe.get('Q').eps *= impulse/2;
    ds.universe.get('Q').book *= impulse/2;
    ds.universe.get('R').eps *= impulse/2;
    ds.universe.get('R').book *= impulse/2;
  }
  dataCycle += 1; 
}

console.log('Start: ', ds.cycles[0].cycleIndex);

CreateSVG(ds.universe, ds.portfolio, ds.cash, ds.cycles);

