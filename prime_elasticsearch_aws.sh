#!/bin/bash

#HOST="http://localhost:9200/"
HOST="https://search-mgable-es-ht4qtiycv6v543iujwxk6q5n3u.us-west-2.es.amazonaws.com/"
SOURCE="https://s3-us-west-1.amazonaws.com/test-collectors-db/advertising_tins/index/advertising_tins.formatted.json"
ES_INDEX="test-collectorsdb"
ACCOUNT="advertising_tins"
INDEXFILE=$ACCOUNT".formatted.json"
#ROOT="/Users/markgable/Sites/projects/collectorsDB/collect/formatted/"
ROOT="/home/ec2-user/data/formatted/"
#INDEXFILE="@/Users/markgable/Sites/data/collectorsDB/advertising_tins/index/advertising_tins.formatted.json"
URL=$HOST$ES_INDEX

curl -XDELETE $URL

curl -XPUT $URL

curl -XPUT $URL/$ACCOUNT"/_mapping" -d '
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

curl -o  $ROOT$INDEXFILE $SOURCE

curl -XPOST -H "Content-Type:application/json" $URL/$ACCOUNT'/_bulk' --data-binary "@"$ROOT$INDEXFILE

sleep 3

curl -XGET $HOST'/_cat/indices?v'