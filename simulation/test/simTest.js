const expect = require('chai').expect;
const Stock = require('../src/stock');
const Trader = require('../src/trader');
const Exchange = require('../src/exchange');

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

    it("tradeLimits works correctly", function(){
      const s = new Stock('S', 1000, 2.0, 1.0, [10.0, 11.0, 12.0]);
      const p = new Stock('P', 3000, 1.0, 2.0, [20.0, 21.0, 22.0]);
      const q = new Stock('Q', 4000, 0.5, 3.0, [30.0, 31.0, 32.0]);
      const universe = new Map([[s.ticker, s], [p.ticker, p], [q.ticker, q]]);
      const t = new Trader('Tom', [0,1,2], [['S', 100], ['P', 200]], 500.00, universe); 
      expect(t.tradeLimits('S')).deep.equal([0.5*500/10, 100]);
      expect(t.tradeLimits('Q')).deep.equal([0.5*500/30, undefined]);
      expect(t.tradeLimits('R')).to.equal(undefined);   
    });

    it("evaluate method works correctly", function(){
      const s = new Stock('S', 1000, 2.0, 1.0, [10.0, 11.0, 12.0]);
      const p = new Stock('P', 3000, 1.0, 2.0, [20.0, 21.0, 22.0]);
      const q = new Stock('Q', 4000, 0.5, 3.0, [30.0, 31.0, 32.0]);
      const universe = new Map([[s.ticker, s], [p.ticker, p], [q.ticker, q]]);
      const t = new Trader('Tom', [1,1,-2], [['S', 100], ['P', 200]], 500.00, universe); 
      expect(t.evaluate('S')).deep.equals({
        'quality': true, 
        'score': 5.2791900811702792, 
        'scores': [5.2791900811702792, 20.19428921742000893]});
      expect(t.evaluate('Q')).deep.equals({
        'quality': false, 
        'score': 60.1639764557584, 
        'scores': [5.2791900811702792, 20.19428921742000893]});
      const j = new Trader('Tom', [1,1,-2], [], 500.00, universe); 
      expect(j.evaluate('S')).deep.equals({
        'quality': true, 
        'score': 5.2791900811702792, 
        'scores': []});
    });

    it("weighting method works correctly", function(){
      const s = new Stock('S', 1000, 2.0, 1.0, [10.0, 11.0, 12.0]);
      const p = new Stock('P', 3000, 1.0, 2.0, [20.0, 21.0, 22.0]);
      const q = new Stock('Q', 4000, 0.5, 3.0, [30.0, 31.0, 32.0]);
      const universe = new Map([[s.ticker, s], [p.ticker, p], [q.ticker, q]]);
      const t = new Trader('Tom', [1,1,-2], [['S', 100], ['P', 200]], 500.00, universe); 
      expect(t.weighting('S')).deep.equals({
        'quantity': true, 
        'value': 1000.0, 
        'values': [1000.0, 4000.0]});
      expect(t.weighting('P')).deep.equals({
        'quantity': false, 
        'value': 4000.0, 
        'values': [1000.0, 4000.0]});
      const j = new Trader('Tom', [1,1,-2], [], 500.00, universe); 
      expect(j.weighting('S')).deep.equals({
        'quantity': true, 
        'value': 0, 
        'values': []});
    });

    it("bidAsk method works correctly", function(){
      const s = new Stock('S', 1000, 2.0, 1.0, [10.0, 11.0, 12.0]);
      const p = new Stock('P', 3000, 1.0, 2.0, [20.0, 21.0, 22.0]);
      const q = new Stock('Q', 4000, 0.5, 3.0, [30.0, 31.0, 32.0]);
      const universe = new Map([[s.ticker, s], [p.ticker, p], [q.ticker, q]]);
      const t = new Trader('Tom', [1,1,-2], [['S', 100], ['P', 200]], 500.00, universe); 
      
      //Shares held
      expect(t.bidAsk('S')['bidPrice']).to.equal(10.1);
      expect(t.bidAsk('S')['bidShares']).to.equal(25);
      expect(t.bidAsk('S')['askPrice']).to.equal(10.2);
      expect(t.bidAsk('S')['askShares']).to.equal(100);

      //Missing from universe
      expect(t.bidAsk('R')).to.equal(undefined);

      //Shares not held
      expect(t.bidAsk('Q')['bidPrice']).to.equal(29.95);
      expect(t.bidAsk('Q')['bidShares']).to.equal(8.333333333333334);
      expect(t.bidAsk('Q')['askPrice']).to.equal(30.05);
      expect(t.bidAsk('Q')['askShares']).to.equal(undefined);
    });
  });

  describe("Exchange", function() {
    it("gets order book", function(){
      const s = new Stock('S', 1000, 15.0, 0.5, [10.0, 11.0, 12.0]);
      const p = new Stock('P', 3000, 10.0, 2.0, [25.0, 21.0, 18.0]);
      const q = new Stock('Q', 4000, 5.0, 10.0, [30.0, 31.0, 32.0]);
      const universe = new Map([[s.ticker, s], [p.ticker, p], [q.ticker, q]]);
      const t = new Trader('Tom', [0.1,2,-1], [['S', 100], ['P', 200]], 500.00, universe); 
      const j = new Trader('Joe', [0.2,1,-2], [['Q', 100], ['P', 200]], 1500.00, universe); 
      const a = new Trader('Huck', [0.3,0.5,-5], [['Q', 100], ['S', 200]], 1500.00, universe); 
      const traders = new Map([[t.name, t], [j.name, j], [a.name, a]]);
      const e = new Exchange(universe, traders);
      expect(e.getOrderBook()).deep.equal(
        new Map([["P", {"ask": [["Tom", 25.05, 100], ["Joe", 25.05, 100]], "bid": [["Huck", 25.1, 30]]}],
                 ["Q", {"ask": [["Huck", 29.9, 100]], "bid": [["Tom", 29.95, 8.333333333333334], ["Joe", 29.95, 25]]}],
                 ["S", {"ask": [["Tom", 10.05, 100]], "bid": [["Joe", 10.1, 75], ["Huck", 10.1, 75]]}]]
        )
      );
    });

    it("gets trades", function(){
      const s = new Stock('S', 1000, 15.0, 0.5, [10.0, 11.0, 12.0]);
      const p = new Stock('P', 3000, 10.0, 2.0, [25.0, 21.0, 18.0]);
      const q = new Stock('Q', 4000, 5.0, 10.0, [30.0, 31.0, 32.0]);
      const universe = new Map([[s.ticker, s], [p.ticker, p], [q.ticker, q]]);
      const t = new Trader('Tom', [0.1,2,-1], [['S', 100], ['P', 200]], 500.00, universe); 
      const j = new Trader('Joe', [0.2,1,-2], [['Q', 100], ['P', 200]], 1500.00, universe); 
      const a = new Trader('Huck', [0.3,0.5,-5], [['Q', 100], ['S', 200]], 1500.00, universe); 
      const traders = new Map([[t.name, t], [j.name, j], [a.name, a]]);
      const e = new Exchange(universe, traders);
      const book = e.getOrderBook();
      expect(e.getTrades(book)).deep.equal([
        ["Joe", "S", 10.075, 50], 
        ["Huck", "S", 10.075, 50],
        ["Tom", "S", 10.075, -100],
        ["Huck", "P", 25.075000000000003, 30],
        ["Tom", "P", 25.075000000000003, -15],
        ["Joe", "P", 25.075000000000003, -15],
        ["Tom", "Q", 29.924999999999997, 8.333333333333334],
        ["Joe", "Q", 29.924999999999997, 25],
        ["Huck", "Q", 29.924999999999997, -33.333333333333336]
      ]);
    });
  });
});

[["Joe", "S", 10.075, 50], 
 ["Huck", "S", 10.075, 50],
 ["Tom", "S", 10.075, -100],
 ["Huck", "P", 25.075000000000003, 30],
 ["Tom", "P", 25.075000000000003, -15],
 ["Joe", "P", 25.075000000000003, -15],
 ["Tom", "Q", 29.924999999999997, 8.333333333333334],
 ["Joe", "Q", 29.924999999999997, 25],
 ["Huck", "Q", 29.924999999999997, -33.333333333333336]
]


