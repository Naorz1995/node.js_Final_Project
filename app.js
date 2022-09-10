require("dotenv").config();
const PORT = process.env.PORT ;
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
var cors = require("cors");
require("./dataBases/mongoDb");
app.use(express.json());
const user = require("./routes/user");
app.use(cors());
 app.use('/user', user);
const checkConnection = require("./middleware/checkConnection");
app.use(checkConnection);




app.listen(PORT, () => {
  console.log("Server is up on port " + PORT);
});