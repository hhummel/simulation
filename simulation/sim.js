const universe = new Map();

class Stock{
  constructor(ticker, outstanding, priceBook, eps, price, vol=1.0, cor=1.0) {
    this.ticker = ticker;
    this.outstanding = outstanding;
    this.priceBook = priceBook;
    this.eps = eps;
    this.price = [...price];
    this.vol = vol;
    this.cor = cor;
  }
}

class Trader{
  constructor(parameters, portfolio, cash) {
    this.parameters = [...parameters];
    this.portfolio = new Map(portfolio);
    this.cash = cash;
  }

  bidAsk(ticker){
    if (!universe.has(ticker)) return undefined;
    const price = universe.get(ticker).price[0];
    const spread = 0.05;
    const [askPrice, askShares] = this.portfolio.has(ticker) ? [price + spread, 0] : [undefined, undefined];
    const [bidPrice, bidShares] = [price - spread, 0];
    return {'bidPrice': bidPrice, 'bidShares': bidShares, 'askPrice': askPrice, 'askShares': askShares};
  }
}


