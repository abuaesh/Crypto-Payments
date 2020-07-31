// Reference: https://www.mongodb.com/blog/post/quick-start-nodejs-mongodb--how-to-get-connected-to-your-database
//import customers from './customers.json';
import MongoClient from 'mongodb';

export default class MongoBackend{
    constructor(uri){
        //Configure mongoDB variables
        let client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        //Connect to mongoDB cloud
        await client.connect(err => {
            const collection = client.db("krakenChallenge").collection("customers");
            // perform actions on the collection object
            console.log("Customers collection created!");
            client.close();
        }); //end client.connect
        
    } //end constructor

} //end class Backend



