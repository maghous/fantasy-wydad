const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.join(__dirname, '../../data');

// Ensure data directory exists
(async () => {
    try {
        await fs.mkdir(DATA_DIR, { recursive: true });
    } catch (err) {
        console.error('Error creating data directory:', err);
    }
})();

const getFilePath = (collection) => path.join(DATA_DIR, `${collection}.json`);

const readData = async (collection) => {
    try {
        const data = await fs.readFile(getFilePath(collection), 'utf8');
        return JSON.parse(data);
    } catch (err) {
        return [];
    }
};

const writeData = async (collection, data) => {
    await fs.writeFile(getFilePath(collection), JSON.stringify(data, null, 2));
};

const db = {
    // Find all documents matching query
    find: async (collection, query = {}) => {
        const items = await readData(collection);
        return items.filter(item => {
            return Object.keys(query).every(key => {
                // Handle array includes logic (simplistic)
                if (Array.isArray(item[key]) && !Array.isArray(query[key])) {
                    return item[key].includes(query[key]);
                }
                return item[key] == query[key]; // loose equality for IDs
            });
        });
    },

    // Find one document
    findOne: async (collection, query = {}) => {
        const items = await db.find(collection, query);
        return items[0] || null;
    },

    // Find by ID
    findById: async (collection, id) => {
        const items = await readData(collection);
        return items.find(item => item._id === id) || null;
    },

    // Create new document
    create: async (collection, data) => {
        const items = await readData(collection);
        const newItem = {
            _id: crypto.randomUUID(),
            ...data,
            createdAt: new Date().toISOString()
        };
        items.push(newItem);
        await writeData(collection, items);
        return newItem;
    },

    // Update document
    update: async (collection, id, updates) => {
        const items = await readData(collection);
        const index = items.findIndex(item => item._id === id);
        if (index === -1) return null;

        items[index] = { ...items[index], ...updates };
        await writeData(collection, items);
        return items[index];
    },

    // Delete all (for seeding)
    deleteMany: async (collection) => {
        await writeData(collection, []);
    },

    // Insert many (for seeding)
    insertMany: async (collection, dataArray) => {
        const items = await readData(collection);
        const newItems = dataArray.map(item => ({
            _id: crypto.randomUUID(),
            ...item,
            createdAt: new Date().toISOString()
        }));
        await writeData(collection, [...items, ...newItems]);
        return newItems;
    }
};

module.exports = db;
