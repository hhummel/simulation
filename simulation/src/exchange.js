'use strict';

const Stock = require('./stock');
const Trader = require('./trader');

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
  
  //Finds array of trades at min ask and max bid for each stock from order book.  Prices at midpoint.
  getTrades(book){
    if (book.size === 0) return {};
    const trades = [];
    book.forEach((stockBook, tick) => {

      //Set price at midpoint of bid and ask
      const price = 0.5 * (stockBook.bid[0][1] + stockBook.ask[0][1]);

      //Find total prospective bid and ask shares. 
      const bidTot = stockBook.bid.reduce((acc, x) => x[2] + acc, 0);
      const askTot = stockBook.ask.reduce((acc, x) => x[2] + acc, 0);

      //Trader name, ticker, price, shares.  If shares bid < shares ask, allocate shares ask
      if (bidTot < askTot) {
        trades.push(stockBook.bid.map((x) => [x[0], tick, price, x[2]]));
        trades.push(stockBook.ask.map((x) => [x[0], tick, price, -x[2] * bidTot / askTot]));
  
      //Otherwise, allocate shares bid
      } else {
        trades.push(stockBook.bid.map((x) => [x[0], tick, price, x[2] * askTot / bidTot]));
        trades.push(stockBook.ask.map((x) => [x[0], tick, price, -x[2]]));
      }
    });

    //Flatten.  Implies each part of trade is independent, as with a clearing house.
    return trades.reduce((acc, x) => acc.concat(x), []);
  }

  //Mutate stock prices from trades.  If there are no trades, keep prices the same for this cycle.
  updatePrices(trades){
    //Make a map of prices from trades for ticker t[1] and price t[2]
    const update = new Map();
    trades.forEach(t => {if (!update.has(t[1])) update.set(t[1], t[2])});
    
    //Update price history of stocks in universe.  Better to return a new universe
    this.universe.forEach((stock, ticker) => stock.price.unshift(update.has(ticker) ? update.get(ticker) : stock.price[0]));
    return update;
  }

  //Update trader portfolios
  updatePortfolios(trades){
  }

  //Update stock prices and trader portfolios.  If there are no trades, keep prices the same for this cycle.
  clearTrades(trades){
  }
}

module.exports = Exchange;
