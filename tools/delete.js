var AWS = require("aws-sdk");

var credentials = new AWS.SharedIniFileCredentials({profile: 'mgable'});
        AWS.config.credentials = credentials;

AWS.config.update({
    region: "us-west-1",
    endpoint: "http://localhost:8000"
});

var docClient = new AWS.DynamoDB.DocumentClient();

var params = {
    TableName: "fiesta_store",
    FilterExpression: "#date < :date",
    ExpressionAttributeNames: {
        "#date": "date",
    },
    ExpressionAttributeValues: {
         ":date": 20160404,
    }
};

console.log("Scanning Movies table.");
docClient.scan(params, onScan);

var count = 0, items = [];

function onScan(err, data) {
    if (err) {
        console.error("Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));
    } else {

        count += data.Items.length;
        // print all the movies
        console.log("Scan succeeded.");
        items = items.concat(data.Items);

        // data.Items.forEach(function(movie) {
        //    console.log(movie.title);
        //    console.info(movie.date);
        // });

        // continue scanning if we have more movies
        if (typeof data.LastEvaluatedKey != "undefined") {
            console.log("Scanning for more...");
            params.ExclusiveStartKey = data.LastEvaluatedKey;
            docClient.scan(params, onScan);
        } else {
            console.info("Finished Scaning");
            console.info(items);
            console.info(count);
            remove(items);
        }
    }
}

function makeItems(items){
    return items.map(function(item){
        return {DeleteRequest:
            {Key: 
                {link: item.link, date: item.date}
            }
        }
    });
}

function remove(items){
    var count = 0;
    var processItems = makeItems(items);
    var params = {
        RequestItems: { // A map of TableName to Put or Delete requests for that table
             "fiesta_store": []
        }   
    }

    delIt(processItems)

    function delIt(results){
        if (results.length){
            params.RequestItems.fiesta_store = results.splice(0,25);
            docClient.batchWrite(params, onDelete);
            delIt(results)
        } else {
            console.info("DONE!!!!!!");
        }
    }

    function onDelete(err, data){
         if (err) {
            console.error("Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));
        } else {

            console.log("Delete succeeded.");
            console.info(data);


            // continue scanning if we have more movies
            if (typeof data.LastEvaluatedKey != "undefined") {
                console.log("Scanning for more...");
                params.ExclusiveStartKey = data.LastEvaluatedKey;
                docClient.BatchWrite(params, onDelete);
            } else {
                console.info("Finished Deleteeing");
                console.info(items);
                console.info(count);
            }
        }
    }

}




/***************************************
// works
var params = {
    RequestItems: { // A map of TableName to Put or Delete requests for that table
        fiesta_store: [ // a list of Put or Delete requests for that table

            { // An example DeleteRequest
                DeleteRequest: {
                    Key: { 
                        link: "http://rover.ebay.com/rover/1/711-53200-19255-0/1?campid=5336393627&toolid=10013&customId=china-and-dinnerware/fiesta&mpre=http://www.ebay.com/itm/311567506065",
                        date:20160323
                    }
                }
            },
            { // An example DeleteRequest
                DeleteRequest: {
                    Key: { 
                        link: "http://rover.ebay.com/rover/1/711-53200-19255-0/1?campid=5336393627&toolid=10013&customId=china-and-dinnerware/fiesta&mpre=http://www.ebay.com/itm/291710233988",
                        date:20160323
                    }
                }
            },
            { // An example DeleteRequest
                DeleteRequest: {
                    Key: { 
                        link: "http://rover.ebay.com/rover/1/711-53200-19255-0/1?campid=5336393627&toolid=10013&customId=china-and-dinnerware/fiesta&mpre=http://www.ebay.com/itm/281961424735",
                        date:20160323
                    }
                }
            },
        ],
        // ... more tables ...
    },
    ReturnConsumedCapacity: 'NONE', // optional (NONE | TOTAL | INDEXES)
    ReturnItemCollectionMetrics: 'NONE', // optional (NONE | SIZE)
};
docClient.batchWrite(params, function(err, data) {
    if (err) ppJson(err); // an error occurred
    else ppJson(data); // successful response
});
*/