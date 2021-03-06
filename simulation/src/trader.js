'use strict';

class Trader{
  constructor(name, parameters, portfolio, cash, universe, spread = 0.05, maxTrade = 100) {
    this.name = name;
    this.parameters = [...parameters];
    this.portfolio = new Map(portfolio);
    this.cash = cash;
    this.universe = universe;
    this.spread = spread;
    this.positive = 0;
    this.neutral = 0;
    this.negative = 0;
    this.maxTrade = maxTrade;
  }

  tradeLimits(ticker){
    if (!this.universe.has(ticker)) return undefined;
    const price = this.universe.get(ticker).price[0];
    const buyLimit = Math.min(this.maxTrade, 0.5 * this.cash/price);
    const sellLimit = this.portfolio.has(ticker) ? Math.min(this.maxTrade, this.portfolio.get(ticker)) : undefined;
    return [buyLimit, sellLimit];
  }

  evaluate(ticker){
    if (!this.universe.has(ticker)) return undefined;
    const price = this.universe.get(ticker).price[0];

    //Compute quality score for this stock and the portfolio. Low score is good.
    let scores = [];
    let score = 0;
    this.universe.forEach((stock, tick) => {
      const mom = this.parameters.length > 3 && stock.price[0] - stock.price[1] < 0 ? this.parameters[3] : this.parameters[2];
      const scr = (
        this.parameters[0] * stock.price[0]/stock.book +
        this.parameters[1] * stock.eps/(0.1 + stock.price[0]) +
        mom * (stock.price[0] - stock.price[1]) / (0.1 + stock.price[1]));
        if (ticker === tick) score = scr;
        if (this.portfolio.has(tick)) scores.push(scr);
    });

    //Compare to the portfolio averages
    const qualityInertia = this.parameters[4] === undefined ? 1.0 : this.parameters[4];
    const quality = this.portfolio.size * score * qualityInertia <= scores.reduce((x, acc) => x + acc , 0);
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
    const quantityInertia = this.parameters[5] === undefined ? 1.0 : this.parameters[5];
    const quantity = this.portfolio.size * value * quantityInertia <= values.reduce((x, acc) => x + acc, 0);
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

    //console.log("Quality: ", quality, this.evaluate(ticker));
    //console.log("Quantity: ", quantity, this.weighting(ticker));

    //Compute bid/ask price and share
    let askPrice, askShares, bidPrice, bidShares;
    
    if (quality && quantity) {
      [bidPrice, bidShares] = [price + 2 * this.spread, buyLimit];
      [askPrice, askShares] = [price + 4 * this.spread, sellLimit];
      this.positive += 1;
    }
    if ((quality && !quantity) || (!quality && quantity)){
      [bidPrice, bidShares] = [Math.max(0, price - this.spread), buyLimit];
      [askPrice, askShares] = [price + this.spread, sellLimit];
      this.neutral += 1;
    }
     if (!quality && !quantity) {
      [bidPrice, bidShares] = [Math.max(0, price - 4 * this.spread), buyLimit];
      [askPrice, askShares] = [Math.max(this.spread, price - 2 * this.spread), sellLimit];
      this.negative += 1;
    }
    return {'bidPrice': bidPrice, 'bidShares': bidShares, 'askPrice': askPrice, 'askShares': askShares};
  }
}

module.exports = Trader;



