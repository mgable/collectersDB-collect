#!/bin/sh

test_document="{
  \"text\": \"HEAR the sledges with the bells, / Silver bells! / What a world of merriment their melody foretells! / How they tinkle, tinkle, tinkle, / In the icy air of night! / While the stars, that oversprinkle / All the heavens, seem to twinkle / With a crystalline delight; / Keeping time, time, time, / In a sort of Runic rhyme, / To the tintinnabulation that so musically wells / From the bells, bells, bells, bells, / Bells, bells, bells— / From the jingling and the tinkling of the bells.\"
}"

if curl -fs -X HEAD localhost:9200/top-terms; then
  echo "Clear the old test index"
  curl -X DELETE localhost:9200/top-terms; echo "\n"
fi

echo "Create our first test index"
curl -X POST localhost:9200/top-terms; echo "\n"

echo "Index our test document"
curl -X POST localhost:9200/top-terms/test/1?refresh=true -d "${test_document}"; echo "\n"

echo "Show the indexed document"
curl localhost:9200/top-terms/test/1
echo "\n"

echo "Our first test, aggregations, only counts the number of documents that a term matches."
curl localhost:9200/top-terms/_search?pretty -d '{
  "aggs": {
    "top-terms-aggregation": {
      "terms": { "field" : "text" }
    }
  }
}'
echo

echo "Recreate the index, with more term vector information"
curl -X DELETE localhost:9200/top-terms; echo
curl -X POST localhost:9200/top-terms -d '{
  "mappings": {
    "test": {
      "properties": {
        "text": {
          "type": "string",
          "term_vector": "with_positions_offsets_payloads"
        }
      }
    }
  }
}'; echo "\n"

echo "Reindex our test document"
curl -X POST localhost:9200/top-terms/test/1?refresh=true -d "${test_document}"; echo "\n"

echo "Query our indexed document to fetch term frequency statistics"
curl "localhost:9200/top-terms/test/1/_termvector?term_statistics=true&pretty"
