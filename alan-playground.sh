#!/bin/bash

rm -rf compiler
rm bundle.js
git clone git@github.com:alantech/compiler.git
cd compiler
yarn install
yarn bundle
mv bundle.js ../bundle.js
rm -rf compiler