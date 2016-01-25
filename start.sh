#!/bin/bash

USER_DIRECTORY="/home/ec2-user/data/"

/usr/local/bin/node "$USER_DIRECTORY"fetch_data.js

/usr/local/bin/node "$USER_DIRECTORY"save_diff.js

/usr/local/bin/node "$USER_DIRECTORY"save_store.js

/usr/local/bin/node "$USER_DIRECTORY"fetch_additional_images.js

/usr/local/bin/node "$USER_DIRECTORY"save_index.js

"$USER_DIRECTORY"prime_elasticsearch_aws.sh