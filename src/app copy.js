"use strict";

import Mongodb from 'mongodb';
import Dotenv from 'dotenv';
import validate from 'bitcoin-address-validation';
import Transactions1 from '../transactions/transactions-1.json';
import Transactions2 from '../transactions/transactions-2.json';

let IRA = 0, WC = 0, LC = 0;

//Import environment variables
const result = Dotenv.config();
if (result.error) throw result.error;

async function main() {

    /*  STAGE 0: 
        ========
        Start Database Client, setup collections, ensure customers collection is set, etc.
    */

    //await startDb(); //sets database client
    
    //1. Connect to MongoDB
    const MongoClient = Mongodb.MongoClient;
    var uri = process.env.MONGO_CONNECTION_STRING;
    const Client = new MongoClient(uri, { useUnifiedTopology: true }); // useUnifiedTopology removes a warning
    await Client.connect();

    //txCollection = client.db(process.env.MONGO_DB_NAME).collection(process.env.TX_COLLECTION_NAME);
    //customerCollection = client.db(process.env.MONGO_DB_NAME).collection(process.env.CUSTOMER_COLLECTION_NAME);

    //==========================================================================================================
    /*  STAGE 1: 
        ========
        Read all transactions from `transactions-1.json` and `transactions-2.json` 
        and store all deposits in a database of your choice.
    */
    //Read all the transactions from the 2 JSON files altogether and save into txs array
    let txs = Transactions1["transactions"].concat(Transactions2["transactions"]);
    
    /*  Foreach transaction,
        Consider only deposits,
        verify its validity and mark it as either valid or not(you will need this mark later),
        store it in your deposits array.
    */

    let deposits = [];
    txs.forEach(tx => {

        // 1. Consider only deposit transactions
        if(tx.category != 'receive') return; //Not a deposit transaction - move on to next one
        
        // 2. Ensure deposit has not been previously saved in DB to avoid storing duplicates- find by tx_id
        Client
        .db(process.env.MONGO_DB_NAME)
        .collection(process.env.TX_COLLECTION_NAME)
        .find({txid: tx.txid}).toArray(function(err, result){
            if(err) throw err;
            if(result.length > 0) //Duplicate detected
            {
                console.log(result);
                //Check if the new tx has more confirmations than the one found in the database:
                if(tx.confirmations > result[0].confirmations)
                {
                    console.log('Duplicate detected for tx: ' + tx.txid);
                    /*  Update your database with the new tx,
                        Even if the old tx already had 6 confirmations? 
                        - Yes, just in case, keep your db up-to-date.(e.g. min. confirmations may change later.)
                    */
                    //Delete the old tx. It will be replaced by the new tx.
                    /*Client
                        .db(process.env.MONGO_DB_NAME)
                        .collection(process.env.TX_COLLECTION_NAME)
                        .deleteOne({"txid":tx.txid},(err, result)=>{
                            if(err) throw errr;
                        }); //end delete duplicate*/
                }
                else
                {
                    //TODO: think about more reasons why would you get the same tx twice? Address these cases here.
                    return;  // Otherwise, if you don't care about other changes in the tx, ignore the duplicate and move on to next transaction.
                }
            }
        }); //end findOne


        // 3. Determine deposit validity - adds validity-related property to the tx object
        tx["validity"] = verify(tx);    /*  Contains 2 sub-properties:
                                            tx["validity"].status; //true or false for valid or invalid deposit respectively
                                            tx["validity"].violations; //if deposit was invalid, this property says why.
                                        */

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

async function startDb()
{
    //2. Ensure user collection data exists, if not, create it.

    //3. Ensure empty tx collection. If not, delete it to ensure clean testing-- TODO: Remove when not testing
    /*await Client
        .db(process.env.MONGO_DB_NAME)
        .collection(process.env.TX_COLLECTION_NAME)
        .drop();
*/

} // end startDb

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
        validity.violations += "\n-Less than 6 confirmations."; //These could be on the watchout in susequent `listsinceblock` calls,
                                                                // because they may reach minimum confirmations in later blocks.
        LC++;
        console.log(LC);
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