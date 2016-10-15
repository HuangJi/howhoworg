var ProgressBar = require('progress');

var bar = new ProgressBar('Downloading [:bar] :percent :etas', { total: 20});
var bar2 = new ProgressBar('Testing [:bar] :percent :etas', { total: 20});

var timer = setInterval(function () {
  bar.tick();
  // bar.tick(2);
  if (bar.complete) {
    console.log('\nComplete!');
    clearInterval(timer);
  }
}, 1000);

var timer2 = setInterval(function () {
  bar2.tick();
  // bar.tick(2);
  if (bar.complete) {
    console.log('\nComplete!');
    clearInterval(timer);
  }
}, 500);

// var status = require('node-status')
// var pizzas = status.addItem('pizza')
// console = status.console()
// // status.start()

// pizzas.max = 10
// // pizzas.count = 1
// // pizzas.inc(3)
// const sleep = (time) => new Promise((resolve) => setTimeout(resolve, time))

// function getRandomMiniSec() {
//   return parseInt((Math.random() * 1000), 10)
// }

// setInterval(() => pizzas.inc(), 1000)

// status.start({
//     invert: false,
//     interval: 200,
//     pattern: ' Doing work: {uptime}  |  {spinner.cyan}  |  {pizza.bar}'
// })
