const express = require('express');
const { MongoClient } = require('mongodb');
const fs = require('fs');
const app = express();
const port = 3000;
const db = 'test_application';
const collectionName = 'test_documents';

function readFile(path) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, 'utf8', (err, buffer) => {
      if (err) {
        return reject(err)
      }

      resolve(buffer)
    })
  })
}

(async () => {
  // Adds static files
  app.use(express.static('public'))

  // Connect to mongodb
  let client = await MongoClient.connect('mongodb://localhost:27017', { useUnifiedTopology: true });
  let database = client.db(db);
  let collection = database.collection(collectionName);

  // Drop the data as an example
  await collection.deleteMany({});

  // Insert some docs
  await collection.insertMany([{
    name: "cachoppo",
    description: "a copy of schnitzel"
  }, {
    name: "fabada",
    description: "lots of beans"
  }, {
    name: "chorizo a la sidre",
    description: "cider cooked chorizo sausage"
  }]);

  app.get('/recipes', async (request, response) => {
    let name = request.query.name;
    let query = {};

    if (name) {
      query = { name: name };
    }

    // Get all the recipes based on query
    let recipes = await collection.find(query).toArray();
    response.send(JSON.stringify({
      recipes: recipes
    }));
  });

  // Defines the root end point
  app.get('/', async (request, response) => {
    let content = await readFile("./templates/index_template.html");
    return response.send(content);
  });

  app.listen(port, () => console.log(`Example app listening on port ${port}!`));
})().then(() => {}).catch(err => console.error(err));