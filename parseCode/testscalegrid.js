const scalegridConnect = require('./scalegridMongo').scalegridConnect

scalegridConnect((err, db) => {
  if (err) {
    console.error(err)
  } else {
    db.collection('tejOfatt').find({ tejId: '0050' }).limit(1).next((e1, r1) => {
      if (!e1 && r1) {
        console.log(r1)
        db.close()
      } else {
        console.error(`error:${e1}`)
        db.close()
      }
    })
  }
})
