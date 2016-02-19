curl -XPUT "http://search-mgable-es-ht4qtiycv6v543iujwxk6q5n3u.us-west-2.es.amazonaws.com/collectorsdb/advertising_tins/_mapping" -d'
{
  "advertising_tins": {
      "_timestamp": {"enabled": true}
  }
}'