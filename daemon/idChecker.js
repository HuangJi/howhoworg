'use strict'

const fs = require('fs')
const _ = require('lodash')
const fundRichUpdater = require('./fundRichUpdater')
const scalegridMongo = require('./scalegridMongo')

const dataPath = './staticData'

function getMissIdList(source, type, date, callback) {
  if (source === 'fundClear' && type === 'FCNav') {
    fs.readdir(`${dataPath}/${source}/${date}${type}`, (readdirError, files) => {
      if (readdirError) {
        // console.error(`readdirError:${readdirError}`)
        callback(readdirError, null)
      } else {
        const idList = []
        for (const file of files) { idList.push(file.replace('.json', '')) }
        callback(null, idList)
        fundRichUpdater.getFundRichIdList((error, results) => {
          const missIdList = _.difference(results, idList)
          callback(null, missIdList)
          // console.log(missIdList)
        })
      }
    })
  } else if (source === 'fundRich') {
    if (type === 'FRDividend') {
      fs.readdir(`${dataPath}/${source}/${date}${type}`, (readdirError, files) => {
        if (readdirError) {
          callback(readdirError, null)
        } else {
          const idList = []
          for (const file of files) { idList.push(file.replace('.json', '')) }
          scalegridMongo.connect((dbError, db) => {
            if (dbError) {
              console.error(`dbError:${dbError}`)
            } else {
              db.collection('FRDividend').find({}, { FRId: 1 }).toArray((colError, docs) => {
                if (colError) {
                  console.error(`colError:${colError}`)
                } else {
                  const results = _.map(docs, object => object.FRId)
                  const missIdList = _.difference(results, idList)
                  callback(null, missIdList)
                }
              })
            }
          })
        }
      })
    } else {
      fs.readdir(`${dataPath}/${source}/${date}${type}`, (readdirError, files) => {
        if (readdirError) {
          callback(readdirError, null)
        } else {
          const idList = []
          for (const file of files) { idList.push(file.replace('.json', '')) }
          fundRichUpdater.getFundRichIdList((error, results) => {
            const missIdList = _.difference(results, idList)
            callback(null, missIdList)
            // console.log(missIdList)
          })
        }
      })
    }
  }
}

// fs.readdir(testFolder, (err, files) => {
//   const idList = []
//   for (const file of files) {
//     idList.push(file.replace('.json', ''))
//   }
//
//   fundRichUpdater.getFundRichIdList((error, results) => {
//     console.log(`idList.length: ${idList.length}`)
//     console.log(`results.length: ${results.length}`)
//     console.log(_.difference(results, idList))
//   })
// })

module.exports = {
  getMissIdList,
}
