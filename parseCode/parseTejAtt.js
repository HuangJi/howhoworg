'use strict'

const csv = require('csv-parser')
// const MongoClient = require('mongodb').MongoClient
const fs = require('fs')
const stream = fs.createReadStream('../data/watt.csv')
// const mongodbUrl = 'mongodb://localhost:27017/ach'

// let collection
// let db

const tejData = []

stream
  .pipe(csv())
  .on('data', (data) => {
    tejData.push(data)
  })
  .on('end', () => {
    console.log(tejData)
  })
