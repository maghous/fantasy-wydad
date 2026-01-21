const db = require('./jsonDb');
const mongoose = require('mongoose');

// Mapping collection names to Models
const models = {
    'users': require('../models/User'),
    'leagues': require('../models/League'),
    'matches': require('../models/Match'),
    'predictions': require('../models/Prediction'),
    'results': require('../models/MatchResult'),
    'notifications': require('../models/Notification'),
    'invitations': require('../models/Invitation')
};

// Wrapper that switches between Mongoose and JSON DB based on connection status
const isMongoConnected = () => mongoose.connection.readyState === 1;

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const wrapper = {
    find: async (collection, query = {}) => {
        if (isMongoConnected() && models[collection]) {
            return await models[collection].find(query).lean();
        }
        return db.find(collection, query);
    },

    findOne: async (collection, query = {}) => {
        if (isMongoConnected() && models[collection]) {
            return await models[collection].findOne(query).lean();
        }
        return await db.findOne(collection, query);
    },

    findById: async (collection, id) => {
        if (isMongoConnected() && models[collection]) {
            try {
                if (!isValidObjectId(id)) return null;
                return await models[collection].findById(id).lean();
            } catch (e) { return null; }
        }
        return await db.findById(collection, id);
    },

    create: async (collection, data) => {
        if (isMongoConnected() && models[collection]) {
            const Model = models[collection];
            const cleanData = { ...data };
            if (cleanData._id && typeof cleanData._id === 'string' && cleanData._id.length > 24) {
                delete cleanData._id;
            }
            const doc = new Model(cleanData);
            await doc.save();
            return doc.toObject();
        }
        return await db.create(collection, data);
    },

    update: async (collection, id, updates) => {
        if (isMongoConnected() && models[collection]) {
            if (!isValidObjectId(id)) return null;
            return await models[collection].findByIdAndUpdate(id, updates, { new: true }).lean();
        }
        return await db.update(collection, id, updates);
    },

    deleteMany: async (collection) => {
        if (isMongoConnected() && models[collection]) {
            await models[collection].deleteMany({});
            return;
        }
        return await db.deleteMany(collection);
    },

    insertMany: async (collection, data) => {
        if (isMongoConnected() && models[collection]) {
            await models[collection].insertMany(data);
            return;
        }
        return await db.insertMany(collection, data);
    }
};

module.exports = wrapper;
