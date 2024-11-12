const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const corsOptions = {
  origin: ["http://localhost:5173", "http://localhost:5174"],
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json());

const uri = `mongodb+srv://${process.env.SKILL_SPHERE_USER_NAME}:${process.env.SKILL_SPHERE_PASSWORD}@cluster0.2xcsswz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const dbCollection = client.db("skillsphereDB");
    const usersCollection = dbCollection.collection("users");
    const coursesCollection = dbCollection.collection("courses");
    const cartsCollection = dbCollection.collection("carts");

    // User's Saved Data in DB
    app.post("/skillsphere/api/v1/users", async (req, res) => {
      const body = req.body;
      const result = await usersCollection.insertOne(body);
      res.send(result);
    });

    // Get User's Role Data
    app.get("/skillsphere/api/v1/users/:email", async (req, res) => {
      const email = req.params.email;
      const cursor = await usersCollection.findOne({ email });
      res.send(cursor);
    });

    // Get Courses All Data
    app.get("/skillsphere/api/v1/users", async (req, res) => {
      const cursor = await usersCollection.find().toArray();
      res.send(cursor);
    });

    // Get Courses All Data
    app.get("/skillsphere/api/v1/courses", async (req, res) => {
      const cursor = await coursesCollection.find().toArray();
      res.send(cursor);
    });

    // Get specific course Data
    app.get("/skillsphere/api/v1/courses/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await coursesCollection.findOne(query);
      res.send(result);
    });

    // Specific User's Purchases Courses Data Saved in DB
    app.post("/skillsphere/api/v1/carts", async (req, res) => {
      const body = req.body;
      const result = await cartsCollection.insertOne(body);
      res.send(result);
    });

    // Specific User's Purchases Courses Data Deleted in DB
    app.delete("/skillsphere/api/v1/carts/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const cursor = await cartsCollection.deleteOne(query);
      res.send(cursor);
    });

    // Get Specific Email User's Purchases Courses Data
    app.get("/skillsphere/api/v1/carts", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const result = await cartsCollection.find(query).toArray();
      res.send(result);
    });

    // Deleted to Purchases Courses Data
    app.delete("/skillsphere/api/v1/carts/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await cartsCollection.deleteOne(query);
      res.send(result);
    });

    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Learn Skill Online Courses is Currently Running");
});

app.listen(port, () => {
  console.log(`Learn Skill Online Courses is Currently Running On:- ${port}`);
});
