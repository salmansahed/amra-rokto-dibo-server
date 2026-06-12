require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Amra Rokto Dibo Server is Running");
});

const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // await client.connect();
    const db = client.db("amra-rokto-dibo");
    const bloodCardCollection = db.collection("blood-cards");

    app.post("/blood-cards", async (req, res) => {
      const bloodCard = req.body;
      const result = await bloodCardCollection.insertOne(bloodCard);
      res.send(result);
    });

    app.get("/blood-cards", async (req, res) => {
      const search = req.query.search;
      const bloodGroup = req.query.bloodGroup;
      let query = {};
      if (search) {
        query.userName = { $regex: search, $options: "i" };
      }
      if (bloodGroup) {
        query.bloodGroup = bloodGroup;
      }
      try {
        const bloodCards = await bloodCardCollection.find(query).sort({ _id: -1 }).toArray();
        res.send(bloodCards);
      } catch (error) {
        res.send({ message: "Server error", error: error.message });
      }
    });

    app.get("/blood-cards/:id", async (req, res) => {
      const id = req.params.id;
      const bloodCard = await bloodCardCollection.findOne({ userId: id });
      if (!bloodCard) {
        return res.send({ message: "No card found", success: false });
      }
      res.send(bloodCard);
    });

    // Patch
    app.patch("/blood-cards/:id", async (req, res) => {
      const id = req.params.id;
      const updatedBloodCard = req.body;
      const result = await bloodCardCollection.updateOne(
        { userId: id },
        { $set: updatedBloodCard },
      );
      res.send(result);
    });

    // Delete
    app.delete("/blood-cards/:id", async (req, res) => {
      const id = req.params.id;
      const result = await bloodCardCollection.deleteOne({ userId: id });
      res.send(result);
    });

    // Contact Message
    app.post("/contact-messages", async (req, res) => {
      const message = req.body;
      const result = await db.collection("contact-messages").insertOne(message);
      res.send(result);
    });

    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!",
    );
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
