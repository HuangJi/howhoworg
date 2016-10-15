'use strict'

const fs = require('fs')
const S = require('string')
const express = require('express')
const request = require('request')
const cheerio = require('cheerio')
const MongoClient = require('mongodb').MongoClient
const mongodbUrl = 'mongodb://localhost:27017/fund'

const collectionName = 'rawFund'
let count = 0
let collection
let filter
let db
let yahooIdList = []

const sleep = (time) => new Promise((resolve) => setTimeout(resolve, time))

function getRandomMiniSec() {
  return parseInt((Math.random() * 0.05 * 1000), 10)
}

function updateOneFundRichDetailData(fundRichIdList) {
  sleep(getRandomMiniSec()).then(() => {
    if (fundRichIdList.length <= 0) {
      return 0
    }
    const fundRichId = fundRichIdList.shift()
    const options = {
      method: 'GET',
      url: `https://apis.fundrich.com.tw/default/v1/funds/${fundRichId}`,
      json: true,
    }
    request(options, (error, response, body) => {
      if (error) {
        console.error(`error: ${error}`)
        updateOneFundRichDetailData(fundRichIdList)
      }
      else {
        MongoClient.connect(mongodbUrl, (err, db) => {
          const collection = db.collection(collectionName)
          const filter = {
            fundChineseName: body.Name,
          }
          collection.updateMany(filter, { $set: { "fundRich.detail": body } }, { upsert: true }, (e, r) => {
            if (!error && r) {
              console.log(`${body.Name} detail done!`)
              db.close()
              updateOneFundRichDetailData(fundRichIdList)
            }
          })
        })
      }
    })
  })
}

function updateOneFundRichDividendData(fundRichIdList) {
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
        updateOneFundRichDividendData(fundRichIdList)
      }
      else {
        MongoClient.connect(mongodbUrl, (err, db) => {
          const collection = db.collection(collectionName)
          const filter = {
            "fundRich.detail.FundId": fundRichId,
          }
          collection.updateMany(filter, { $set: { "fundRich.dividend": body } }, { upsert: true }, (e, r) => {
            if (!error && r) {
              console.log(`${fundRichId} dividen done`)
              db.close()
              updateOneFundRichDividendData(fundRichIdList)
            }
          })
        })
      }
    })
  })
}

function updateOneFundRichAllocationData(fundRichIdList) {
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
        updateOneFundRichAllocationData(fundRichIdList)
      }
      else {
        MongoClient.connect(mongodbUrl, (err, db) => {
          const collection = db.collection(collectionName)
          const filter = {
            "fundRich.detail.FundId": fundRichId,
          }
          collection.updateMany(filter, { $set: { "fundRich.allocation": body } }, { upsert: true }, (e, r) => {
            if (!error && r) {
              console.log(`${fundRichId} allocation done`)
              db.close()
              updateOneFundRichAllocationData(fundRichIdList)
            }
          })
        })
      }
    })
  })
}

function updateOneFundRichNavData(fundRichIdList) {
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
        updateOneFundRichNavData(fundRichIdList)
      }
      else {
        MongoClient.connect(mongodbUrl, (err, db) => {
          const collection = db.collection(collectionName)
          const filter = {
            "fundRich.detail.FundId": fundRichId,
          }
          collection.updateMany(filter, { $set: { "fundRich.nav": body } }, { upsert: true }, (e, r) => {
            if (!error && r) {
              console.log(`${fundRichId} nav done`)
              db.close()
              updateOneFundRichNavData(fundRichIdList)
            }
          })
        })
      }
    })
  })
}

function getOneFundClearData(fundIDList, userAgentList) {
  sleep(getRandomMiniSec()).then(() => {
    if (fundIDList.length <= 0) {
      return
    }
    const fundID = fundIDList.shift()
    const options = {
      url: `http://announce.fundclear.com.tw/MOPSFundWeb/A01_11.jsp?fundId=${fundID}&navMonth=240`,
      headers: {
        'User-Agent': userAgentList[parseInt((Math.random() * 999) % userAgentList.length, 10)],
      },
    }
    request(options, (error, response, body) => {
      if (error) {
        console.error(`error: ${error}`)
        getOneFundClearData(fundIDList, userAgentList)
      }
      else {
        count += 1
        const $ = cheerio.load(body)
        let fundData = $('param[name=htNav]').attr('value')
        if (fundData === undefined) {
          getOneFundClearData(fundIDList, userAgentList)
        }
        else {
          fundData = fundData.replace(/ /g, '')
          fundData = fundData.replace(/{/g, '')
          fundData = fundData.replace(/}/g, '')
          const fundDataList = fundData.split(',')
          // console.log(fundData)
          const fundObject = {
            fundID,
            dateData: {},
          }
          for (let i = 0; i < fundDataList.length; i++) {
            const keyValue = fundDataList[i].split('=')
            fundObject.dateData[keyValue[0]] = parseFloat(keyValue[1])
          }

          MongoClient.connect(mongodbUrl, (err, db) => {
            // Get a collection
            const collection = db.collection(collectionName)
            const filter = {
              "fundClear.fundId": fundID,
            }
            collection.updateMany(filter, { $set: { "fundClear.nav": fundObject.dateData } }, { upsert: true }, (e, r) => {
              if (!error && r) {
                console.log(`fundClear request success:${fundID} and done! count:${count}`)
                db.close()
                getOneFundClearData(fundIDList, userAgentList)
              }
            })
          })
        }
      }
    })
  })
}

function getProviderFunds (yahooProviderUrlList, callback) {
  sleep(getRandomMiniSec()).then(() => {
    if (yahooProviderUrlList.length <= 0) {
      callback(yahooIdList)
      return 0
    }
    const url = yahooProviderUrlList.shift()
    const options = {
      url: url,
    }

    request(options, (error, response, body) => {
      if (error) {
        console.error(`error: ${error}`)
        getProviderFunds(yahooProviderUrlList, callback)
      } 
      else {
        const $ = cheerio.load(body)
        // let table = $('.Bgc-w').children().next().next().children().attr('href')
        $('.Bgc-w').find('.Ta-start').children().map((i, element) => {
          const yahooId = element.attribs.href.split('/')[3]
          const fundName = element.children[0].data
          if (yahooId != undefined) {
            console.log(`${yahooId} and ${fundName}`)
            console.error(`${yahooId} is done!`)
            yahooIdList.push(yahooId)
          }
        })
        getProviderFunds(yahooProviderUrlList, callback)
      }    
    })
  })
}

function getNavByYahooId (yahooIdList) {
  sleep(getRandomMiniSec()).then(() => {
    if (yahooIdList.length <= 0) {
      return 0
    }
    const yahooId = yahooIdList.shift()
    const options = {
      url: `https://tw.money.yahoo.com/fund/summary/${yahooId}`,
    }

    request(options, (error, response, body) => {
      if (error) {
        console.error(`error: ${error}`)
        getNavByYahooId(yahooIdList)
      } 
      else {
        const $ = cheerio.load(body)
        let fundChineseName = $('.mfund-header').children().children().first().text()
        let nav = $('.mfund-header').children().next().children().children().first().text()
        let dateString = $('.mfund-header').children().next().children().next().children().text()

        fundChineseName = S(fundChineseName).collapseWhitespace().s
        dateString = dateString.substring(0, 10)

        console.log(nav)
        console.log(dateString)

        MongoClient.connect(mongodbUrl, (err, db) => {
          const collection = db.collection(collectionName)
          const filter = {
            fundChineseName: fundChineseName,
          }
          const navKey = `yahoo.nav.${dateString}`
          const updateObject = {
            'yahoo.yahooId': yahooId,
          }
          updateObject[navKey] = nav
          collection.updateMany(filter, { $set: updateObject }, { upsert: true }, (e, r) => {
            if (!e) {
              console.log(`${fundChineseName} update done!`)
              db.close()
              getNavByYahooId(yahooIdList)
            }
            else {
              console.log(e)
              db.close()
              getNavByYahooId(yahooIdList)
            }
          })
        })
      }    
    })
  })
}

const options = {
  url: 'https://apis.fundrich.com.tw/default/v1/funds',
  method: 'POST',
  body: {
          PageSize: 10000,
          PageIndex: 1,
          Sort: "Name",
          OrderDesc: false,
          Name: ""
        },
  json: true,
}

function updateAll() {
  request(options, (error, response, result) => {
    if (error) {
      console.error(`error: ${error}`)
    }
    else {
      let fundRichIdList = []
      let fund
      for (fund of result.Items) {
        fundRichIdList.push(fund.FundId)
      }
      function finishCall () {
        console.log(`fundRich data had been updated!`)
      }
      // fundRich updating start 
      updateOneFundRichDetailData(JSON.parse(JSON.stringify(fundRichIdList)))
      updateOneFundRichDividendData(JSON.parse(JSON.stringify(fundRichIdList)))
      updateOneFundRichAllocationData(JSON.parse(JSON.stringify(fundRichIdList)))
      updateOneFundRichNavData(JSON.parse(JSON.stringify(fundRichIdList)))

      // fundClear updating start
      fs.readFile('data/fund_id', (err, data) => {
        if (err) throw err
        const fundIDList = data.toString().split('\n')
        fs.readFile('data/user_agent', (error, fundData) => {
          const userAgentList = fundData.toString().split('\n')
          getOneFundClearData(fundIDList, userAgentList)
        })
      })

      // Yahoo nav updating start
      fs.readFile('data/yahooProviderUrlList', (err, data) => {
        if (err) throw err
        const yahooProviderUrlList = data.toString().split('\n')
        getProviderFunds(yahooProviderUrlList, (yahooIdList) => {
          getNavByYahooId(yahooIdList)
        })
      })
    }
  })
}

module.exports = {
  updateAll: updateAll
}