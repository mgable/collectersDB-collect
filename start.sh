#!/bin/bash

USER_DIRECTORY="/home/ec2-user/data/"

#USER_DIRECTORY="/Users/markgable/Sites/projects/collectorsDB/collect/"

/usr/local/bin/node "$USER_DIRECTORY"collect/tests/crontest.js

