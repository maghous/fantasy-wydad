const db = require('./dbWrapper');

const matches = [
    // --- CAF CONFEDERATION CUP ---
    { opponent: "Maniema (Drc)", date: new Date("2026-01-25T14:00:00"), location: "Domicile", competition: "CAF", status: "upcoming" },
    { opponent: "Maniema (Drc)", date: new Date("2026-02-01T11:00:00"), location: "Extérieur", competition: "CAF", status: "upcoming" },
    { opponent: "Nairobi United (Ken)", date: new Date("2026-02-08T11:00:00"), location: "Extérieur", competition: "CAF", status: "upcoming" },
    { opponent: "Azam (Tan)", date: new Date("2026-02-15T11:00:00"), location: "Domicile", competition: "CAF", status: "upcoming" },
    // --- BOTOLA PRO ---
    { opponent: "FAR Rabat", date: new Date("2026-02-22T20:00:00"), location: "Domicile", competition: "Botola", round: "Journée 9", status: "upcoming" },
    { opponent: "FUS Rabat", date: new Date("2026-03-01T20:00:00"), location: "Extérieur", competition: "Botola", round: "Journée 10", status: "upcoming" },
    { opponent: "DH El Jadida", date: new Date("2026-03-08T20:00:00"), location: "Domicile", competition: "Botola", round: "Journée 11", status: "upcoming" },
    { opponent: "MAS Fès", date: new Date("2026-03-15T20:00:00"), location: "Extérieur", competition: "Botola", round: "Journée 12", status: "upcoming" },
    { opponent: "Dcheira", date: new Date("2026-03-22T20:00:00"), location: "Extérieur", competition: "Botola", round: "Journée 13", status: "upcoming" },
    { opponent: "Renaissance Berkane", date: new Date("2026-03-29T20:00:00"), location: "Domicile", competition: "Botola", round: "Journée 14", status: "upcoming" },
    { opponent: "Union Touarga", date: new Date("2026-04-05T20:00:00"), location: "Extérieur", competition: "Botola", round: "Journée 15", status: "upcoming" },
    { opponent: "KACM Marrakech", date: new Date("2026-04-12T20:00:00"), location: "Extérieur", competition: "Botola", round: "Journée 16", status: "upcoming" },
    { opponent: "USYM Rabat", date: new Date("2026-04-19T20:00:00"), location: "Domicile", competition: "Botola", round: "Journée 17", status: "upcoming" },
    { opponent: "RCA Zemamra", date: new Date("2026-04-26T20:00:00"), location: "Extérieur", competition: "Botola", round: "Journée 18", status: "upcoming" },
    { opponent: "COD Meknès", date: new Date("2026-05-03T20:00:00"), location: "Domicile", competition: "Botola", round: "Journée 19", status: "upcoming" },
    { opponent: "Raja Casablanca", date: new Date("2026-05-10T20:00:00"), location: "Extérieur", competition: "Botola", round: "Journée 20", status: "upcoming" },
    { opponent: "Hassania Agadir", date: new Date("2026-05-17T20:00:00"), location: "Domicile", competition: "Botola", round: "Journée 21", status: "upcoming" },
    { opponent: "IR Tanger", date: new Date("2026-05-24T20:00:00"), location: "Extérieur", competition: "Botola", round: "Journée 22", status: "upcoming" },
    { opponent: "OC Safi", date: new Date("2026-05-31T20:00:00"), location: "Domicile", competition: "Botola", round: "Journée 23", status: "upcoming" }
];

const autoSeed = async () => {
    try {
        const count = await db.find('matches').then(m => m.length);
        if (count === 0) {
            console.log('Database empty, auto-seeding matches...');
            await db.insertMany('matches', matches);
            console.log(`Auto-seeding successful: ${matches.length} matches added.`);
        }
    } catch (err) {
        console.error('Auto-seeding error:', err.message);
    }
};

module.exports = autoSeed;
