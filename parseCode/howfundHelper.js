'use strict'

const _ = require('lodash')
const co = require('co')

const empty = '---'

function getLatestDateString(dateStringArray) {
  return new Promise((resolve) => {
    const dateArray = _.map(dateStringArray, _.parseInt)
    const latestDate = _.max(dateArray)
    if (!latestDate) {
      return null
      // resolve('')
    }
    console.log(`latestDate:${latestDate}`)
    resolve(latestDate.toString())
    return 0
  })
}

function parseStockTopData(stockTopData) {
  return new Promise((resolve) => {
    co(function* __() {
      const content = ''
      const dateKey = yield getLatestDateString(Object.keys(stockTopData))
      if (dateKey) {
        const docs = stockTopData[dateKey]
        for (const x of docs) {
          content.concat(`${x.ExternalName} ${x.InvRate.toString()}%\n`)
        }
      }
      resolve(content)
      // return 0
    })
  })
}

function parseFundNavData(fundNavData) {
  return new Promise((resolve) => {
    co(function* __() {
      console.log('parseFundNavData')
      const object = {}
      const dateKey = yield getLatestDateString(Object.keys(fundNavData))
      console.log(`dateKey:${dateKey}`)
      if (dateKey) {
        const doc = fundNavData[dateKey]
        object.navDate = doc.navDate
        object.nav = doc.nav
        object.dayChange = empty
        object.oneDayProfitRate = doc.oneDayProfitRate
        object.Sharpe1Y = doc.Sharpe1Y
        object.highestInYearNav = empty
        object.lowestInYearNav = empty
        object.Rr1M = doc.Rr1M
        object.Rr3M = doc.Rr3M
        object.RrThisYear = doc.RrThisYear
      }
      resolve(object)
    // return 0
    })
  })
}

function parseFRDetailData(frDetailData) {
  return new Promise((resolve) => {
    co(function* __() {
      console.log('parseFRDetailData')
      const object = {}
      const dateKey = yield getLatestDateString(Object.keys(frDetailData))
      if (dateKey) {
        const doc = frDetailData[dateKey]
        object.Name = doc.Name
        object.NameEng = doc.NameEng
        object.AgentCPName = doc.AgentCPName
        object.oneDayProfitRate = doc.oneDayProfitRate
        object.CategoryName = doc.CategoryName
        object.CurrencyCode = doc.CurrencyCode
        object.RiskRatingFromEst = 'RR'.concat(doc.RiskRatingFromEst.toString())
        object.InceptionYmdOn = doc.InceptionYmdOn
        object.FundSize = doc.FundSize
        object.SizeTransDate = doc.SizeTransDate
        object.ManagementFee = doc.ManagementFee
        object.Custodian = doc.Custodian
        object.DistnbutionStatus = doc.DistnbutionStatus
        object.InvestmentStrategy = doc.InvestmentStrategy
        object.otherCurrencyType = ''
      }
      resolve(object)
    // return 0
    })
  })
}

function parseTejData(tejData) {
  return new Promise((resolve) => {
    co(function* __() {
      console.log('parseTejData')
      const object = {}
      const dateKey = yield getLatestDateString(Object.keys(tejData))
      if (dateKey) {
        const doc = tejData[dateKey]
        console.log(`isinCode:${doc.isinCode}`)
        object.isinCode = doc.isinCode
        object.currentManagerA = doc.currentManagerA
        object.startAsset = doc.startAsset
        object.regionType = doc.regionType
      }
      resolve(object)
    // return 0
    })
  })
}

module.exports = {
  getLatestDateString,
  parseStockTopData,
  parseFundNavData,
  parseFRDetailData,
  parseTejData,
}
