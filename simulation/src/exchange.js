'use strict';

const Stock = require('./stock.js');
const Trader = require('./trader.js');

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
