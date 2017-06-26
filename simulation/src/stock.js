'use strict';

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

module.exports = Stock;


