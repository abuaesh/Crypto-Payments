import Transactions1 from '../transactions/transactions-1.json';
import Transactions2 from '../transactions/transactions-2.json';
import Dotenv from 'dotenv';
import validate from 'bitcoin-address-validation';
import pkg from 'mongodb';
const { MongoClient } = pkg;


//Import environment variables
const env = Dotenv.config();
if (env.error) throw env.error;

/**
 * Connection URI 
 */
const uri = process.env.MONGO_CONNECTION_STRING;

async function main() {
    
    try {
        
        //Delete previous collection in the tables-- TODO: Remove when not testing
        //await deleteTxCollection();

        //Read all the transactions from the 2 JSON files altogether and save into txs array
        let txs = Transactions1["transactions"].concat(Transactions2["transactions"]);
        addTxDocuments(txs);

    } finally {
        
    }
}

main().catch(console.error);

async function deleteTxCollection()
{
    try{
        /**
        * The Mongo Client 
         */
        const client = new MongoClient(uri);
        // Connect to the MongoDB cluster
        await client.connect();
        await client
            .db(process.env.MONGO_DB_NAME)
            .collection(process.env.TX_COLLECTION_NAME)
            .drop();
    }finally {
        // Close the connection to the MongoDB cluster
        await client.close();
    }
         
}
//==============================================================================
async function addTxDocuments(txs)
{
    try{
        /**
        * The Mongo Client 
         */
        const client = new MongoClient(uri);
        // Connect to the MongoDB cluster
        await client.connect();

        let deposits = []; //save all deposits here

        //txs.forEach(tx => {
        for(var i = 0; i< txs.length; i++){
            let tx = txs[i];

            // 1. Consider only deposit transactions
            if(tx.category != 'receive') return; //Not a deposit transaction - move on to next one
            
            // 2. Ensure deposit has not been previously saved in DB to avoid storing duplicates
            // This function will remove the old occurence of the same tx 
            let duplicate = checkForDuplicates(tx, function(err, res){

            // 3. Determine deposit validity - adds validity-related property to the tx object
            let vResult = verify(tx);  
            tx["validityStatus"]  = vResult["status"];//true or false for valid or invalid deposit respectively
            tx["validityViolations"] = vResult["violations"]; //if deposit was invalid, this property says why.

            console.log(tx);
            // 5. Add tx to the DB
            /*await client
            .db(process.env.MONGO_DB_NAME)
            .collection(process.env.TX_COLLECTION_NAME)
            .insertOne(tx);
            */

            deposits.push(tx); });
        
        }; //end foreach Tx

        await client
        .db(process.env.MONGO_DB_NAME)
        .collection(process.env.TX_COLLECTION_NAME)
        .insertMany(deposits);

    }finally {
        // Close the connection to the MongoDB cluster
        await client.close();
    }
}
//==============================================================================
async function checkForDuplicates(tx)
{
    try{
        /**
        * The Mongo Client 
        */
        const client = new MongoClient(uri);
        // Connect to the MongoDB cluster
        await client.connect();

        let duplicate = await client
        .db(process.env.MONGO_DB_NAME)
        .collection(process.env.TX_COLLECTION_NAME)
        .find({txid: tx.txid}).toArray();

        console.log(duplicate);

        if(duplicate.length == 0) //not a duplicated tx
        {
            return false; 
        }else //duplicate found.. remove old tx from db and return true
        {
            console.log(tx.txid);
            console.log(duplicate[0].txid);
           
            await client
            .db(process.env.MONGO_DB_NAME)
            .collection(process.env.TX_COLLECTION_NAME)
            .deleteOne({txid: tx.txid}, function(err, res){
                if(err) throw err;
                return true; //raise duplicate flag to avoid re-entry in the db-can be used for more checks
            });
 
        } // end if-else
    }finally {
        // Close the connection to the MongoDB cluster
        await client.close();
    }
    
}
//==============================================================================
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

    // 2. Recepient is a valid bitcoin address - this check should be made when sending the tx to minimize burning btc.
    if(validate(tx.address) == false) //{console.log('Invalid recepient address'); return false;}
    {
        validity.status = false;
        validity.violations += "\n-Invalid recepient address.";
        IRA++;
    }

    // 3. Block timestamp no more than 2 hours in the future

    // 4. Blockhash satisfies nBits proof of work
    
    // 5. No wallet conflicts
    if(!tx.walletconflicts.length == 0) 
    {
        validity.status = false;
        validity.violations += "\n-Wallet conflicts.";
        WC++;
    }

    return validity;
}