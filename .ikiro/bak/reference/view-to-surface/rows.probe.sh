#!/bin/sh
# limit: 500 chars · the rows holding a pattern in the files named, cut to 170 chars. $1 = pattern, rest = files
pattern=$1
shift
/usr/bin/grep -nIwE "$pattern" "$@" | cut -c1-170
