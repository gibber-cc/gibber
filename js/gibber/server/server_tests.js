var request         = require( 'request' ),
    connect         = require( 'connect' ),
    url             = require( 'url' ),
    fs              = require( 'fs' ),
    passport        = require( 'passport' ),
    flash           = require( 'connect-flash' ),
    express         = require( 'express' ),
    util            = require( 'util' ),
    LocalStrategy   = require( 'passport-local' ).Strategy,
    _url            = 'http://localhost:5984/gibber',
    esUrl           = 'http://localhost:9200/gibber/_search',
    webServerPort   = 80,
    serverRoot      = __dirname + "/../../../";

var names = ['charlie', 'sally', 'mary','dick','paul','bettie', 'katie', 'liz']

var lines = [
"a = FM(); a.note(440); x = Drums('xoxo')",
"b = Synth(); c = Seq( [440,880], 1/4, b); x = Drums('x*o*x*o')",
"c = Mono(); c.fx.add( Reverb() ); d = Seq( [440,880], 1/4, c); x = Drums('x*o*x*o')",
"d = Pluck({blend:.5}); d.fx.add( HPF(.4) ); e= ScaleSeq( Rndi(0,12), 1/16, d); x = Drums('xoxo')",
]

var pubCount = {}

var deleteDatabase = function(cb) {
  request({ 
    url:_url,
    method:'DELETE' 
  }, function(e,r,b) { 
    console.log("DELETING DATABASE:",e,b);
    if(cb) cb() 
  })
}

var makeDatabase = function(cb) {
  request({ url:_url, method:'PUT'}, function(e,r,b) {
    console.log("DATABASE MADE:", b); if(cb) cb()
  })
}

var makeUsers = function(cb) {
  for( var i = 0; i < names.length; i++ ) {
    (function() {
      var name = names[i],
          _i = i;
          
      request.post({url:'http://localhost:5984/gibber/', json:{
          _id: name,
          type: 'user',
          password:  name + 2,
          joinDate:  [1, 12, 2013],
          website:  "http://www." + name + ".com",
          affiliation:  "UCSB",
          email:  name+'@'+name+'.com',
          following: [],
          friends: [],
        }},
        function (error, response, body) {
          if( error ) { 
            console.log( error ) 
          } else { 
            if(_i === names.length -1) {
              console.log("USERS MADE")
              if(cb) cb()
            }
          }
        }
      )
    })()
  }
}

var makePubs = function(cb) {
  for(var i = 0; i < 30; i++) {
    (function() {
      var _i = i;
      var name = names[ Math.floor( Math.random() * names.length ) ],
          line = lines[ Math.floor( Math.random() * lines.length ) ]
      
      //console.log(name, line)
               
      if( typeof pubCount[ name ] === 'undefined') { pubCount[ name ] = 0 } else { pubCount[ name ]++ }
      request.post({url:'http://localhost:5984/gibber/', json:{
          _id: name + '/publications/pub' + pubCount[ name ],
          name: pubCount[ name ],
          author: name,
          type: 'publication',
          publicationDate: [1, 12, 2013],
          text: line,
        }},
        function (error, response, body) {
          if( error ) { 
            console.log( error ) 
          } else { 
            //console.log( body ) 
            if( _i === 29) {
              console.log( "PUBS MADE" )
              if(cb) cb()
            }
          }
        }
      )
    })()
  }
}

var makeDesign = function(cb) {
  var design = {
    _id : "_design/gibber",
    views : {
      foo : {
        map : "function(doc){ emit(doc._id, doc._rev)}"
      }
    }
  }
  
  request.put({ url: 'http://localhost:5984/gibber/_design/test', json:
    {
      _id: '_design/test',
      views: {
        users: {
          map: function(doc) {
            if( doc.type === 'user' ) emit( doc._id, doc._rev )
          }.toString(),
          reduce : "_count"
        },
        all : {
          map: function(doc) { 
            emit( doc._id, doc._rev ) 
          }.toString()
        },
        publications: {
          map: function(doc) { 
            if( doc.type === 'publication' ) { 
              emit( doc.author, doc.text ) 
            } 
          }.toString(),
          reduce : "_count"
        },
      }
    }
  }, function (error, response, body) {
    if( error ) { 
      console.log( "CREATING DESIGN ERROR:", error ) 
    } else { 
      console.log( "CREATING DESIGN:", body ) 
      if(cb) cb()
    }
  })
}

var testDesign = function(cb) {
  request( 'http://localhost:5984/gibber/_design/test/_view/publications', function(e,r,b) {
    console.log( "TESTING DESIGN:", b )
    if(cb) cb()
  })
}

var deleteSearchEngine = function(cb) {
  request({ url:'http://localhost:9200/_river/gibber/', method:'DELETE' },
    function(e,r,b) {
      console.log("SEARCH ENGINE DELETED: ", e,b)
      if(cb) cb()
    }
  )
}
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

var searchDatabase = function(cb) {
  request({ url:'http://localhost:9200/gibber/_search', json:{
      "query": {
          "filtered" : {
              "query" : {
                  "query_string" : {
                      "query" : "Mono"
                  }
              }
          }
      }
  }}, function(e,r,b) {
    console.log("SEARCH RESULTS:", b )
    for(var i = 0; i < b.hits.total; i++ ) {
      console.log("RESULT " + i + ":", b.hits.hits[i]._id, b.hits.hits[i]._source.text )
    }
    if(cb) cb()
  })
}

var functions = [
  deleteDatabase,
  makeDatabase,
  makeUsers,
  makePubs,
  makeDesign,
  testDesign,
  // deleteSearchEngine,
  // makeSearchEngine,
  // searchDatabase
]

var testDatabase = function() {
  var next = 0,
  cb = function() {
    console.log( "NUM:", next )
    if( next <= functions.length - 1 ) {
      functions[next++](cb)
    }
  }
  cb()
}
var search = function(term) {
  console.log( "SEARCH TERM IS: " + term )
  request({ url:'http://127.0.0.1:9200/gibber/_search', json:{
      "query": {
          "filtered" : {
              "query" : {
                  "query_string" : {
                      "query" : term
                  }
              }
          }
      }
  }}, function(e,r,b) {
    console.log("SEARCH RESULTS:", b )
    for(var i = 0; i < b.hits.total; i++ ) {
      console.log("RESULT " + i + ":", b.hits.hits[i]._id, b.hits.hits[i]._source.text )
    }
    if(cb) cb()
  })
}
testDatabase()
//searchDatabase()
//makeSearchEngine()
//deleteSearchEngine()


//makeDatabase()
//deleteDatabase();
//testDesign()
//makeDesign()

//makeFakeUsers()
//makeFakePubs()

var deleteUsers = function(cb) {
  for( var i = 0; i < names.length; i++ ) {
    (function() {
      var _i  = i,
          name = names[ _i ]
      request('http://localhost:5984/gibber/'+name, function(err, response, body) {
        var url = 'http://localhost:5984/gibber/'+name+'?rev=' + JSON.parse(body)._rev
        request( {url:url, method:'DELETE' }, function (error, response, body) {
          if( error ) { 
            console.log( error ) 
          } else { 
            console.log( body )
            if( _i === names.length - 1) {
              if(cb) cb()
            }
          }
        })
      })
    })()
  }
}
