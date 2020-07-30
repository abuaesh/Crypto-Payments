import MongoBackend from '../backend/mongo-backend.js';
//import SqlBackend from '../backend/sql-backend.js';
//import Transactions1 from './transactions-1.json';
//import Transactions2 from './transactions-2.json';

(async() => {

    const backendType = 0; //0 for mongoDB(default),
                            // 1 for SQL. 

    var dbConfig = null;

    if(!backendType) // mongoDB selected
    {
        dbConfig = "mongodb+srv://kraken:Y4vcNb92G8QN88qW@cluster0.v2i3h.mongodb.net/krakenChallenge?retryWrites=true&w=majority";
    }
    /* Uncomment this block if you know SQL backend config, otherwise defaults will be used
    else //sql selected
    {
        dbConfig = {
            host: 'localhost',
            user: 'abuaesh',
            password: 'abc123',
            database: 'btcdb'
        };
    } //end backend type selection
    */
    

    //let backend = (!backendType)? new MongoBackend(dbConfig): new SqlBackend(dbConfig);

    let backend = new MongoBackend(dbConfig);

})(); //end async