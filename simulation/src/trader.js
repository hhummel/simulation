'use strict';

class Trader{
  constructor(name, parameters, portfolio, cash, universe, spread = 0.05) {
    this.name = name;
    this.parameters = [...parameters];
    this.portfolio = new Map(portfolio);
    this.cash = cash;
    this.universe = universe;
    this.spread = spread;

  }

  bidAsk(ticker){
    if (!this.universe.has(ticker)) return undefined;
    const price = this.universe.get(ticker).price[0];

    //Compute quality score and value of holdings for this stock and the portfolio. Low score is good.
    let [scores, values] = [[], []];
    let [score, value] = [0, 0];
    this.universe.forEach((stock, tick, uni) => {
      const scr = (
        this.parameters[0] * stock.price[0]/stock.book +
        this.parameters[1] * stock.eps/(0.1 + stock.price[0]) +
        this.parameters[2] * (stock.price[1] - stock.price[0]) / (0.1 + stock.price[1]));
      scores.push(scr);
      const val = this.portfolio.has(ticker) ? this.portfolio.get(ticker) * stock.price[0] : 0;
      values.push(val);
      if (ticker === tick) {
        score = scr;
        value = val;
      }
    });

    //Compare to the portfolio averages
    const quality = this.portfolio.size * score < scores.reduce((x, acc) => x + acc);
    const quantity = this.portfolio.size * value < values.reduce((x, acc) => x + acc);
    let askPrice, askShares, bidPrice, bidShares;
    if (quality && quantity) {
      [bidPrice, bidShares] = [price, 100];
      [askPrice, askShares] = this.portfolio.has(ticker) ? [price + 2 * this.spread, 100] : [undefined, undefined];
    }
    if ((quality && !quantity) || (!quality && quantity)){
      [bidPrice, bidShares] = [price - this.spread, 100];
      [askPrice, askShares] = this.portfolio.has(ticker) ? [price + this.spread, 100] : [undefined, undefined];
    }
     if (!quality && !quantity) {
      [bidPrice, bidShares] = [undefined, undefined];
      [askPrice, askShares] = this.portfolio.has(ticker) ? [price, 100] : [undefined, undefined];
    }
      

    //const [askPrice, askShares] = this.portfolio.has(ticker) ? [price + this.spread, 0] : [undefined, undefined];
    //const [bidPrice, bidShares] = [price - this.spread, 0];
    return {'bidPrice': bidPrice, 'bidShares': bidShares, 'askPrice': askPrice, 'askShares': askShares};
  }
}

module.exports = Trader;



