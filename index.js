const compiler = require('./lib/compiler.js');
const deployer = require('./lib/deploy.js');
const version = require('./package.json').version;

const mainsol  = process.cwd() + '/contracts';
const cachedir = process.cwd() + '/.cache';
const libsfile = process.cwd() + '/.libs.json';

module.exports = function(soldirs, optimization, web3, contract, args, cb) {
    soldirs.push(mainsol);

    compiler.compile(soldirs, cachedir, optimization, function (compiled) {
        if (typeof(compiled.errors) != 'undefined') {
            console.log('An error occured:');
            for (var i in compiled.errors)
                console.log(compiled.errors[i]);
        } else {
            const bytecode = compiled.contracts[contract].bytecode;
            const linked_bytecode = compiler.link(libsfile, bytecode);
            const abi = compiled.contracts[contract].interface.replace("\n", "");

            console.log('\nContract:\t' + contract);
            console.log('Binary size:\t' + linked_bytecode.length / 2 / 1024 + "K\n");
            // Deploy contract
            deployer(JSON.parse(abi), linked_bytecode, args, web3, function(contract_address) {
                cb(web3.eth.contract(abi).at(contract_address));
            });
        }
    });
};
