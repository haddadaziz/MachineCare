require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const { seedAdminUser } = require('./services/seedService');

const PORT = process.env.PORT;

const startServer = async () => {
    await connectDB();
    await seedAdminUser();

    app.listen(PORT, () => {
        console.log(`Serveur MachineCare démarré sur le port ${PORT} en mode ${process.env.NODE_ENV}`);
    });
};

startServer();
