#!/bin/bash

NETWORK=${NETWORK?"NETWORK should be set"}
SQUID_NAME=${SQUID_NAME?"SQUID_NAME should be set"}
SQUID_VERSION=${SQUID_VERSION?"SQUID_VERSION should be set"}

REPO="https://github.com/rmrk-team/skybreach-chunky-gifts"
SQUID_ADDR="$SQUID_NAME"@"$SQUID_VERSION"

existing_indexer=$(npx sqd squid ls | grep -w "$SQUID_NAME")

COMMAND=
if [ -n "$existing_indexer" ]; then
    released_squids=$(npx sqd squid ls --name="$SQUID_NAME")

    last_version=$(awk -F' ' 'NR > 2{print $1}'<<< "$released_squids")

    if [ "$SQUID_VERSION" == "$last_version" ]; then
              COMMAND="update"
            else
              COMMAND="release"
    fi
  else
    COMMAND="release"
fi

echo "Running ${COMMAND} for squid ${SQUID_ADDR}"

npx sqd squid:$COMMAND "$SQUID_ADDR" -e NETWORK="$NETWORK" -v --source $REPO
