const mongoose = require('mongoose');

const PropertySchema = new mongoose.Schema({
  photo: { type: String, default: '' },          // URL ou base64
  streetName: { type: String, required: true },
  location: { type: String, required: true },
  bedrooms: { type: Number, default: 0 },
  bathrooms: { type: Number, default: 0 },
  livingRoom: { type: Boolean, default: true },
  balcony: { type: Boolean, default: false },
  area: { type: Number, default: 0 },            // metros quadrados
  price: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Property', PropertySchema);