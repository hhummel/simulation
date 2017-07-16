'use strict';

const Stock = require('./stock.js');
const Trader = require('./trader.js');

class DataStore{
  constructor(universe, traders){
    this.universe = universe;
    this.traders = traders;
  }
}
