const expect = require('chai').expect;
const Stock = require('../src/stock');
const Trader = require('../src/trader');

describe("Market Simulation", function() {
  describe("Stock", function() {
    it("makes a Stock object with expected ticker, outstandings, book value, eps and prices", function(){
      const s = new Stock('S', 1000, 2.0, 1.0, [10.0, 11.0, 12.0]);
      expect(s.ticker).to.equal('S');
      expect(s.outstanding).to.equal(1000);
      expect(s.book).to.equal(2.0);
      expect(s.eps).to.equal(1.0);
      expect(s.price[0]).to.equal(10.0);
      expect(s.price.length).to.equal(3);
    });
  });

  describe("Trader", function() {
    it("makes a Trader object with correct name, parameters, portfolio, cash and universe", function(){
      const s = new Stock('S', 1000, 2.0, 1.0, [10.0, 11.0, 12.0]);
      const p = new Stock('P', 3000, 1.0, 2.0, [20.0, 21.0, 22.0]);
      const q = new Stock('Q', 4000, 0.5, 3.0, [30.0, 31.0, 32.0]);
      const universe = new Map([[s.ticker, s], [p.ticker, p], [q.ticker, q]]);
      const t = new Trader('Tom', [0,1,2], [['S', 100], ['P', 200]], 500.00, universe); 
      expect(t.name).to.equal('Tom');
      expect(t.parameters[1]).to.equal(1);
      expect(t.parameters.length).to.equal(3);
      expect(t.portfolio.get('S')).to.equal(100);
      expect(t.portfolio.has('Q')).to.equal(false);
      expect(t.cash).to.equal(500.00);
      expect(t.universe.get('Q')).to.equal(q);
      expect(t.universe.get('Q').outstanding).to.equal(4000);
      expect(t.universe).deep.equal(universe);
    });

    it("bidAsk method works correctly", function(){
      const s = new Stock('S', 1000, 2.0, 1.0, [10.0, 11.0, 12.0]);
      const p = new Stock('P', 3000, 1.0, 2.0, [20.0, 21.0, 22.0]);
      const q = new Stock('Q', 4000, 0.5, 3.0, [30.0, 31.0, 32.0]);
      const universe = new Map([[s.ticker, s], [p.ticker, p], [q.ticker, q]]);
      const t = new Trader('Tom', [0,1,2], [['S', 100], ['P', 200]], 500.00, universe); 
      
      //Shares held
      expect(t.bidAsk('S')['bidPrice']).to.equal(9.95);
      expect(t.bidAsk('S')['bidShares']).to.equal(0);
      expect(t.bidAsk('S')['askPrice']).to.equal(10.05);
      expect(t.bidAsk('S')['askShares']).to.equal(0);

      //Missing from universe
      expect(t.bidAsk('R')).to.equal(undefined);

      //Shares not held
      expect(t.bidAsk('Q')['bidPrice']).to.equal(29.95);
      expect(t.bidAsk('Q')['bidShares']).to.equal(0);
      expect(t.bidAsk('Q')['askPrice']).to.equal(undefined);
      expect(t.bidAsk('Q')['askShares']).to.equal(undefined);
    });
  });

});
