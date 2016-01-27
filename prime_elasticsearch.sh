#!/bin/bash

HOST="http://localhost:9200/"
BUCKET="collectorsdb"
ACCOUNT="advertising_tins"
INDEXFILE=$ACCOUNT".formatted.json"
ROOT="/Users/markgable/Sites/projects/collectorsDB/collect/formatted/"
URL=$HOST$BUCKET

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

#curl -o  $ROOT$INDEXFILE $SOURCE

curl -XPOST -H "Content-Type:application/json" $URL/$ACCOUNT'/_bulk' --data-binary "@"$ROOT$INDEXFILE

sleep 3

curl -XGET $HOST'/_cat/indices?v'