const db = require('./jsonDb');
const mongoose = require('mongoose');

// Wrapper that switches between Mongoose and JSON DB based on connection status
const isMongoConnected = () => mongoose.connection.readyState === 1;

const wrapper = {
    find: async (collection, query = {}) => {
        if (isMongoConnected()) {
            // Convert JSON DB query style to Mongoose if needed, or simple pass through
            // This is a simplification. For full hybrid, we'd need models.
            // But for now, user is likely to stick to JSON local or Full Mongo.
            // Let's assume if Mongo is connected, we use proper Mongoose logic in controllers?
            // No, that would require rewriting usage in controllers.

            // Better strategy: The current controllers ALREADY use 'db.find'.
            // So 'db' object here should abstract Mongoose calls too.

            // Mapping collection names to Models
            const models = {
                'users': require('../models/User'),
                'leagues': require('../models/League'),
                'matches': require('../models/Match'),
                'predictions': require('../models/Prediction'),
                'results': require('../models/MatchResult')
            };

            const Model = models[collection];
            if (!Model) return [];

            // Mongoose find
            // Need to adapt query format: _id string to ObjectId is auto in Mongoose usually, but let's be safe
            return await Model.find(query).lean();
        }
        return db.find(collection, query);
    },

    findOne: async (collection, query = {}) => {
        if (isMongoConnected()) {
            const models = {
                'users': require('../models/User'),
                'leagues': require('../models/League'),
                'matches': require('../models/Match'),
                'predictions': require('../models/Prediction'),
                'results': require('../models/MatchResult')
            };
            const Model = models[collection];
            return await Model.findOne(query).lean();
        }
        return await db.findOne(collection, query);
    },

    findById: async (collection, id) => {
        if (isMongoConnected()) {
            const models = {
                'users': require('../models/User'),
                'leagues': require('../models/League'),
                'matches': require('../models/Match'),
                'predictions': require('../models/Prediction'),
                'results': require('../models/MatchResult')
            };
            const Model = models[collection];
            try {
                return await Model.findById(id).lean();
            } catch (e) { return null; }
        }
        return await db.findById(collection, id);
    },

    create: async (collection, data) => {
        if (isMongoConnected()) {
            const models = {
                'users': require('../models/User'),
                'leagues': require('../models/League'),
                'matches': require('../models/Match'),
                'predictions': require('../models/Prediction'),
                'results': require('../models/MatchResult')
            };
            const Model = models[collection];
            const doc = new Model(data);
            await doc.save();
            return doc.toObject();
        }
        return await db.create(collection, data);
    },

    update: async (collection, id, updates) => {
        if (isMongoConnected()) {
            const models = {
                'users': require('../models/User'),
                'leagues': require('../models/League'),
                'matches': require('../models/Match'),
                'predictions': require('../models/Prediction'),
                'results': require('../models/MatchResult')
            };
            const Model = models[collection];
            return await Model.findByIdAndUpdate(id, updates, { new: true }).lean();
        }
        return await db.update(collection, id, updates);
    },

    deleteMany: async (collection) => {
        if (isMongoConnected()) {
            const models = {
                'users': require('../models/User'),
                'leagues': require('../models/League'),
                'matches': require('../models/Match'),
                'predictions': require('../models/Prediction'),
                'results': require('../models/MatchResult')
            };
            const Model = models[collection];
            await Model.deleteMany({});
            return;
        }
        return await db.deleteMany(collection);
    },

    insertMany: async (collection, data) => {
        if (isMongoConnected()) {
            const models = {
                'users': require('../models/User'),
                'leagues': require('../models/League'),
                'matches': require('../models/Match'),
                'predictions': require('../models/Prediction'),
                'results': require('../models/MatchResult')
            };
            const Model = models[collection];
            await Model.insertMany(data);
            return;
        }
        return await db.insertMany(collection, data);
    }
};

module.exports = wrapper;
