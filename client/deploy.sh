#!/bin/bash

echo Enter the version: 
read VERSION

git add .
git commit -m "Version: $VERSION commit"
git push heroku master