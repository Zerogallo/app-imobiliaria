const mongoose = require('mongoose');

const ClientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  firstServiceDate: { type: Date, default: Date.now },
  familyMembers: { type: Number },
  hasPets: { type: Boolean, default: false },
  propertyType: { type: String, enum: ['house', 'apartment'] },
  lastAttendedBy: { type: String }, // nome do corretor
  chosenProperty: { type: String },
  visitDate: { type: Date },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Client', ClientSchema);