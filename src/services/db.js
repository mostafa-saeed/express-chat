const { MongoClient } = require('mongodb');

class DbConnection {
  async connect(connectionString, databaseName) {
    const client = await (new MongoClient(connectionString).connect());
    const db = client.db(databaseName);
    this.Users = db.collection('users');
    this.Messages = db.collection('messages');
  }
}

// That's our DB Connection Singleton instance
module.exports = new DbConnection();
