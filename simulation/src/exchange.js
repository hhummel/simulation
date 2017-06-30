'use strict';

const Stock = require('./stock');
const Trader = require('./trader');

class Exchange{
  constructor(universe, traders){
    this.universe = universe;
    this.traders = traders;
  }

  getOrderBook(){
    const book = new Map();
    this.universe.forEach((stock, tick) => {
      let [bid, ask] = [0, Number.MAX_SAFE_INTEGER]; 

      //Set bid and ask from highest bid and lowest ask
      this.traders.forEach(trader => {
        let bidAsk = trader.bidAsk(tick);
        if (bidAsk.askPrice < ask && bidAsk.askShares !== undefined) ask = bidAsk.askPrice;
        if (bidAsk.bidPrice > bid && bidAsk.bidShares !== undefined) bid = bidAsk.bidPrice;
      });
      
      //Record trade opportunities.  Only offers at the bid/ask limits are considered
      if (bid >= ask) {
        const stockBook = {'bid':[], 'ask':[]};
        this.traders.forEach(trader => {
          let bidAsk = trader.bidAsk(tick);
          if (bidAsk.bidPrice >= ask) stockBook.bid.push([trader.name, bidAsk.bidPrice, bidAsk.bidShares]);
          if (bidAsk.askPrice <= bid) stockBook.ask.push([trader.name, bidAsk.askPrice, bidAsk.askShares]);
        });
      book.set(tick, stockBook);
      }
    });
    return book;
  }
  
  getTrades(book){
    if (book.size === 0) return {};
    const trades = new Map();
    book.forEach((stockBook, tick) => {

      //Set price at midpoint of bid and ask
      const price = 0.5 * (stockBook.bid[0][1] + stockBook.ask[0][1]);

      //If the total bid shares are less than the total ask shares, trade the requested bid shares, else allocate 
      const [bidTot, askTot] = [stockBook.bid.reduce((x, acc) => x[2] + acc, 0), stockBook.ask.reduce((x, acc) => x[2] + acc, 0)];

      
      if (bidTot < askTot) {

      } else {

      }
    });
    return {};
  }
}

module.exports = Exchange;
