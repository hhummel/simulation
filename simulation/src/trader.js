'use strict';

class Trader{
  constructor(name, parameters, portfolio, cash, universe) {
    this.name = name;
    this.parameters = [...parameters];
    this.portfolio = new Map(portfolio);
    this.cash = cash;
    this.universe = universe;
  }

  bidAsk(ticker){
    if (!this.universe.has(ticker)) return undefined;
    const price = this.universe.get(ticker).price[0];
    const spread = 0.05;
    const [askPrice, askShares] = this.portfolio.has(ticker) ? [price + spread, 0] : [undefined, undefined];
    const [bidPrice, bidShares] = [price - spread, 0];
    return {'bidPrice': bidPrice, 'bidShares': bidShares, 'askPrice': askPrice, 'askShares': askShares};
  }
}

module.exports = Trader;



