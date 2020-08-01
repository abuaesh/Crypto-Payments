// Reference: https://www.mongodb.com/blog/post/quick-start-nodejs-mongodb--how-to-get-connected-to-your-database
//import customers from './customers.json';
import mongodb from 'mongodb';

export default class MongoBackend{
    constructor(uri){

        const MongoClient = mongodb.MongoClient;

//const url = "mongodb://localhost:27017/";
const client = new MongoClient(uri, { useUnifiedTopology: true }); // useUnifiedTopology removes a warning

// Connect
client
  .connect()
  .then(client =>
    client
      .db()
      .admin()
      .listDatabases() // Returns a promise that will resolve to the list of databases
  )
  .then(dbs => {
    console.log("Mongo databases", dbs);
  })
  .finally(() => client.close()); // Closing after getting the data











        /*
        //Create mongoDB client
        //this.client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        let client = mongo.MongoClient;
        let Db = mongo.Db;
        let Server = mongo.Server;
        try{
            //Connect to mongoDB cluster
            client.connect(uri, function(err, db){
                if (err) throw err;
                
                var db = new Db('test', new Server('localhost', 27017));
                // Establish connection to db
                db.open(function(err, db) {

                // Use the admin database for the operation
                var adminDb = db.admin();

                // List all the available databases
                adminDb.listDatabases(function(err, dbs) {
                    assert.equal(null, err);
                    assert.ok(dbs.databases.length > 0);

                    db.close();
                });
                });

            });// end client.connect
        }catch (e) {
            console.error(e);
        } //end try
        */
        
    } //end constructor

} //end class Backend



