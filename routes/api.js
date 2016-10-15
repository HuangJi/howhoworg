const express = require('express')
const MongoClient = require('mongodb').MongoClient

const router = express.Router()
const mongodbUrl = 'mongodb://localhost:27017/fund'

let collection
let filter
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
  if (req.headers.authorization !== '2c0a50b4a76d83d77cae1f859a40de55c0b07877') {
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
  if (req.headers.authorization !== '2c0a50b4a76d83d77cae1f859a40de55c0b07877') {
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
        collection = db.collection('fundCollection')
        filter = {
          fundChineseName: req.body.name,
        }
        collection.findOne(filter, (error, docs) => {
          if (!error) {
            res.json(docs)
          }
        })
      })
    }
  }
})

module.exports = router
