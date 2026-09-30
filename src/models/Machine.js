const mongoose = require('mongoose');

const machineSchema = new mongoose.Schema(
  {
    nom: {
      type: String,
      required: [true, 'Le nom de la machine est obligatoire'],
      trim: true
    },
    reference: {
      type: String,
      required: [true, 'La référence est obligatoire'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true
    },
    atelier: {
      type: String,
      required: [true, "L'atelier est obligatoire"],
      trim: true
    },
    etat: {
      type: String,
      enum: {
        values: ['disponible', 'en maintenance', 'hors service'],
        message: 'État non valide ({VALUE}). Valeurs acceptées : disponible, en maintenance, hors service'
      },
      default: 'disponible'
    }
  },
  {
    timestamps: true
  }
);

const Machine = mongoose.model('Machine', machineSchema);
module.exports = Machine;