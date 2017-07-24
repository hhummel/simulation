'use strict';

        let xmlns = "http://www.w3.org/2000/svg";
        let xscale = 0.04;
        let yscale = 1.5;
        let filter = 10;
        let state = {
          'v': [[-1, 5], [7, 4], [3, 7], [-1, 8], [11, 2], [3, 13], [-13, 7], [2, 6], [3, 13], [-13, 7], [0, 6]],
          'x': [[230, 53], [63, 270], [51, 170], [270, 270], [100, 133], [133, 83], [50, 200], [47, 47], [238, 53], [68, 270], [58, 170]],
          'fill': ['blue', 'green', 'yellow', 'red', 'pink', 'purple', 'orange', 'grey', 'blue', 'green', 'yellow']
        };
        let circles = [];
        
        function CreateSVG (universe, portfolio, cash, cycles) {
            console.log("CreateSVG cycles: ", cycles);
            console.log("CreateSVG universe: ", universe);
            console.log("CreateSVG portfolio: ", portfolio);
            console.log("CreateSVG cash: ", cash);

            var boxWidth = 790;
            var boxHeight = 790;

            var svgElem = document.createElementNS (xmlns, "svg");
            //svgElem.setAttributeNS (null, "viewBox", "0 0 " + boxWidth + " " + boxHeight);
            svgElem.setAttributeNS (null, "width", boxWidth);
            svgElem.setAttributeNS (null, "height", boxHeight);
            svgElem.style.display = "block";

            var g = document.createElementNS (xmlns, "g");
            svgElem.appendChild (g);
            g.setAttributeNS (null, 'transform', 'matrix(1,0,0,-1,0,790)');

            // draw borders
            var coords = "M 0, 0";
            coords += " l 0, 790";
            coords += " l 790, 0";
            coords += " l 0, -790";
            coords += " l -790, 0";

            var path = document.createElementNS (xmlns, "path");
            path.setAttributeNS (null, 'stroke', "#000000");
            path.setAttributeNS (null, 'stroke-width', 10);
            path.setAttributeNS (null, 'stroke-linejoin', "round");
            path.setAttributeNS (null, 'd', coords);
            path.setAttributeNS (null, 'fill', "white");
            path.setAttributeNS (null, 'opacity', 1.0);
            g.appendChild (path);

            const colors = new Map([['S', 'pink'], ['P', 'purple'], ['Q', 'blue'], ['R', 'red']]); 
  
            universe.forEach((stock, ticker) => stock.price.forEach((price, index) => {
                if (index % filter === 0) circles.push(createCircle(xscale*(stock.price.length - index), yscale*price, colors.get(ticker)));
              }));

            circles.forEach(circle => g.appendChild(circle));

            document.addEventListener('keypress', (event) => shiftState(circles, state, event), false);

            var svgContainer = document.getElementById ("svgContainer");
            svgContainer.appendChild (svgElem);
        }

        function createCircle(cx, cy, fill){
            let circle = document.createElementNS (xmlns, "circle");
            circle.setAttributeNS (null, 'stroke', "#000000");
            circle.setAttributeNS (null, 'stroke-width', 1);
            circle.setAttributeNS (null, 'cx', cx);
            circle.setAttributeNS (null, 'cy', cy);
            circle.setAttributeNS (null, 'fill', fill);
            circle.setAttributeNS (null, 'r', '5');
            circle.setAttributeNS (null, 'opacity', 1.0);
            return circle;
        }

        function shiftState(circles, state, event){
          //for (let i in circles) shift(circles[i], state.x[i], state.v[i], event);
          for (let i in circles){
            for (let j in circles) {
              if (j > i){
                let dsquared = (state.x[i][0] - state.x[j][0])**2 + (state.x[i][1] - state.x[j][1])**2;
                if (dsquared < 1500) {
                  let vix = state.v[i][0] + Math.random();
                  let viy = state.v[i][1] + Math.random();
                  state.v[i][0] = -state.v[j][1] + Math.random();
                  state.v[i][1] = -state.v[j][0] + Math.random();
                  state.v[j][0] = -viy;
                  state.v[j][1] = -vix;
                }
              }
            }
          }
          for (let i in circles) shift(circles[i], state.x[i], state.v[i], event);
        }

        function shift(e, x, v, event){
          if ((x[0] > 342 && v[0] > 0) || (x[0] < 47 && v[0] < 0)) v[0] = -v[0];
          if ((x[1] > 342 && v[1] > 0) || (x[1] < 47 && v[1] < 0)) v[1] = -v[1];
          x[0] += v[0]/scale;
          x[1] += v[1]/scale;
          e.setAttribute('cx', x[0]);
          e.setAttribute('cy', x[1]);
       }

module.exports = CreateSVG;

