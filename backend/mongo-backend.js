// Reference: https://www.mongodb.com/blog/post/quick-start-nodejs-mongodb--how-to-get-connected-to-your-database
//import customers from './customers.json';
import mongodb from 'mongodb';
import Dotenv from 'dotenv';

export default class MongoBackend{
    constructor(uri){

        //import environment variables
        const result = Dotenv.config()
        if (result.error) throw result.error

        const MongoClient = mongodb.MongoClient;

        const client = new MongoClient(uri, { useUnifiedTopology: true }); // useUnifiedTopology removes a warning

        // Connect
        client
        .connect()
        .then(client =>
        {
            let mongoDoc = {"involvesWatchonly":true,"account":"","address":"mmFFG4jqAtw9MoCC88hw5FNfreQWuEHADp","category":"receive","amount":8,"label":"","confirmations":1,"blockhash":"3125fc0ebdcbdae25051f0f5e69ac2969cf910bdf5017349ef55a0ef9d76d591","blockindex":28,"blocktime":1524913087278,"txid":"146df95d04dc205f10cbb07d4a55d0ed924056a6a4c8873823fd09811b76387e","vout":32,"walletconflicts":[],"time":1524913064422,"timereceived":1524913064422,"bip125-replaceable":"no"};

            console.log(mongoDoc);
            
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
        .finally(() => client.close()); // Closing after getting the data

    } //end constructor

} //end class Backend



