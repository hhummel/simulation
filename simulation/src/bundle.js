/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 2);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


class Stock{
  constructor(ticker, outstanding, book, eps, price, vol=1.0, cor=1.0) {
    this.ticker = ticker;
    this.outstanding = outstanding;
    this.book = book;
    this.eps = eps;
    this.price = [...price];
    this.vol = vol;
    this.cor = cor;
  }
}

module.exports = Stock;




/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


class Trader{
  constructor(name, parameters, portfolio, cash, universe, spread = 0.05) {
    this.name = name;
    this.parameters = [...parameters];
    this.portfolio = new Map(portfolio);
    this.cash = cash;
    this.universe = universe;
    this.spread = spread;
  }

  tradeLimits(ticker){
    if (!this.universe.has(ticker)) return undefined;
    const price = this.universe.get(ticker).price[0];
    const buyLimit = Math.min(100, 0.5 * this.cash/price);
    const sellLimit = this.portfolio.has(ticker) ? Math.min(100, this.portfolio.get(ticker)) : undefined;
    return [buyLimit, sellLimit];
  }

  evaluate(ticker){
    if (!this.universe.has(ticker)) return undefined;
    const price = this.universe.get(ticker).price[0];

    //Compute quality score for this stock and the portfolio. Low score is good.
    let scores = [];
    let score = 0;
    this.universe.forEach((stock, tick) => {
      const scr = (
        this.parameters[0] * stock.price[0]/stock.book +
        this.parameters[1] * stock.eps/(0.1 + stock.price[0]) +
        this.parameters[2] * (stock.price[0] - stock.price[1]) / (0.1 + stock.price[1]));
        if (ticker === tick) score = scr;
        if (this.portfolio.has(tick)) scores.push(scr);
    });

    //Compare to the portfolio averages
    const quality = this.portfolio.size * score <= scores.reduce((x, acc) => x + acc , 0);
    return {'quality': quality, 'score': score, 'scores': scores};
  }

  weighting(ticker){
    if (!this.universe.has(ticker)) return undefined;
    const price = this.universe.get(ticker).price[0];

    //Compute value weighting of holdings for this stock in the portfolio.
    let values = [];
    let value = 0;
    this.portfolio.forEach((stock, tick) => {
      const val = stock * this.universe.get(tick).price[0];
      values.push(val);
      if (ticker === tick) value = val;
    });

    //Compare to the portfolio averages
    const quantity = this.portfolio.size * value <= values.reduce((x, acc) => x + acc, 0);
    return {'quantity': quantity, 'value': value, 'values': values};
  }

  bidAsk(ticker){
    if (!this.universe.has(ticker)) return undefined;
    const price = this.universe.get(ticker).price[0];
    
    //Find the allowed trade amounts
    const [buyLimit, sellLimit] = this.tradeLimits(ticker);

    //Compare this ticker with portfolio averages using destructuring syntax
    const {quality} = this.evaluate(ticker);
    const {quantity} = this.weighting(ticker);

    //Compute bid/ask price and share
    let askPrice, askShares, bidPrice, bidShares;
    
    if (quality && quantity) {
      [bidPrice, bidShares] = [price + 2 * this.spread, buyLimit];
      [askPrice, askShares] = [price + 4 * this.spread, sellLimit];
    }
    if ((quality && !quantity) || (!quality && quantity)){
      [bidPrice, bidShares] = [Math.max(0, price - this.spread), buyLimit];
      [askPrice, askShares] = [price + this.spread, sellLimit];
    }
     if (!quality && !quantity) {
      //[bidPrice, bidShares] = [undefined, undefined];
      //[askPrice, askShares] = [price - 2 * this.spread, sellLimit];
      [bidPrice, bidShares] = [Math.max(0, price - 4 * this.spread), buyLimit];
      [askPrice, askShares] = [Math.max(this.spread, price - 2 * this.spread), sellLimit];
    }
    return {'bidPrice': bidPrice, 'bidShares': bidShares, 'askPrice': askPrice, 'askShares': askShares};
  }
}

module.exports = Trader;





/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


//Initialization

const Stock = __webpack_require__(0);
const Trader = __webpack_require__(1);
const Exchange = __webpack_require__(3);
const CreateSVG = __webpack_require__(4);

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



/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const Stock = __webpack_require__(0);
const Trader = __webpack_require__(1);

class Exchange{
  constructor(universe, traders){
    this.universe = universe;
    this.traders = traders;
  }

  //Assembles the bid and ask trades from the current sets of prices, traders and stock universe 
  getOrderBook(){
    const book = new Map();
    this.universe.forEach((stock, tick) => {
      let [bid, ask] = [0, Number.MAX_SAFE_INTEGER]; 

      //Set bid and ask from highest bid and lowest ask
      this.traders.forEach(trader => {
        let bidAsk = trader.bidAsk(tick);
        if (bidAsk.askPrice < ask && bidAsk.askShares !== undefined) ask = bidAsk.askPrice;
        if (bidAsk.bidPrice > bid && bidAsk.bidShares !== undefined) bid = bidAsk.bidPrice;
        //console.log(tick, trader.name, bidAsk);
      });
      
      //Record trade opportunities.  Only offers at the bid/ask limits are considered
      //console.log(tick, bid, ask);
      if (bid >= ask) {
        const stockBook = {'bid':[], 'ask':[]};
        this.traders.forEach(trader => {
          let bidAsk = trader.bidAsk(tick);
          if (bidAsk.bidPrice >= ask && bidAsk.bidShares > 1) stockBook.bid.push([trader.name, bidAsk.bidPrice, bidAsk.bidShares]);
          if (bidAsk.askPrice <= bid && bidAsk.askShares != undefined && bidAsk.askShares > 1) {
            stockBook.ask.push([trader.name, bidAsk.askPrice, bidAsk.askShares]);
          }
        });
      book.set(tick, stockBook);
      }
    });
    return book;
  }
  
  //Finds array of trades at min ask and max bid for each stock from order book.  Prices at midpoint.
  getTrades(book){
    if (book.size === 0) return {};
    const trades = [];
    book.forEach((stockBook, tick) => {

      //Set price at midpoint of bid and ask
      const minAsk = Math.min(...stockBook.ask.map(x => x[1]));
      const maxBid = Math.max(...stockBook.bid.map(x => x[1]));
      const price = 0.5 * (minAsk + maxBid);

      //Filter out stockBook where ask>price and bid<price
      const newAsk = stockBook.ask.filter(x => x[1] <= price);
      const newBid = stockBook.bid.filter(x => x[1] >= price);

      //Find total prospective bid and ask shares. 
      const bidTot = newBid.reduce((acc, x) => x[2] + acc, 0);
      const askTot = newAsk.reduce((acc, x) => x[2] + acc, 0);


      //Trader name, ticker, price, shares.  If shares bid < shares ask, allocate shares ask
      if (bidTot < askTot) {
        trades.push(newBid.map((x) => [x[0], tick, price, x[2]]));
        trades.push(newAsk.map((x) => [x[0], tick, price, -x[2] * bidTot / askTot]));
  
      //Otherwise, allocate shares bid
      } else {
        trades.push(newBid.map((x) => [x[0], tick, price, x[2] * askTot / bidTot]));
        trades.push(newAsk.map((x) => [x[0], tick, price, -x[2]]));
      }
    });

    //Flatten.  Implies each part of trade is independent, as with a clearing house.
    return trades.reduce((acc, x) => acc.concat(x), []);
  }

  //Return new Maps for prices, portfolios and cash balances after this cycle 
  getUpdates(trades){
    const [newPrice, newPort, newCash] = [new Map(), new Map(), new Map()];

    //Get prices for stocks with trades
    trades.forEach(t => {if (!newPrice.has(t[1])) newPrice.set(t[1], t[2])});

    //Update or set portfolio stock balance and cash balance. trade[0]: trader, trade[1]: ticker, trade[2]: price, trade[3]: shares
    this.traders.forEach((trader, traderName) => {
      newPort.set(traderName, trader.portfolio);
      newCash.set(traderName, trader.cash);
    });
    trades.forEach(trade => {
      newPort.get(trade[0]).set(trade[1], newPort.get(trade[0]).has(trade[1]) ? newPort.get(trade[0]).get(trade[1]) + trade[3] : trade[3]);
      newCash.set(trade[0], newCash.get(trade[0]) - trade[2] * trade[3]);
    });
    return [newPrice, newPort, newCash];
  }

  //Update stock prices and trader portfolios and cash balances.  If there are no trades, keep prices the same for this cycle.
  commitUpdates(newPrice, newPort, newCash){
    //Update price history of stocks in universe.  Better to return a new universe
    this.universe.forEach((stock, ticker) => stock.price.unshift(newPrice.has(ticker) ? newPrice.get(ticker) : stock.price[0]));
  }
  
}

module.exports = Exchange;


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


        let xmlns = "http://www.w3.org/2000/svg";
        let xscale = 0.6;
        let yscale = 20.0;
        let state = {
          'v': [[-1, 5], [7, 4], [3, 7], [-1, 8], [11, 2], [3, 13], [-13, 7], [2, 6], [3, 13], [-13, 7], [0, 6]],
          'x': [[230, 53], [63, 270], [51, 170], [270, 270], [100, 133], [133, 83], [50, 200], [47, 47], [238, 53], [68, 270], [58, 170]],
          'fill': ['blue', 'green', 'yellow', 'red', 'pink', 'purple', 'orange', 'grey', 'blue', 'green', 'yellow']
        };
        let circles = [];
        
        function CreateSVG (universe, portfolio, cash) {
            console.log("CreateSVG universe: ", universe);
            console.log("CreateSVG portfolio: ", portfolio);
            console.log("CreateSVG cash: ", cash);

            var boxWidth = 790;
            var boxHeight = 790;

            var svgElem = document.createElementNS (xmlns, "svg");
            //svgElem.setAttributeNS (null, "viewBox", "0 0 " + boxWidth + " " + boxHeight);
            svgElem.setAttributeNS (null, "width", boxWidth);
            svgElem.setAttributeNS (null, "height", boxHeight);
            svgElem.style.display = "block";

            var g = document.createElementNS (xmlns, "g");
            svgElem.appendChild (g);
            g.setAttributeNS (null, 'transform', 'matrix(1,0,0,-1,0,790)');

            // draw borders
            var coords = "M 0, 0";
            coords += " l 0, 790";
            coords += " l 790, 0";
            coords += " l 0, -790";
            coords += " l -790, 0";

            var path = document.createElementNS (xmlns, "path");
            path.setAttributeNS (null, 'stroke', "#000000");
            path.setAttributeNS (null, 'stroke-width', 10);
            path.setAttributeNS (null, 'stroke-linejoin', "round");
            path.setAttributeNS (null, 'd', coords);
            path.setAttributeNS (null, 'fill', "white");
            path.setAttributeNS (null, 'opacity', 1.0);
            g.appendChild (path);

            const colors = new Map([['S', 'pink'], ['P', 'purple'], ['Q', 'blue'], ['R', 'red']]); 
  
            universe.forEach((stock, ticker) => stock.price.forEach((price, index) => {
                circles.push(createCircle(xscale*(stock.price.length - index), yscale*price, colors.get(ticker)));
              }));

            circles.forEach(circle => g.appendChild(circle));

            document.addEventListener('keypress', (event) => shiftState(circles, state, event), false);

            var svgContainer = document.getElementById ("svgContainer");
            svgContainer.appendChild (svgElem);
        }

        function createCircle(cx, cy, fill){
            let circle = document.createElementNS (xmlns, "circle");
            circle.setAttributeNS (null, 'stroke', "#000000");
            circle.setAttributeNS (null, 'stroke-width', 1);
            circle.setAttributeNS (null, 'cx', cx);
            circle.setAttributeNS (null, 'cy', cy);
            circle.setAttributeNS (null, 'fill', fill);
            circle.setAttributeNS (null, 'r', '5');
            circle.setAttributeNS (null, 'opacity', 1.0);
            return circle;
        }

        function shiftState(circles, state, event){
          //for (let i in circles) shift(circles[i], state.x[i], state.v[i], event);
          for (let i in circles){
            for (let j in circles) {
              if (j > i){
                let dsquared = (state.x[i][0] - state.x[j][0])**2 + (state.x[i][1] - state.x[j][1])**2;
                if (dsquared < 1500) {
                  let vix = state.v[i][0] + Math.random();
                  let viy = state.v[i][1] + Math.random();
                  state.v[i][0] = -state.v[j][1] + Math.random();
                  state.v[i][1] = -state.v[j][0] + Math.random();
                  state.v[j][0] = -viy;
                  state.v[j][1] = -vix;
                }
              }
            }
          }
          for (let i in circles) shift(circles[i], state.x[i], state.v[i], event);
        }

        function shift(e, x, v, event){
          if ((x[0] > 342 && v[0] > 0) || (x[0] < 47 && v[0] < 0)) v[0] = -v[0];
          if ((x[1] > 342 && v[1] > 0) || (x[1] < 47 && v[1] < 0)) v[1] = -v[1];
          x[0] += v[0]/scale;
          x[1] += v[1]/scale;
          e.setAttribute('cx', x[0]);
          e.setAttribute('cy', x[1]);
       }

module.exports = CreateSVG;



/***/ })
/******/ ]);