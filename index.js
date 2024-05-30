const express = require("express");
const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.get("/", (req, res) => {
  res.send("Learn Skill Online Courses is Currently Running");
});

app.listen(port, () => {
  console.log(`Learn Skill Online Courses is Currently Running On:- ${port}`);
});
