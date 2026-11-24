#!/bin/sh
T=/Users/finn/vivalence/code/vivalence/subsystems/paladin

echo "== paladin.<key> read by the instance lifecycle and its factory, with uses"
grep -ohE 'paladin\.[A-Za-z_]+' \
  "$T/instance/factory.js" \
  "$T/instance/lifecycle/1-population.js" \
  "$T/instance/lifecycle/2-resolution.js" \
  "$T/instance/lifecycle/3-integration.js" | sort | uniq -c

echo "== members the class declares (fields, methods, getters, constructor)"
grep -nE '^  [a-z]+ = |^  [a-z]+\(|^  get [a-z]+\(|^    this\.[a-z]+ = ' "$T/paladin/prototype.js"

echo "== where the lifecycle hangs each undeclared key on"
grep -nE 'paladin\.(scope|find|read|expand|publish|instance|is|check|control) = ' -r "$T" --include='*.js' | grep -v '/tests/'

echo "== every paladin.<key> = assignment in paladin, by key"
grep -ohE 'paladin\.[A-Za-z_]+ = ' -r "$T" --include='*.js' --exclude-dir=tests | sort | uniq -c
