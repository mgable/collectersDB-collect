#!/bin/bash

#HOST="http://localhost:9200/"
HOST="https://search-mgable-es-ht4qtiycv6v543iujwxk6q5n3u.us-west-2.es.amazonaws.com/"
BUCKET="collectorsdb"
ACCOUNT="advertising_tins"
#INDEXFILE="@/Users/markgable/Sites/data/TEST-collectorsDB/advertising_tins/test/index/advertising_tins.formatted.json"
INDEXFILE="@/Users/markgable/Sites/data/collectorsDB/advertising_tins/index/advertising_tins.formatted.json"
URL=$HOST$BUCKET/$ACCOUNT

echo $URL