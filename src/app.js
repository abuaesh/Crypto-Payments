import pkg from 'mongodb';
const { MongoClient } = pkg;
import Dotenv from 'dotenv';

//Import environment variables
const env = Dotenv.config();
if (env.error) throw env.error;

/**
 * Connection URI 
 */
const uri = process.env.MONGO_CONNECTION_STRING;

/**
 * The Mongo Client 
 */
const client = new MongoClient(uri);

async function main() {
    

    try {
        // Connect to the MongoDB cluster
        await client.connect();

        //Delete previous collection in the tables-- TODO: Remove when not testing
        await deleteTxCollection();
        console.log("DB CLear!");

        //Read all the transactions from the 2 JSON files altogether and save into txs array
        let txs = Transactions1["transactions"].concat(Transactions2["transactions"]);
        addTxDocuments(txs);

    } finally {
        // Close the connection to the MongoDB cluster
        await client.close();
    }
}

main().catch(console.error);

async function deleteTxCollection()
{
    await client
        .db(process.env.MONGO_DB_NAME)
        .collection(process.env.TX_COLLECTION_NAME)
        .drop();
}

async function addTxDocuments(txs){
    let deposits = []; //Array to hold deposit transactions

    txs.forEach(tx => {

        // 1. Consider only deposit transactions
        if(tx.category != 'receive') return; //Not a deposit transaction - move on to next one
        
        // 2. Ensure deposit has not been previously saved in DB to avoid storing duplicates
        // This function will do confirmation field updates
        let duplicateFlag = checkForDuplicates(tx);
        if(duplicateFlag) return; //This tx is a duplicate, checkForDuplicates function has taken care of db updates - move on to next one

        // 3. Determine deposit validity - adds validity-related property to the tx object
        let vResult = verify(tx);  
        tx["validityStatus"]  = vResult["status"];//true or false for valid or invalid deposit respectively
        tx["validityViolations"] = vResult["violations"]; //if deposit was invalid, this property says why.

        // 5. Push deposit transaction to deposits array
        deposits.push(tx);

    }); //end foreach Tx
}

async function checkForDuplicates(tx)
{
    await client
    .db(process.env.MONGO_DB_NAME)
    .collection(process.env.TX_COLLECTION_NAME)
    .find({txid:tx.txid},(err, result)=>{
        if(err) throw err;
        if(result) //duplicate found.. check for different confirmation count, update db and return true
        {
            //if confirmations in tx are higher than the detected duplicate, update 
            return true; //raise duplicate flag to avoid re-entry in the db
        }
    }); //end find Duplicate txs
}