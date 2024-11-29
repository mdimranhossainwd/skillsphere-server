const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const stripe = require("stripe")(process.env.SKILL_SPHERE_SK_TEST_KEY);

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
    const paymentsCollection = dbCollection.collection("payments");
    const instructorCoursesCollection = dbCollection.collection("instructor");

    // Payment post method
    app.post("/skillsphere/api/v1/create-payment-intent", async (req, res) => {
      const { price } = req.body;
      const amount = Math.round(parseFloat(price) * 100);
      console.log(amount);
      try {
        const paymentIntent = await stripe.paymentIntents.create({
          amount: amount,
          currency: "usd",
          automatic_payment_methods: {
            enabled: true,
          },
        });
        res.send({ clientSecret: paymentIntent.client_secret });
      } catch (error) {
        console.error("Error creating payment intent:", error);
        res.status(500).send({ error: "Payment creation failed" });
      }
    });

    // Instructor Added his own courses data
    app.post("/skillsphere/api/v1/instructor-course", async (req, res) => {
      const body = req.body;
      const result = await instructorCoursesCollection.insertOne(body);
      res.send(result);
    });

    // Get Specific Email User's Purchases Courses Data
    app.get("/skillsphere/api/v1/instructor-own-course", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const result = await instructorCoursesCollection.find(query).toArray();
      res.send(result);
    });

    // Get Instructor Added his own courses data
    app.get("/skillsphere/api/v1/pending-course", async (req, res) => {
      const cursor = await instructorCoursesCollection.find().toArray();
      res.send(cursor);
    });

    // Update a product status
    app.patch("/skillsphere/api/v1/pending-course/:id", async (req, res) => {
      const id = req.params.id;
      const status = req.body;
      const query = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: status,
      };
      const result = await instructorCoursesCollection.updateOne(
        query,
        updateDoc
      );
      res.send(result);
    });

    //
    app.post("/skillsphere/api/v1/payment", async (req, res) => {
      const body = req.body;
      const result = await paymentsCollection.insertOne(body);
      res.send(result);
    });

    // Get all Payments Info
    app.get("/skillsphere/api/v1/payment", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const cursor = await paymentsCollection.find(query).toArray();
      res.send(cursor);
    });

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

    // Delete specific user's
    app.delete("/skillsphere/api/v1/users/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const cursor = await usersCollection.deleteOne(query);
      res.send(cursor);
    });

    // User's Role changes
    app.patch("/skillsphere/api/v1/users/:id", async (req, res) => {
      const id = req.params.id;
      const role = req.body;
      const query = { _id: new ObjectId(id) };
      const updateRole = {
        $set: role,
      };
      const result = await usersCollection.updateOne(query, updateRole);
      res.send(result);
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
