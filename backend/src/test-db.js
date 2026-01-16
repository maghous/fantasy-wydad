const mongoose = require('mongoose');
require('dotenv').config();

const testDB = async () => {
    try {
        console.log('Tentative de connexion à:', process.env.MONGODB_URI);
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/wydad-pronostics');
        console.log('✅ Succès : MongoDB est connecté !');
        process.exit(0);
    } catch (error) {
        console.error('❌ Erreur : Impossible de se connecter à MongoDB.');
        console.error('Détails:', error.message);
        console.log('\n💡 Conseil : Avez-vous installé et lancé MongoDB ?');
        process.exit(1);
    }
};

testDB();
