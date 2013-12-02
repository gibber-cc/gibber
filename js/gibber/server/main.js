gibber = {}

var request         = require( 'request' ),
    connect         = require( 'connect' ),
    url             = require( 'url' ),
    fs              = require( 'fs' ),
    passport        = require( 'passport' ),
    //flash           = require( 'connect-flash' ),
    express         = require( 'express' ),
    sharejs         = require( 'share' ).server,
    app             = express(),
    server          = require( 'http' ).createServer( app ),
    util            = require( 'util' ),
    LocalStrategy   = require( 'passport-local' ).Strategy,
    // _url            = 'http://localhost:5984/gibber',
    _url            = 'http://127.0.0.1:5984/gibber',
    esUrl           = 'http://localhost:9200/gibber/_search',
    webServerPort   = 80,
    serverRoot      = __dirname + "/../../../",
    // livedb          = require( 'livedb' ),
    // livedbMongo     = require( 'livedb-mongo'),
    // browserChannel  = require( 'browserchannel' ).server,
    // Duplex          = require('stream').Duplex,
    // shareCodeMirror = require( 'share-codemirror' ),
    chat            = null;

gibber.server = server
require( './chat.js' )

sharejs.attach( app, { db: {type:'none' }, browserChannel: { cors:'*' } } )

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
      if(b.rows && b.rows.length === 1) {
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
    // asynchronous verification, for effect...
    process.nextTick(function () {
      
      // Find the user by username.  If there is no user with the given
      // username, or the password is not correct, set the user to `false` to
      // indicate failure and set a flash message.  Otherwise, return the
      // authenticated `user`.
      findByUsername(username, function(err, user) {
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
   // res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept')
    next();
}

var checkForREST = function( req, res, next ) {
  var arr = req.url.split('/');
  if( arr[1] === 'gibber' ) {
    arr.shift(); arr.shift(); // get rid of first two elements, the first / and gibber/
    var url = escapeString( arr.join('/') )
    request('http://localhost:5984/gibber/'+ url, function(err, response, body) {
      res.send( body )
      // res.redirect( 'http://gibber.mat.ucsb.edu/?url='+url, { loadFile: body } )
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
  
// var app = express();
app.engine('htm', require('ejs').renderFile);
app.configure( function() {
  app.set('views', serverRoot + '/snippets')
  app.set('view engine', 'ejs')
  //app.use(express.logger())
  
  app.use( express.cookieParser() )
  app.use( express.bodyParser() )
  //app.use(express.methodOverride())
  app.use( express.session({ secret: 'gibber gibberish gibbering' }) )
  // Initialize Passport!  Also use passport.session() middleware, to support persistent login sessions (recommended)
  app.use( passport.initialize() )
  app.use( passport.session() )
  // app.use( allowCrossDomain )
  app.use( app.router )
  app.use( checkForREST )
  
  app.use( express.static( serverRoot ) )
  app.use(function(err, req, res, next){
    console.error(err.stack);
    res.send(500, 'Something broke!');
  });
})


  
app.get( '/', function(req, res){
  
  console.log( req.query )
  if( req.query && req.query.path ) {
    request('http://localhost:5984/gibber/' + escapeString(req.query.path), function(err, response, body) {
      if( body && typeof body.error !== 'undefined' ) {
        res.render( 'index', { loadFile:body } )
      }else{
        res.render( 'index', { loadFile: JSON.stringify({ error:'path not found' }) })
      }
    })
  }else{
    res.render( 'index', { loadFile:null } )
  }
  // fs.readFile(serverRoot + "index.htm", function (err, data) {
  //   if (err) {
  //     next(err);
  //     return;
  //   }
  //   res.writeHead( 200, {
  //     'Content-Type': 'text/html',
  //     'Content-Length': data.length
  //   })

  //   res.end( data )
  // })
})

app.get( '/account', ensureAuthenticated, function(req, res){
  res.render('account', { user: req.user });
})

app.get( '/login', function(req, res){
  // console.log(" LOGIN?  ")
  res.render( 'login_start', { user: req.user, message:'login' /*req.flash('error')*/ });
})

app.get( '/loginStatus', function( req, res ) {
  if( req.isAuthenticated() ) {
    res.send({ username: req.user.username })
  }else{
    res.send({ username: null })
  }
})

// app.post( '/test', function(req, res, next){
//   // console.log(" TESTING  ", req.user, req.isAuthenticated() )
//   next()
//   //res.render( 'login_start', { user: req.user, message: req.flash('error') });
// })

app.post( '/retrieve', function( req, res, next ) {
  // console.log( req.body )
  var suffix = req.body.address.replace(/\//g, '%2F')
  // console.log(suffix)
  request( 'http://localhost:5984/gibber/' + suffix, function(e,r,b) {
    // console.log( b )
    res.send( b )
  })
})

app.get( '/create_publication', function( req, res, next ) {
  res.render( 'create_publication', { user: req.user, message:'publication' } );
})

app.post( '/publish', function( req, res, next ) {
  console.log(" PUBLISH ", req.body )
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
        permissions : req.body.permissions,
        notes: req.body.notes
      }
    },
    function ( error, response, body ) {
      if( error ) { 
        console.log( error ) 
      } else { 
        // console.log( body )
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
        res.send({ msg: 'The server was unable to create your account' }) 
      } else { 
        res.send({ msg:'User account ' + req.body._id + ' created' })
          
        // console.log("USER MADE")
      }
    }
  )

})

app.get( '/welcome', function( req, res, next ) {
  res.render( 'welcome', {
    user:req.user
  })
})

app.get( '/documentation', function( req, res, next ) {
  res.render( 'docs', {
    user:req.user
  })
})
app.get( '/help', function( req, res, next ) {
  res.render( 'help', {
    user:req.user
  })
})
app.get( '/docs/', function( req,res,next ) { 
  res.render( '../docs/output/'+req.query.group+'/'+req.query.file+'.htm' )
})
app.get( '/credits', function( req,res,next ) { 
  res.render( 'credits' )
})
app.get( '/browser', function( req, res, next ) {
  request( 'http://localhost:5984/gibber/_design/test/_view/demos', function(e,r,b) {
    // console.log( (JSON.parse(b)).rows )
    var _audio = [], _3d = [], _2d = [], _misc=[], demoRows = JSON.parse( b ).rows

    for( var i =0; i < demoRows.length; i++ ) {
      var cat = 'misc', row = demoRows[ i ]
      if( row.key.split('*').length > 0 ) {
        cat = row.key.split('*')[1]
        switch( cat ) {
          case '2d' :
            _2d.push( row ); break;
          case '3d' : _3d.push( row ); break;
          case 'audio' : _audio.push( row ); break;
          default:
            _misc.push( row ); break;
        }
      }
    }

    if( req.user ) {
      request( 'http://localhost:5984/gibber/_design/test/_view/publications?key=%22'+req.user.username+'%22', function(e,r,_b) {
        res.render( 'browser', {
          user: req.user,
          demos:( JSON.parse(b) ).rows,
          audio:_audio,
          _2d:_2d,
          _3d:_3d,
          misc:_misc,
          userfiles:(JSON.parse(_b)).rows,
          // message: req.flash('error')
        });
      })
    }else{
      res.render( 'browser', {
        user: req.user,
        demos:(JSON.parse(b)).rows, 
        audio:_audio,
        _2d:_2d,
        _3d:_3d,
        misc:_misc,
        userfiles:[],
        // message: req.flash('error')
      });
    }
  });
})

app.get( '/chat', function( req, res, next ) {
  var result = {}
  if( !req.user ) {
    result.error = "You must log in (create an account if necessary) before using chat."
    res.send( result )
  }else{
    res.render( 'chat' )
  }
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
      },
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

server.listen( webServerPort );


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
