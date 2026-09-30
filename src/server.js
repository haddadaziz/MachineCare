require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT;

connectDB();

app.listen(PORT, () => {
    console.log(`Serveur MachineCare démarré sur le port ${PORT} en mode ${process.env.NODE_ENV}`);
});
