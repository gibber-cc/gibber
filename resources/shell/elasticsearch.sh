curl -XPUT 'localhost:9200/_river/gibber/_meta' -d '{
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
}'