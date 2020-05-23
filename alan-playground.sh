#!/bin/bash

rm -rf compiler
rm bundle.js
git clone git@github.com:alantech/compiler.git
cd compiler
yarn install
yarn bundle
cd ..
mv compiler/bundle.js bundle.js
rm -rf compiler