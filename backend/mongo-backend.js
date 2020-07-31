//import customers from './customers.json';


export default class MongoBackend{
    constructor(uri){
        //Configure mongoDB variables
        let MongoClient = require('mongodb').MongoClient;
        this.client = new MongoClient(uri, { useNewUrlParser: true });
        //Connect to mongoDB cloud
        client.connect(err => {
            const collection = client.db("krakenChallenge").collection("customers");
            // perform actions on the collection object
            console.log("Customers collection created!");
            client.close();
        }); //end client.connect
        
    } //end constructor

} //end class Backend



