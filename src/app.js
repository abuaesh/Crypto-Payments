"use strict";

import mongodb from 'mongodb';
import Dotenv from 'dotenv';
import Transactions1 from '../transactions/transactions-1.json';
import Transactions2 from '../transactions/transactions-2.json';

(async() => {
    //import environment variables
    const result = Dotenv.config()
    if (result.error) throw result.error

    //Connect to MongoDB
    const MongoClient = mongodb.MongoClient;
    var uri = process.env.MONGO_CONNECTION_STRING;
    const Client = new MongoClient(uri, { useUnifiedTopology: true }); // useUnifiedTopology removes a warning

    // Connect
    Client
    .connect()
    .then(client =>
    {
        //Read all the transactions from the 2 JSON files altogether and save into txs
        let txs = Transactions1["transactions"].concat(Transactions2["transactions"]);

        //Save only the deposit transactions to your database collection
        // Foreach deposit transaction, verify it is a valid transaction and mark it as such in your database(you will need this mark later)
        var counterD = 0, counterN = 0;
        txs.forEach(tx => {
            if(tx.category == 'receive') 
            {
                counterD++;
            }
            else counterN++;
        })

        console.log(counterD + ' Desposits.');
        console.log(counterN + ' Non-desposits.');

        /* //TODO: implement later- Check list of available Dbs for your target DB,
            //if the DB you are looking for does not exist, create it.
        client
        .db()
        .admin()
        .listDatabases() // Returns a promise that will resolve to the list of databases
        })
    .then(dbs => {
        console.log("Mongo databases:", dbs);
        //TODO: Implement these functions:
        databaseExists(dbs, process.env.MONGO_DB_NAME).then(exists => {
            if(!exists) createDatabase(process.env.MONGO_DB_NAME);
        });*/
    })
    .catch(err => console.log(err))
    .finally(() => Client.close()); // Closing after getting the data

})(); //end async