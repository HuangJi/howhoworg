const Checker = require('./checker')

const checker = new Checker({ name: 'cool' })
// checker.checkFundRichTodayNav('101003')
checker.dailyCheck()
setInterval(() => checker.dailyCheck(), 1000 * 60)
