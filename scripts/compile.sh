#!/bin/bash

function show_progress() {
   local pid=$1
    local delay=0.25
    local spinstr="...  "
    local temp
    while ps -p $pid > /dev/null; do
        temp="${spinstr#?}"
        printf "\r[%c%c%c]" "${spinstr:0:1}" "${spinstr:1:1}" "${spinstr:2:1}"
        spinstr="$temp${spinstr:0:1}"
        sleep $delay
    done
    printf "\r        \r" # Clear the line after the task is done
}

echo "🔍 Checking ZK Circuits"

nargo check --overwrite --silence-warnings & pid=$!
show_progress $pid

echo "💽 Compiling ZK Circuits"

nargo compile --skip-brillig-constraints-check --silence-warnings & pid=$!
show_progress $pid

echo "🎉 Done"
