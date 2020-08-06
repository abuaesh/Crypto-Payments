"use strict";

import Mongodb from 'mongodb';
import Dotenv from 'dotenv';
import validate from 'bitcoin-address-validation';
import Transactions1 from '../transactions/transactions-1.json';
import Transactions2 from '../transactions/transactions-2.json';
import Customers from '../customers.json';

async function readTxsFromJson()
{
    //Read all the transactions from the 2 specified JSON files altogether and save into txs array
    let txs = Transactions1["transactions"];//.concat(Transactions2["transactions"]);
    return txs;
}

async function getOnlyDeposits(txs)
{
    let deposits = [];
    txs.forEach(tx => {
        if(tx.category != 'receive')
        {
            return; //Not a deposit transaction - move on to next one
        }
        else{
            deposits.push(tx);
        }
    });
    return deposits;
}

async function processDeposits(txs)
{
    // 1. Consider only deposit transactions
    let deposits = await getOnlyDeposits(txs);

    console.log('recieved from onlydepo' + deposits.length);

    // 2. Ensure this list does not contain duplicates within
    let uniqueDeposits = await removeDuplicates(deposits);

    console.log('received from unique ' + uniqueDeposits.length);

    // 3. Determine deposit validity - adds validity-related property to the tx object
    let verifiedDeposits = await verifyDeposits(uniqueDeposits);
    console.log('received from verify ' + verifiedDeposits.length);


    // 5. Mark known/unkown recepient address
    let finalDeposits = await determineKnownTxs(verifiedDeposits);
    console.log('received from knowledge ' + finalDeposits.length);


    return finalDeposits;
}

async function determineKnownTxs(txs)
{
    let markedDeposits = [];

    for(var i =0; i < txs.length; i++){
        let tx = txs[i];

        let kResult = await isKnownDeposit(tx); 

        tx["known"]  = kResult; //false for unreferenced deposits

        markedDeposits.push(tx);
    }
    console.log('mark knowledge returning to mother ' + markedDeposits.length);

    return markedDeposits;
}

async function isKnownDeposit(tx)
{
    let know = false;

    //Query customers DB for tx.account


    return know;
}

async function removeDuplicates(deposits)
{
    let uniqueDeposits = [];

    for(var i = 0; i < deposits.length-1; i++ )
    {
        let duplicatedTx = await isDuplicated(i, deposits);
        if(!duplicatedTx) //If no duplicates were found in the rest of the array
        {
            // Push deposit transaction to unique deposits array
            uniqueDeposits.push(deposits[i]);
        } 
    }

    uniqueDeposits.push(deposits[deposits.length-1]); //Insert last tx manually
    
    return uniqueDeposits;
}

//returns true if the tx at the given index is duplicated in the rest of deposits array.
async function isDuplicated(index, txs)
{
    let d = txs[index];

    for(var i = index+1; i < txs.length; i++){
        //Check for similar txid 
            if(txs[i].txid == d.txid)
            {
                return true;
            }

    }
    return false;
}

async function verifyDeposits(txs)
{
    let verifiedDeposits = [];
    txs.forEach(tx => {
        let vResult = verify(tx);  
        tx["validityStatus"]  = vResult["status"];//true or false for valid or invalid deposit respectively
        tx["validityViolations"] = vResult["violations"]; //if deposit was invalid, this property says why.

        verifiedDeposits.push(tx);
    });
    return verifiedDeposits;
}

async function verify(tx)
{
    // Start with assuming true validity
    let validity = {
                        status: true,
                        violations: ""
                    };

    //Perform validity checks:

    // 0. Ensure tx is correct
    /*  
    It is given that the txs are returned by rpc calls to bitcoind,
    but this is to ensure the files were not altered.
    E.g. No fake txs were injected in them / No incorrect details of transactions
    */
        // 0.a Transaction exists on the bitcoin network (txid comparison)

        // 0.b Transaction details are accurate (txhash comparison) - Checking tx hash ensures all its details are accurate

    // 1. At least 6 confirmations.
    if(tx.confirmations < 6) //{console.log('Less than 6 confirmations.'); return false;}
    {
        validity.status = false;
        validity.violations += "\n-Less than 6 confirmations.";
    }

    // 2. Recepient is a valid bitcoin address - this check should be made when sending the tx to minimize burning btc.
    if(validate(tx.address) == false) //{console.log('Invalid recepient address'); return false;}
    {
        validity.status = false;
        validity.violations += "\n-Invalid recepient address.";
    }

    // 3. Block timestamp no more than 2 hours in the future

    // 4. Blockhash satisfies nBits proof of work
    
    // 5. No wallet conflicts
    if(!tx.walletconflicts.length == 0) 
    {
        validity.status = false;
        validity.violations += "\n-Wallet conflicts.";
    }

    return validity;
}


async function main()
{
    try{
        let txs = await readTxsFromJson();

        let deposits = await processDeposits(txs);


    }catch(e)
    {
        throw e;
    }

}

main().catch(console.error);