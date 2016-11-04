const express = require('express')
const MongoClient = require('mongodb').MongoClient
const _ = require('lodash')

const router = express.Router()
const mongodbUrl = 'mongodb://localhost:27017/fund'
const collectionName = 'rawFund'
const apiKey = '2c0a50b4a76d83d77cae1f859a40de55c0b07877'

let collection
let filter
let fields
let db

/* GET users listing. */
router.get('/docs', (req, res) => {
  res.render('apidocs', { title: 'API Docs' })
})

router.get('/v0/fund/info', (req, res) => {
  const queryName = req.query.name
  console.log(queryName)
  res.json({ name: queryName })
})

router.post('/v0/fund/info', (req, res) => {
  res.setHeader('X-Powered-By', 'Wilson Huang')
  if (req.headers.authorization !== apiKey) {
    res.setHeader('WWW-Authenticate', 'Invalid API Key.')
    res.status(401).json({
      code: 401,
      message: 'Invalid API Key.',
    })
  } else {
    console.log(req.headers.authorization)
    if (req.body.name === undefined || req.body.name === '') {
      res.status(400).json({
        code: 400,
        message: 'name cannot be empty. Remember to put your parameter into body.',
      })
    } else {
      MongoClient.connect(mongodbUrl, (err, database) => {
        db = database
        collection = db.collection('fundCollection')
        // const rgString = `/.*${req.body.name}.*/`
        filter = {
          fundChineseName: new RegExp(req.body.name),
        }
        console.log(filter)
        collection.find(filter).toArray((error, docs) => {
          if (!error) {
            const responseObject = []
            for (const fund of docs) {
              const object = {}
              object.fundChineseName = fund.fundChineseName
              object.fundEnglishName = fund.fundEnglishName
              object.isinCode = fund.isinCode
              object.currencyType = fund.currencyType
              responseObject.push(object)
            }
            res.json(responseObject)
          }
        })
      })
    }
  }
})

router.post('/v0/fund/detail', (req, res) => {
  res.setHeader('X-Powered-By', 'Wilson Huang')
  if (req.headers.authorization !== apiKey) {
    res.setHeader('WWW-Authenticate', 'Invalid API Key.')
    res.status(401).json({
      code: 401,
      message: 'Invalid API Key.',
    })
  } else {
    console.log(req.headers.authorization)
    if (req.body.name === undefined || req.body.name === '') {
      res.status(400).json({
        code: 400,
        message: 'name cannot be empty.',
      })
    } else {
      MongoClient.connect(mongodbUrl, (err, database) => {
        db = database
        collection = db.collection(collectionName)
        filter = { fundChineseName: req.body.name }
        fields = {
          _id: 0,
          currencyType: 1,
          fundChineseName: 1,
          fundEnglishName: 1,
          isinCode: 1,
          'fundRich.detail.ManagementFee': 1,
          'fundRich.detail.InvestmentStrategy': 1,
          'fundRich.detail.Rr1M': 1,
          'fundRich.detail.Rr3M': 1,
          'fundRich.detail.RrThisYear': 1,
          'fundRich.detail.InceptionYmdOn': 1,
          'fundRich.detail.FundSize': 1,
        }
        collection.findOne(filter, fields, (error, docs) => {
          if (error) {
            res.status(505).json({ status: 'db error', message: error })
          } else {
            const empty = '---'
            const object = _.cloneDeep(docs)
            const detailObject = {
              agentChineseName: empty,
              fundManager: empty,
              latestNavDate: empty,
              latestNav: empty,
              highestInYearNav: empty,
              lowestInYearNav: empty,
              returnRateDate: empty,
              returnRateFromM: docs.fundRich.detail.Rr1M,
              returnRateFromQ: docs.fundRich.detail.Rr3M,
              returnRateFromY: docs.fundRich.detail.RrThisYear,
              category: empty,
              initialAsset: empty,
              riskLevel: empty,
              foundDate: docs.fundRich.detail.InceptionYmdOn,
              region: empty,
              netAsset: docs.fundRich.detail.FundSize,
              totalAssetDate: empty,
              managementFee: docs.fundRich.detail.ManagementFee,
              costodianFee: empty,
              otherCurrencyType: [empty],
              fundShareholding: [empty],
              graph: {
                '3M': [],
                '6M': [],
                '1Y': [],
                '2Y': [],
                '3Y': [],
              },
              documentDownload: empty,
              bemchmark: empty,
              investmentStrategy: docs.fundRich.detail.InvestmentStrategy,
              service: empty,
            }
            _.merge(object, detailObject)
            delete object.fundRich
            res.json(object)
          }
        })
      })
    }
  }
})

router.get('/v0/fund/list', (req, res) => {
  res.setHeader('X-Powered-By', 'Wilson Huang')
  if (req.headers.authorization !== apiKey) {
    res.setHeader('WWW-Authenticate', 'Invalid API Key.')
    res.status(401).json({
      code: 401,
      message: 'Invalid API Key.',
    })
  } else {
    console.log(req.headers.authorization)
    MongoClient.connect(mongodbUrl, (err, database) => {
      db = database
      collection = db.collection(collectionName)
      filter = { fundRich: { $exists: true } }
      fields = {
        _id: 0,
        fundChineseName: 1,
        fundEnglishName: 1,
        currencyType: 1,
        isinCode: 1,
      }
      collection.find(filter, fields).toArray((error, docs) => {
        if (error) {
          res.status(505).json({ status: 'db error', message: error })
        } else {
          // const objectList = _.map(docs, 'fundChineseName', 'isOffshore')
          // res.json(objectList)
          const validObjects = _.map(_.filter(docs, fund => !_.isEmpty(fund)), 'fundChineseName')
          res.json(validObjects)
        }
      })
    })
  }
})

module.exports = router
