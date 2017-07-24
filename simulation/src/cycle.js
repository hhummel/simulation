class Cycle{
  constructor(cycleIndex, dataCycleIndex, universe) {
    this.cycleIndex = cycleIndex;
    this.dataCycleIndex = dataCycleIndex;
    this.stockData = new Map();
    universe.forEach((stock, ticker) => this.stockData.set(ticker, [stock.eps, stock.book, stock.price[0]]));
  }
}

module.exports = Cycle;
