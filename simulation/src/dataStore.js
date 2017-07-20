'use strict';

const Stock = require('./stock.js');
const Trader = require('./trader.js');

class DataStore{
  constructor(stockList, traderList, assetList, ){
    
    //stockList is an array of Stock objects
    this.universe = new Map(stockList.map(stock => [stock.ticker, stock]));

    //assetList is an array [trader name, array of portfolio holdings, array of cash holdings]
    //array of porfolio holdings is an array of periods, each holding an array of stocks held in that period
    //Stocks held in the period is an array of the ticker and number of shares held
    //cash holdings is an array of cash balance for each period
    this.portfolio = new Map(assetList.map(x => [x[0], x[1]));
    this.cash = new Map(assetList.map(x => [x[0], x[2]));

    //traderList is an array of trader names, an array of evaluation parameters, and the trader's spread parameter
    this.traderList = traderList;
  }
}
