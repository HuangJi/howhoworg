const ProgressBar = require('progress')

const bar = new ProgressBar('Downloading [:bar] :percent :etas', { total: 20 })

const timer = setInterval(() => {
  bar.tick()
  // bar.tick(2);
  if (bar.complete) {
    console.log('\nComplete!')
    clearInterval(timer)
  }
}, 1000)
