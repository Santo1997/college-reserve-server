const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qpcvbrd.mongodb.net/?retryWrites=true&w=majority`;
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
    const clgData = client.db("clgReserve").collection("clg");
    const candidate = client.db("clgReserve").collection("candidates");
    const register = client.db("clgReserve").collection("register");
    const clgReview = client.db("clgReserve").collection("clgReview");

    //get clg data
    app.get("/getAllClg", async (req, res) => {
      const result = await clgData.find().toArray();
      res.send(result);
    });

    app.get("/getAllReview", async (req, res) => {
      const result = await clgReview.find().toArray();
      res.send(result);
    });

    app.get("/getCandidateClg", async (req, res) => {
      let query = {};
      let clgArr = [];
      if (req.query?.user) {
        query = { email: req.query.user };
      } else {
        res.send([]);
      }

      const result = await candidate.find(query).toArray();

      for (let index = 0; index < result.length; index++) {
        query = { college_name: result[index].clgName };
        const clgInfo = await clgData.find(query).toArray();
        clgArr.push(clgInfo);
      }

      const mergedArray = [].concat(...clgArr);
      res.send(mergedArray);
    });

    app.get("/getUser", async (req, res) => {
      let query = {};
      if (req.query?.user) {
        query = { email: req.query.user };
      } else {
        res.send([]);
      }

      const result = await register.find(query).toArray();
      res.send(result);
    });

    app.get("/getCandidate", async (req, res) => {
      let query = {};
      if (req.query?.user) {
        query = { email: req.query.user };
      } else {
        res.send([]);
      }

      const result = await candidate.find(query).toArray();
      res.send(result);
    });

    //post candidate data
    app.post("/postUser", async (req, res) => {
      const newCandidate = req.body;

      const query = {
        email: newCandidate.email,
      };
      const existCandite = await register.findOne(query);
      if (existCandite) {
        return res.send("existCandite");
      }

      const result = await register.insertOne(newCandidate);
      res.send(result);
    });

    app.post("/postCandidates", async (req, res) => {
      const newCandidate = req.body;

      const query = {
        clgName: newCandidate.clgName,
      };
      const existCandite = await candidate.findOne(query);
      if (existCandite) {
        return res.send("existCandite");
      }

      const result = await candidate.insertOne(newCandidate);
      res.send(result);
    });

    app.post("/postReview", async (req, res) => {
      const review = req.body;

      const query = {
        clgName: review.clgName,
        email: review.email,
      };
      const existCandite = await clgReview.findOne(query);
      if (existCandite) {
        return res.send("existCandite");
      }

      const result = await clgReview.insertOne(review);
      res.send(result);
    });

    //updates
    app.put("/updateUser/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const option = { upsert: true };
      const updateClg = req.body;

      const setClg = {
        $set: {
          clgName: updateClg.clgName,
          user: updateClg.user,
          subject: updateClg.subject,
          email: updateClg.email,
          phone: updateClg.phone,
          address: updateClg.address,
          birth: updateClg.birth,
          img: updateClg.img,
          about: updateClg.about,
        },
      };

      const result = await register.updateOne(filter, setClg, option);
      res.send(result);
    });

    app.put("/updateCandidate/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const option = { upsert: true };
      const updateClg = req.body;

      const setClg = {
        $set: {
          clgName: updateClg.clgName,
          candidName: updateClg.candidName,
          subject: updateClg.subject,
          email: updateClg.email,
          phone: updateClg.phone,
          address: updateClg.address,
          birth: updateClg.birth,
          img: updateClg.img,
          about: updateClg.about,
        },
      };

      const result = await register.updateOne(filter, setClg, option);
      res.send(result);
    });

    //etc
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
  res.send("Hello Endgame!");
});

app.listen(port, () => {
  console.log(`Endgame listening on port ${port}`);
});
