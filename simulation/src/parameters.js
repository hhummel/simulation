'use strict';

class Parameters{
  constructor() {
    this.mom = 1.0;
    this.impulse = 3.0;
    this.limit = 100000;
    this.dataLimit = 20;
    this.cycleLimit = 100;
    this.stockList = '1';
    this.traderList = '2';
    this.initialAssets = '1';
    this.xscale = 0.5;
    this.yscale = 10.0;
    this.filter = 2.0;
    this.greenDot = 70.0;
  }
}

const parameters = new Parameters();
module.exports = parameters;
