// Reference: https://www.mongodb.com/blog/post/quick-start-nodejs-mongodb--how-to-get-connected-to-your-database
//import customers from './customers.json';
import client from 'mongodb';

export default class MongoBackend{
    constructor(uri){
        //Create mongoDB client
        //this.client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

        try{
            //Connect to mongoDB cluster
            client.connect(uri, function(err,db){
                if (err) throw err;
                console.log('Database created!\n'+db);
                db.close();
            });// end client.connect
        }catch (e) {
            console.error(e);
        } //end try
        
    } //end constructor

} //end class Backend



