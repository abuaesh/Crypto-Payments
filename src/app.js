"use strict";

import mongodb from 'mongodb';
import Dotenv from 'dotenv';
import Transactions1 from '../transactions/transactions-1.json';
import Transactions2 from '../transactions/transactions-2.json';

async function main() {
    //Import environment variables
    const result = Dotenv.config()
    if (result.error) throw result.error

    //Connect to MongoDB
    const MongoClient = mongodb.MongoClient;
    var uri = process.env.MONGO_CONNECTION_STRING;
    const Client = new MongoClient(uri, { useUnifiedTopology: true }); // useUnifiedTopology removes a warning
    await Client.connect();

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
        if(tx.category != 'receive') continue; //Not a deposit transaction - move on to next one
        
        // 2. Ensure deposit has not been previously saved in DB to avoid storing duplicates- find by tx_id
        Client
        .db(process.env.MONGO_DB_NAME)
        .collection(process.env.MONGO_COLLECTION_NAME)
        .findOne({"txid":tx.txid},(result)=>{
            if(result) continue; //duplicate detected - move on to next transaction
        });


        // 3. Determine deposit "validity" field 
        let validity = verify(tx);

        // 4. Push deposit transaction to deposits array
        deposits.push(tx);

    }); //end foreach Tx

    // Insert all extracted deposits into the database -- done outside the loop for efficiency
    Client
        .db(process.env.MONGO_DB_NAME)
        .collection(process.env.MONGO_COLLECTION_NAME)
        .insertMany(deposits);

    Client.close();
} //end main

function verify(deposit_tx)
{

}

main();