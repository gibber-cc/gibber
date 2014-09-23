var cradle = require('cradle');
 
var database = 'gibber';
 
cradle.setup({
    host: '127.0.0.1',
    port: 5984,
    //auth: { username: "YOUR_USERNAME", password: "YOUR_PASSWORD" }
});
 
var db = new(cradle.Connection)().database(database);
 
/* Delete non-design documents in a database. */
db.all(function(err, doc) {
    /* Loop through all documents. */
    for(var i = 0; i < doc.length; i++) {
        /* Don't delete design documents. */
        if(doc[i].id.indexOf("_design") == -1) {
            db.remove(doc[i].id, doc[i].value.rev, function(err, doc) {
                console.log(doc);
            });
        }
    }
});