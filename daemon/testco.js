'use strict'

const request = require('request')
const co = require('co')

const postOptions = {
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

const getOptions = {
  url: 'https://apis.fundrich.com.tw/default/v1/funds/042044',
  method: 'GET',
  json: true,
}

const requestPromise = function requestPromise(option) {
  return new Promise((resolve, reject) => {
    request(option, (error, response, result) => {
      if (error) {
        reject(error)
      } else {
        resolve(result)
      }
    })
  })
}

co(function* _() {
  const f1 = yield requestPromise(getOptions)
  console.log(f1)
  console.log('middle')
  const f2 = yield requestPromise(postOptions)
  console.log(f2)
})

// co(gen)
