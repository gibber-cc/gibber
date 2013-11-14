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
  deleteSearchEngine,
  makeSearchEngine,
  searchDatabase
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
//testDatabase()
//searchDatabase()
//makeSearchEngine()
//deleteSearchEngine()


//makeDatabase()
//deleteDatabase();
//testDesign()
//makeDesign()

//makeFakeUsers()
//makeFakePubs()

// var deleteUsers = function(cb) {
//   for( var i = 0; i < names.length; i++ ) {
//     (function() {
//       var _i  = i,
//           name = names[ _i ]
//   
//       request('http://localhost:5984/gibber/'+name, function(err, response, body) {
//         var url = 'http://localhost:5984/gibber/'+name+'?rev=' + JSON.parse(body)._rev
//         request( {url:url, method:'DELETE' }, function (error, response, body) {
//           if( error ) { 
//             console.log( error ) 
//           } else { 
//             console.log( body )
//             if( _i === names.length - 1) {
//               if(cb) cb()
//             }
//           }
//         })
//       })
//     })()
//   }
// }
var users = [] 

function findById(id, fn) {
  var idx = id;
  if (users[idx]) {
    fn(null, users[idx]);
  } else {
    fn(new Error('User ' + id + ' does not exist'));
  }
}

function findByUsername(username, fn) {
  request(
    { uri:'http://localhost:5984/gibber/_design/test/_view/password?key="'+username+'"', json: true }, 
    function(e,r,b) {
      console.log(b.rows)
      if(b.rows.length === 1) {
        var user = { username:b.rows[ 0 ].key, password: b.rows[ 0 ].value, id:users.length } // MUST GIVE A USER ID FOR SESSION MAINTENANCE
        users.push( user )
        return fn( null, user );
      }else{
        return fn( null, null );
      }
    }
  )
}


// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.
passport.serializeUser( function(user, done) { done(null, user.id); } );

passport.deserializeUser(function(id, done) {
  findById(id, function (err, user) { done(err, user); } );
});


// Use the LocalStrategy within Passport.
//   Strategies in passport require a `verify` function, which accept
//   credentials (in this case, a username and password), and invoke a callback
//   with a user object.  In the real world, this would query a database;
//   however, in this example we are using a baked-in set of users.
passport.use(new LocalStrategy(
  function(username, password, done) {
    console.log("VERIFYING...", username, password)
    // asynchronous verification, for effect...
    process.nextTick(function () {
      
      // Find the user by username.  If there is no user with the given
      // username, or the password is not correct, set the user to `false` to
      // indicate failure and set a flash message.  Otherwise, return the
      // authenticated `user`.
      findByUsername(username, function(err, user) {
        console.log( username, password, user)
        if (err) { return done(err); }
        if (!user) { return done(null, false, { message: 'Unknown user ' + username }); }
        if (user.password != password) { return done(null, false, { message: 'Invalid password' }); }
        return done(null, user);
      })
    });
  }
));

//CORS middleware
var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', ["127.0.0.1:3000", "127.0.0.1:8080"]);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    next();
}

var checkForREST = function( req, res, next ) {
  var arr = req.url.split('/');
  if( arr[1] === 'gibber' ) {
    arr.shift(); arr.shift(); // get rid of first two elements, the first / and gibber/
    var url = escapeString( arr.join('/') )
    
    request('http://localhost:5984/gibber/'+ url, function(err, response, body) {
      res.send( body )
    })
  }else{
    next()  
  }
}

var entityMap = { "&": "%26", "'": '%27', "/": '%2F' };

function escapeString( string ) {
  return String( string ).replace(/[&<>"'\/]/g, function ( s ) {
    return entityMap[ s ];
  });
}
  
var app = express();

app.configure( function() {
  app.set('views', serverRoot + '/snippets')
  app.set('view engine', 'ejs')
  //app.use(express.logger())
  
  app.use( express.cookieParser() )
  app.use( express.bodyParser() )
  //app.use(express.methodOverride())
  app.use( express.session({ secret: 'gibber gibberish gibbering' }) )
  // Initialize Passport!  Also use passport.session() middleware, to support persistent login sessions (recommended)
  app.use( flash() )
  app.use( passport.initialize() )
  app.use( passport.session() )
  app.use( allowCrossDomain )
  app.use( app.router )
  app.use( checkForREST )
  app.use( express.static( serverRoot ) )
})
  
app.get( '/', function(req, res){
  fs.readFile(serverRoot + "index.htm", function (err, data) {
    if (err) {
      next(err);
      return;
    }
    res.writeHead( 200, {
      'Content-Type': 'text/html',
      'Content-Length': data.length
    })

    res.end( data )
  })
})

app.get( '/account', ensureAuthenticated, function(req, res){
  res.render('account', { user: req.user });
})

app.get( '/login', function(req, res){
  console.log(" LOGIN?  ")
  res.render( 'login_start', { user: req.user, message: req.flash('error') });
})

app.get( '/loginStatus', function( req, res ) {
  if( req.isAuthenticated() ) {
    res.send({ username: req.user.username })
  }else{
    res.send({ username: null })
  }
})

app.post( '/test', function(req, res, next){
  console.log(" TESTING  ", req.user, req.isAuthenticated() )
  next()
  //res.render( 'login_start', { user: req.user, message: req.flash('error') });
})

app.get( '/create_publication', function( req, res, next ) {
  res.render( 'create_publication', { user: req.user, message: req.flash('error') });
})

app.post( '/publish', function( req, res, next ) {
  var date = new Date(),
      day  = date.getDate(),
      month = date.getMonth() + 1,
      year = date.getFullYear(),
      time = date.toLocaleTimeString()
  
  request.post({ 
      url:'http://localhost:5984/gibber/', 
      json:{
        _id: req.user.username + '/publications/' + req.body.name,
        name: req.body.name,
        author: req.user.username,
        type: 'publication',
        publicationDate: [year, month, day, time],
        text: req.body.code,
        tags: req.body.tags,
        notes: req.body.notes
      }
    },
    function ( error, response, body ) {
      if( error ) { 
        console.log( error ) 
      } else { 
        console.log( body )
        res.send({ url: req.user.username + '/publications/' + req.body.name })
      }
    }
  )
})

app.post( '/createNewUser', function( req, res, next ) { 
  //console.log(" CREATING A NEW USER SHEESH" )
  request.post({url:'http://localhost:5984/gibber/', json:req.body},
    function (error, response, body) {
      if( error ) { 
        console.log( error ) 
      } else { 
        res.send({ msg:'User account ' + req.body._id + ' created' })
          
        console.log("USER MADE")
      }
    }
  )

})

app.get( '/browser', function( req, res, next ) {
  res.render( 'browser', { user: req.user, message: req.flash('error') });
})

app.post( '/search', function( req, res, next) {
  console.log( req.body, _url + '/_search' )
  request({ url: esUrl , json:{
      "query": {
          "filtered" : {
              "query" : {
                  "query_string" : {
                      "query" : req.body.query
                  }
              }
          }
      }
  }}, function(e,r,b) {
    console.log("SEARCH RESULTS:", b )
    var result = {}
    if(b) {
      if( b.hits ) {
        for(var i = 0; i < b.hits.hits. length; i++ ) {
          console.log( b.hits.hits[i] )
          if( b.hits.hits[i]._id )
            result[ b.hits.hits[i]._id ] = b.hits.hits[i]._source.text
          //console.log("RESULT " + i + ":", b.hits.hits[i]._id, b.hits.hits[i]._source.text )
        }
      }else{
        result.noresults = "No matches were found for your query."
      }
    }else{
      if( b ) {
        result.error = b.indexOf('error') > -1 ? "The gibber database appears to be down. Please contact an administrator" : "No hits were found"
      }else{
        result.error = "The search database is offline. Please, please, please report this to admin@gibber.cc"
        console.log(e, r)
      }
    }
    
    res.send(result)
  })
})

app.post( '/login', function( req, res, next ) {
  passport.authenticate( 'local', function( err, user, info ) {
    var data = {}
    console.log( "LOGGING IN... ", user, err, info )
    if (err) { return next( err ) }
    
    if (!user) {
      res.send({ error:'Your username or password is incorrect. Please try again.' })
    }else{
      req.logIn( user, function() { 
        console.log( "I AM LOGGED IN WTF ")
        res.send({ username: user.username }) 
      });
    }
  })( req, res, next );
})

app.get('/logout', function(req, res, next){
  console.log( "TRYING TO LOG OUT" )
  if( req.user ) {
    req.logout();
    res.send({ msg:'logout complete' })
  }else{
    console.log( "There wasn't any user... " )
    res.send({ msg:'you aren\t logged in... how did you even try to logout?' })
  }
  
  //res.redirect('/');
});

// app.post('/publish', function( req, res, next ) {
//   console.log( "PUBLISHING", req.body, req.user.username )
//   res.send({ msg:'published.' })
// })

app.listen( 80 );


// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login')
}

/*
  if( req.uri.pathname === "/__newuser" ) {
    //console.log(req.body)
    
    console.log(" NEW USER ")
    request.post({url:'http://localhost:5984/gibber/', json:req.body},
      function (error, response, body) {
        if( error ) { 
          console.log( error ) 
        } else { 
          //if(_i === names.length -1) {
          //  console.log("USERS MADE")
          //  if(cb) cb()
          //}
        }
      }
*/
