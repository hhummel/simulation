const Stock = require('./stock.js');

const stockLists = {
  '0': [
    new Stock('S', 8200, 10.0, -4.0, [10.0, 11.0, 12.0]),
    new Stock('P', 14300, 5.0, 2.0, [22.0, 21.0, 20.0]),
    new Stock('Q', 8300, 35.0, 0.5, [30.0, 30.5, 31.0]),
    new Stock('R', 7900, 15.0, 0.5, [5.0, 3.0, 1.0]),
  ],
  '1': [
    new Stock('S', 8200, 10.0, -4.0, [5.0, 5.0, 5.0]),
    new Stock('P', 14300, 5.0, 2.0, [6.0, 6.0, 6.0]),
    new Stock('Q', 8300, 35.0, 0.5, [15.0, 15.0, 15.0]),
    new Stock('R', 7900, 15.0, 0.5, [18.0, 18.0, 18.0]),
  ],
};

module.exports = stockLists;
