const User = require('../models/User');

const seedAdminUser = async () => {
  try {
    const userCount = await User.countDocuments();

    if (userCount === 0) {
      const adminData = {
        name: 'Administrateur',
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
        role: 'admin'
      };

      await User.create(adminData);
      console.log(`[SEED] Compte administrateur initial créé : ${adminData.email} (Mot de passe: ${adminData.password})`);
    } else {
      console.log('[SEED] Utilisateurs existants, aucun seed nécessaire.');
    }
  } catch (error) {
    console.error(`[SEED] Erreur lors du seeding : ${error.message}`);
  }
};

module.exports = { seedAdminUser };
