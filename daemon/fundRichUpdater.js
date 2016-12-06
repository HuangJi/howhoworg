'use strict'

const fs = require('fs')
const mkdirp = require('mkdirp')
const request = require('request')
const scalegridMongo = require('./scalegridMongo')
const _ = require('lodash')

const collectionDetailName = 'FRDetail'
const collectionNavName = 'FRNav'
const collectionAllocationName = 'FRAllocation'
const collectionDividendName = 'FRDividend'
// const currentDateString = moment().format('YYYYMMDD')

const sleep = time => new Promise(resolve => setTimeout(resolve, time))
const getRandomMiniSec = () => parseInt((Math.random() * 0.05 * 1000), 10)

function updateOneFundRichDetailData(fundRichIdList, currentDateString) {
  sleep(getRandomMiniSec()).then(() => {
    if (fundRichIdList.length <= 0) { return 0 }
    const fundRichId = fundRichIdList.shift()
    const options = {
      method: 'GET',
      url: `https://apis.fundrich.com.tw/default/v1/funds/${fundRichId}`,
      json: true,
    }
    request(options, (error, response, body) => {
      if (error) {
        console.error(`error: ${error}`)
        updateOneFundRichDetailData(fundRichIdList, currentDateString)
      } else {
        const path = `./staticData/fundRich/${currentDateString}FRDetail/${body.FundId}.json`
        fs.writeFile(path, JSON.stringify(body, null, 4), (writeError) => {
          if (writeError) throw writeError
          console.log(`write FRDetail ${fundRichId}!`)
        })
        scalegridMongo.connect((err, db) => {
          const storedData = _.cloneDeep(body)
          const collection = db.collection(collectionDetailName)
          const key = `data.${storedData.PriceTransDate}`
          const filter = {
            FRId: body.FundId,
            howfundId: '',
          }
          delete storedData.FundId
          const object = {}
          object[key] = storedData
          collection.updateMany(filter, { $set: object }, { upsert: true }, (e, r) => {
            if (!error && r) {
              console.log(`${storedData.Name} detail done!`)
              db.close()
              updateOneFundRichDetailData(fundRichIdList, currentDateString)
            }
          })
        })
      }
    })
    return 'sleep return'
  })
}

function updateOneFundRichDividendData(fundRichIdList, currentDateString) {
  sleep(getRandomMiniSec()).then(() => {
    if (fundRichIdList.length <= 0) {
      return 0
    }
    const fundRichId = fundRichIdList.shift()
    const options = {
      method: 'GET',
      url: `https://apis.fundrich.com.tw/default/v1/funds/${fundRichId}?view=dividend`,
      json: true,
    }

    request(options, (error, response, body) => {
      if (error) {
        console.error(`error: ${error}`)
        updateOneFundRichDividendData(fundRichIdList, currentDateString)
      } else if (body.length) {
        const path = `./staticData/fundRich/${currentDateString}FRDividend/${fundRichId}.json`
        fs.writeFile(path, JSON.stringify(body, null, 4), (writeError) => {
          if (writeError) throw writeError
          console.log(`write FRDividend ${fundRichId}!`)
        })
        scalegridMongo.connect((err, db) => {
          const collection = db.collection(collectionDividendName)
          const dividenData = {}
          const filter = {
            FRId: fundRichId,
          }
          for (const d of body) {
            const dateKey = d.TransDate
            delete d.TransDate
            dividenData[dateKey] = d
          }
          collection.updateMany(filter,
            { $set: { data: dividenData } },
            { upsert: true }, (e, r) => {
              if (!error && r) {
                console.log(`${fundRichId} dividen done!`)
                db.close()
                updateOneFundRichDividendData(fundRichIdList, currentDateString)
              }
            })
        })
      } else {
        updateOneFundRichDividendData(fundRichIdList, currentDateString)
      }
    })
    return 'sleep return'
  })
}

function updateOneFundRichAllocationData(fundRichIdList, currentDateString) {
  sleep(getRandomMiniSec()).then(() => {
    if (fundRichIdList.length <= 0) {
      return 0
    }
    const fundRichId = fundRichIdList.shift()
    const options = {
      method: 'GET',
      url: `https://apis.fundrich.com.tw/default/v1/funds/${fundRichId}?view=allocation`,
      json: true,
    }
    request(options, (error, response, body) => {
      if (error) {
        console.error(`error: ${error}`)
        updateOneFundRichAllocationData(fundRichIdList, currentDateString)
      } else if (Object.keys(body).length) {
        const path = `./staticData/fundRich/${currentDateString}FRAllocation/${fundRichId}.json`
        fs.writeFile(path, JSON.stringify(body, null, 4), (writeError) => {
          if (writeError) throw writeError
          console.log(`write FRAllocation ${fundRichId}!`)
        })
        scalegridMongo.connect((err, db) => {
          const collection = db.collection(collectionAllocationName)
          const allocationData = {
            AssertAllocation: {},
            IndustryRatio: {},
            StockTop: {},
          }
          const filter = {
            FRId: fundRichId,
          }
          if (body.AssertAllocation.length > 0) {
            const allocationDataDate = body.AssertAllocation[0].TransDate
            allocationData.AssertAllocation[allocationDataDate] = body.AssertAllocation
          }
          if (body.IndustryRatio.length > 0) {
            const industryRatioDataDate = body.IndustryRatio[0].TransDate
            allocationData.IndustryRatio[industryRatioDataDate] = body.IndustryRatio
          }
          if (body.StockTop.length > 0) {
            const stockTopDataDate = body.StockTop[0].TransDate
            allocationData.StockTop[stockTopDataDate] = body.StockTop
          }
          collection.updateMany(filter,
            { $set: { data: allocationData } },
            { upsert: true }, (e, r) => {
              if (!error && r) {
                console.log(`${fundRichId} allocation done!`)
                db.close()
                updateOneFundRichAllocationData(fundRichIdList, currentDateString)
              }
            })
        })
      } else {
        updateOneFundRichAllocationData(fundRichIdList, currentDateString)
      }
    })
    return 'sleep return'
  })
}

function updateOneFundRichNavData(fundRichIdList, currentDateString) {
  sleep(getRandomMiniSec()).then(() => {
    if (fundRichIdList.length <= 0) {
      return 0
    }
    const fundRichId = fundRichIdList.shift()
    const options = {
      method: 'GET',
      url: `https://apis.fundrich.com.tw/default/v1/funds/navPrices/${fundRichId}?duration=est`,
      json: true,
    }

    request(options, (error, response, body) => {
      if (error) {
        console.error(`error: ${error}`)
        updateOneFundRichNavData(fundRichIdList, currentDateString)
      } else if (body.length) {
        const path = `./staticData/fundRich/${currentDateString}FRNav/${fundRichId}.json`
        fs.writeFile(path, JSON.stringify(body, null, 4), (writeError) => {
          if (writeError) throw writeError
          console.log(`write FRNav ${fundRichId}!`)
        })
        scalegridMongo.connect((err, db) => {
          const collection = db.collection(collectionNavName)
          const navData = {}
          const filter = {
            FRId: fundRichId,
          }
          for (const navObject of body) {
            const dateKey = navObject.TransDate
            navData[dateKey] = navObject
          }
          collection.updateMany(filter,
            { $set: { data: navData } },
            { upsert: true }, (e, r) => {
              if (!error && r) {
                console.log(`${fundRichId} nav done!`)
                db.close()
                updateOneFundRichNavData(fundRichIdList, currentDateString)
              }
            })
        })
      } else {
        updateOneFundRichNavData(fundRichIdList, currentDateString)
      }
    })
    return 'sleep return'
  })
}

const updateAll = function updateAll(currentDateString) {
  const options = {
    url: 'https://apis.fundrich.com.tw/default/v1/funds',
    method: 'POST',
    body: {
      PageSize: 10000,
      PageIndex: 1,
      Sort: 'Name',
      OrderDesc: false,
      Name: '',
    },
    json: true,
  }

  request(options, (error, response, result) => {
    if (error) {
      console.error(`error: ${error}`)
    } else {
      const fundRichIdList = []
      let fund
      for (fund of result.Items) {
        fundRichIdList.push(fund.FundId)
      }
      // fundRich updating start
      mkdirp(`./staticData/fundRich/${currentDateString}FRDetail`, (err) => {
        if (err) {
          console.error(`err:${err}`)
        } else {
          updateOneFundRichDetailData(_.cloneDeep(fundRichIdList), currentDateString)
        }
      })

      mkdirp(`./staticData/fundRich/${currentDateString}FRDividend`, (err) => {
        if (err) {
          console.error(`err:${err}`)
        } else {
          updateOneFundRichDividendData(_.cloneDeep(fundRichIdList), currentDateString)
        }
      })

      mkdirp(`./staticData/fundRich/${currentDateString}FRAllocation`, (err) => {
        if (err) {
          console.error(`err:${err}`)
        } else {
          updateOneFundRichAllocationData(_.cloneDeep(fundRichIdList), currentDateString)
        }
      })

      mkdirp(`./staticData/fundRich/${currentDateString}FRNav`, (err) => {
        if (err) {
          console.error(`err:${err}`)
        } else {
          updateOneFundRichNavData(_.cloneDeep(fundRichIdList), currentDateString)
        }
      })
    }
  })
}

module.exports = {
  updateAll,
}
