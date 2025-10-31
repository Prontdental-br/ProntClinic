#!/bin/bash

declare -r app_name="prontdental-web"
declare -r version="1.0"

set -e

export NODE_ENV="production"
npm run build

zip -r app.zip .next pages public styles *.json *.js
