'use strict'

const MongoClient = require('mongodb').MongoClient
const fs = require('fs')

const mongodbUrl = 'mongodb://wilson:Wil9999Wil9999Wil9999@SG-howfintechmongo-8817.servers.mongodirector.com:27017/source?ssl=true'
const ca = [fs.readFileSync('/Users/wilson/.ssh/scalegrid.crt')]
const serverOption = { server: { sslValidate: true, sslCA: ca } }


module.exports = {
  scalegridConnect: function scalegridConnect(callback) {
    MongoClient.connect(mongodbUrl, serverOption, (err, db) => {
      callback(err, db)
    })
  },
}
