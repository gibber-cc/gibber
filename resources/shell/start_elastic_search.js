var request = require('request')

var makeSearchEngine = function(cb) {
  request({ url:'http://localhost:9200/_river/gibber/_meta', method:'PUT', json:{
      "type" : "couchdb",
      "couchdb" : {
          "host" : "localhost",
          "port" : 5984,
          "db" : "gibber",
          "filter" : null
      },
      "index" : {
          "index" : "gibber",
          "type" : "gibber",
          "bulk_size" : "100",
          "bulk_timeout" : "10ms"
      }
    }
  }, function(e,r,b) {
    console.log("SEARCH ENGINE MADE: ", e,b)
    if(cb) cb()
  })
}

makeSearchEngine()
