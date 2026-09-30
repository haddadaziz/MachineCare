const mongoose = require('mongoose');

const breakdownSchema = new mongoose.Schema(
  {
    machine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Machine',
      required: [true, 'La machine concernée est obligatoire']
    },
    declaredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Le déclarant est obligatoire']
    },
    description: {
      type: String,
      required: [true, 'La description de la panne est obligatoire'],
      trim: true
    },
    statut: {
      type: String,
      enum: {
        values: ['en attente', 'en cours', 'resolu'],
        message: 'Statut non valide ({VALUE}). Valeurs acceptées : en attente, en cours, resolu'
      },
      default: 'en attente'
    },
    noteResolution: {
      type: String,
      trim: true,
      default: null
    },
    resolvedAt: {
      type: Date,
      default: null
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  {
    timestamps: true
  }
);

const Breakdown = mongoose.model('Breakdown', breakdownSchema);
module.exports = Breakdown;