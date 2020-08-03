"use strict";

import Mongodb from 'mongodb';
import Dotenv from 'dotenv';
import validate from 'bitcoin-address-validation';
import Transactions1 from '../transactions/transactions-1.json';
import Transactions2 from '../transactions/transactions-2.json';

let IRA = 0, WC = 0, LC = 0;

async function main() {
    //Import environment variables
    const result = Dotenv.config();
    if (result.error) throw result.error;

    //==========================================================================================================
    /*  STAGE 1: 
        ========
        Read all transactions from `transactions-1.json` and `transactions-2.json` 
        and store all deposits in a database of your choice.
    */

    //Connect to MongoDB
    const MongoClient = Mongodb.MongoClient;
    var uri = process.env.MONGO_CONNECTION_STRING;
    const Client = new MongoClient(uri, { useUnifiedTopology: true }); // useUnifiedTopology removes a warning
    await Client.connect();

    //Delete previous collection in the tables-- TODO: Remove when not testing
    Client
        .db(process.env.MONGO_DB_NAME)
        .collection(process.env.MONGO_COLLECTION_NAME)
        .drop((err, result)=>{
            if(err) throw err;

    //Read all the transactions from the 2 JSON files altogether and save into txs
    let txs = Transactions1["transactions"].concat(Transactions2["transactions"]);
    
    let deposits = []; //Array to hold deposit transactions

    /*  Foreach transaction,
        Consider only deposits,
        verify its validity and mark it as either valid or not(you will need this mark later),
        store it in your deposits array.
    */
    txs.forEach(tx => {

        // 1. Consider only deposit transactions
        if(tx.category != 'receive') return; //Not a deposit transaction - move on to next one
        
        // 2. Ensure deposit has not been previously saved in DB to avoid storing duplicates- find by tx_id
        Client
            .db(process.env.MONGO_DB_NAME)
            .collection(process.env.MONGO_COLLECTION_NAME)
            .findOne({"txid":tx.txid},(result)=>{
                if(result) return; //duplicate detected - move on to next transaction
            }); //end findOne


        // 3. Determine deposit validity - adds validity-related property to the tx object
        tx["validity"] = verify(tx);    /*  Contains 2 sub-properties:
                                            tx["validity"].status; //true or false for valid or invalid deposit respectively
                                            tx["validity"].violations; //if deposit was invalid, this property says why.
                                        */

        // 4. Push deposit transaction to deposits array
        deposits.push(tx);

    }); //end foreach Tx

    console.log(LC + " LCs. " + IRA + " IRAs. " + WC + " WCs.")

    // Insert all extracted deposits into the database -- done outside the loop for efficiency
    Client
        .db(process.env.MONGO_DB_NAME)
        .collection(process.env.MONGO_COLLECTION_NAME)
        .insertMany(deposits, function(err, result){
            if(err) throw err;
            Client.close();
        });// end insertMany

    }); // end delete previous collection-- TODO: Remove when not testing

    //STAGE 1 COMPLETE    
    //==========================================================================================================
    /*  STAGE 2:
        ========
        Read deposits from the database that are good to credit to users
    */


    //STAGE 2 COMPLETE    
    //==========================================================================================================
    /*  OUTPUT:
        =======
       Print the following 8 lines on stdout:
        ```
        Deposited for Wesley Crusher: count=n sum=x.xxxxxxxx
        Deposited for Leonard McCoy: count=n sum=x.xxxxxxxx
        Deposited for Jonathan Archer: count=n sum=x.xxxxxxxx
        Deposited for Jadzia Dax: count=n sum=x.xxxxxxxx
        Deposited for Montgomery Scott: count=n sum=x.xxxxxxxx
        Deposited for James T. Kirk: count=n sum=x.xxxxxxxx
        Deposited for Spock: count=n sum=x.xxxxxxxx
        Deposited without reference: count=n sum=x.xxxxxxxx
        Smallest valid deposit: x.xxxxxxxx
        Largest valid deposit: x.xxxxxxxx
        ```
        The numbers in lines 1 - 7 **MUST** contain the count of valid deposits and their sum for the respective customer.
        The numbers in line 8 **MUST** be the count and the sum of the valid deposits to addresses that are not associated with a known customer.
     */

} //end main

/**
 * 
 * @param {transactionObject} tx 
 * returns validity object:
 *          - validity.Status: (bool) True if tx is a valid deposit, false otherwise, and
 *          - validity.Violations: (string) Explaining why the tx is considered invalid, null if tx is valid.
 */

function verify(tx)
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
        LC++;
    }

    // 2. Recepient is a valid bitcoin address - this check should be made sending the tx to minimize burning btc.
    if(validate(tx.address) == false) //{console.log('Invalid recepient address'); return false;}
    {
        validity.status = false;
        validity.violations += "\n-Invalid recepient address.";
        IRA++;
    }

    // 3. Block timestamp no more than 2 hours in the future

    // 4. Blockhash satisfies nBits proof of work
    
    // 5. Blocktimestamp is no more than 2 hours in the future

    // 6. No wallet conflicts
    if(!tx.walletconflicts.length == 0) //{console.log('Wallet conflicts'); return false;}
    {
        validity.status = false;
        validity.violations += "\n-Wallet conflicts.";
        WC++;
    }

    return validity;
}

main();