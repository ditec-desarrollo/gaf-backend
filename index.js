const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");
const bodyParser = require('body-parser');
const app = express();

app.use(cors());
dotenv.config();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: '20mb' }));

const usuariosRoutes = require("./routes/usuariosRoutes");
const tiposDeUsuariosRoutes = require("./routes/tiposDeUsuariosRoutes");
const ciudadanoDigitalRoutes = require("./routes/ciudadanoDigitalRoutes");
const gestionFinancieraRoutes = require("./routes/gestionFinancieraRoutes");

const PORT = process.env.PORT;

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/usuarios', usuariosRoutes)
app.use('/roles',tiposDeUsuariosRoutes)
app.use('/ciudadanoDigital',ciudadanoDigitalRoutes)
app.use('/gestionFinanciera', gestionFinancieraRoutes)


// const options = {
//     key: fs.readFileSync('./scfg0cbqs'),
//     cert: fs.readFileSync('./scfg0cbqs'),
//     //ca: fs.readFileSync('/opt/psa/var/certificates/scfqdiDyQ') // si tienes un archivo CA bundle
//   };
  
//   https.createServer(options, app).listen(5000, () => {
//     console.log(`server listening on port 5000`);
//   });

  app.listen(3050, () => {
    console.log(`server listening on port 3050`);
  });
