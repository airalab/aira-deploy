## Ethereum smart contract compile & deployment

[![Build Status](https://travis-ci.org/airalab/aira-deploy.svg?branch=master)](https://travis-ci.org/airalab/aira-deploy)
![aira-deploy](https://img.shields.io/npm/l/aira-deploy.svg)
![aira-deploy](https://img.shields.io/npm/v/aira-deploy.svg)
![BSD3 License](http://img.shields.io/badge/license-BSD3-brightgreen.svg)

### Usage

    AIRA Deploy :: version 0.6.0
    
    Usage: aira-deploy -I [INCLUDE_DIRS] -A [ARGS] [-O] [--rpc URI] [--library] [--creator] [--abi] [--bytecode] [CONTRACT_NAME]
    
    Options:
      -I          Append source file dirs                      [default: ""]
      -A          Contract constructor arguments [JSON]        [default: "[]"]
      -O          Enable compiler optimization               
      --rpc       Web3 RPC provider                            [default: "http://localhost:8545"]
      --library   Store deployed library address after deploy
      --creator   Generate contract creator library and exit 
      --bytecode  Print compiled and linked bytecode         
      --abi       Generate contract ABI and exit 
