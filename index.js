#!/usr/bin/env node

const Web3 = require('web3');
const web3 = new Web3();

const fs = require('fs');
const path = require('path');
const compiler = require('./lib/compiler.js');
const version = require('./package.json').version;

const mainsol  = process.cwd() + '/contracts';
const cachedir = process.cwd() + '/.cache';
const libsfile = process.cwd() + '/.libs.json';

const opt = require('optimist')
    .usage('AIRA Deploy :: version '+version+'\n\nUsage: $0 -I [INCLUDE_DIRS] -A [ARGS] [-O] [--rpc URI] [--library] [--creator] [--abi] [--bytecode] [CONTRACT_NAME]')
    .default({I: '', A: '[]', rpc: 'http://localhost:8545'})
    .boolean(['library', 'creator', 'abi', 'O'])
    .describe('I', 'Append source file dirs')
    .describe('A', 'Contract constructor arguments [JSON]')
    .describe('O', 'Enable compiler optimization')
    .describe('rpc', 'Web3 RPC provider')
    .describe('library', 'Store deployed library address after deploy')
    .describe('creator', 'Generate contract creator library and exit')
    .describe('bytecode', 'Print compiled and linked bytecode')
    .describe('abi', 'Generate contract ABI and exit');
const argv = opt.argv;

if (argv._.length == 0 && !argv.abi) {
    console.log(opt.help());
    process.exit();
}

var soldirs = argv.I == '' ? [] : (typeof(argv.I) == 'string' ? [argv.I] : argv.I);
soldirs.push(mainsol); 

web3.setProvider(new web3.providers.HttpProvider(argv.rpc));
const args = JSON.parse(argv.A);

compiler.compile(soldirs, cachedir, argv.O, function (compiled) {
    if (typeof(compiled.errors) != 'undefined') {
        console.log('An error occured:');
        for (var i in compiled.errors)
            console.log(compiled.errors[i]);
    } else if (argv.abi) {
        if (argv._.length == 1) {
            const contract = argv._[0];
            const abi = compiled.contracts[contract].interface.replace("\n", "");
            console.log('\nContract:\t' + contract);
            console.log(abi);
        } else {
            for (var module in compiled.contracts) {
                var abi = compiled.contracts[module].interface.replace("\n", "");
                console.log('Dumping '+module+'...');
                fs.writeFile('abi/'+module+'.json', abi);
            }
        }
    } else {
        for (var i in argv._) {
            const contract = argv._[i];
            const bytecode = compiled.contracts[contract].bytecode;
            const linked_bytecode = compiler.link(libsfile, bytecode);
            const abi = compiled.contracts[contract].interface.replace("\n", "");

            console.log('\nContract:\t' + contract);
            console.log('Binary size:\t' + linked_bytecode.length / 2 / 1024 + "K\n");
            if (argv.bytecode) console.log('Bytecode: '+linked_bytecode);

            if (argv.creator) {
                // Generate creator library
                require('./lib/codegen.js')
                    .creator(compiled, contract, soldirs[0], version);
            } else {
                // Deploy contract
                require('./lib/deploy.js')(JSON.parse(interface),
                                           linked_bytecode, args, web3,
                                           function (contract_address) {
                    if (argv.library) {
                        compiler.reglib(libsfile, contract, contract_address);
                        console.log('Library address added to '+libsfile);
                    }
            
                    console.log('Deployed: ' + contract_address);
                });
            }
        }
    }
});
