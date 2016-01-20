curl -XDELETE "http://localhost:9200/collectorsdb"

curl -XPUT "http://localhost:9200/collectorsdb"

curl -XPUT "http://localhost:9200/collectorsdb/advertising_tins/_mapping" -d '
{
   "advertising_tins": {
      "properties": {
         "title": {
            "type": "string"
         },
         "link": {
            "type": "string"
         },
         "id": {
            "type": "string"
         },
         "src": {
            "type": "object",
            "properties": {
               "origin": {
                  "type": "string"
               },
               "local": {
                  "type": "string"
               }
            }
         },
         "meta": {
            "type": "object",
            "properties": {
            	"price": {
            		"type": "integer"
            	},
            	"bids": {
            		"type": "integer"
            	},
            	"watchers": {
            		"type": "integer"
            	},
            	"date": {
                  "type": "object",
                  "properties": {
               		"formatted": {
               			"type": "date"
               		},
               		"origin": {
               			"type": "string"
               		}
                  }
            	}
            }
         }
      }
   }
}'

curl -XPOST 'http://localhost:9200/collectorsdb/advertising_tins/_bulk?pretty' --data-binary "@/Users/markgable/Sites/data/collectorsDB/advertising_tins/index/advertising_tins.formatted.json"

sleep 3

curl -XGET 'http://localhost:9200/_cat/indices?v'