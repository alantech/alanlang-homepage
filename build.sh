#!/bin/bash

set -vex

git clone https://github.com/alantech/alan
pushd alan
yarn
yarn bundle
cargo install wasm-pack
yarn wasm-compiler
popd
cp alan/alanStdBundle.js home/alanStdBundle.js
cp -r alan/web_compiler/pkg home/pkg
rm -rf alan