const Machine = require('../models/Machine');
const mongoose = require('mongoose');

const createMachine = async (req, res) => {
  try {
    const { nom, reference, atelier, etat } = req.body;

    if (!nom || !reference || !atelier) {
      return res.status(400).json({ message: 'Veuillez renseigner le nom, la référence et l\'atelier' });
    }

    const existingMachine = await Machine.findOne({ reference: reference.toUpperCase().trim() });
    if (existingMachine) {
      return res.status(409).json({ message: `Une machine avec la référence "${reference.toUpperCase().trim()}" existe déjà` });
    }

    const machine = await Machine.create({
      nom,
      reference,
      atelier,
      etat: etat || 'disponible'
    });

    res.status(201).json({
      message: 'Machine créée avec succès',
      machine
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Cette référence existe déjà' });
    }
    res.status(500).json({ message: error.message });
  }
};

const getMachines = async (req, res) => {
  try {
    const { atelier, etat } = req.query;
    const filter = {};

    if (atelier) {
      filter.atelier = new RegExp(atelier, 'i');
    }

    if (etat) {
      filter.etat = etat;
    }

    const machines = await Machine.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      count: machines.length,
      machines
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMachineById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Identifiant machine invalide' });
    }

    const machine = await Machine.findById(id);
    if (!machine) {
      return res.status(404).json({ message: 'Machine introuvable' });
    }

    res.status(200).json({ machine });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateMachine = async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, reference, atelier, etat } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Identifiant machine invalide' });
    }

    const machine = await Machine.findById(id);
    if (!machine) {
      return res.status(404).json({ message: 'Machine introuvable' });
    }

    if (reference && reference.toUpperCase().trim() !== machine.reference) {
      const refExists = await Machine.findOne({ reference: reference.toUpperCase().trim() });
      if (refExists) {
        return res.status(409).json({ message: 'Cette référence est déjà utilisée par une autre machine' });
      }
      machine.reference = reference;
    }

    if (nom) machine.nom = nom;
    if (atelier) machine.atelier = atelier;
    if (etat) machine.etat = etat;

    const updatedMachine = await machine.save();

    res.status(200).json({
      message: 'Machine mise à jour avec succès',
      machine: updatedMachine
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteMachine = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Identifiant machine invalide' });
    }

    const machine = await Machine.findById(id);
    if (!machine) {
      return res.status(404).json({ message: 'Machine introuvable' });
    }

    if (mongoose.models.Breakdown) {
      const linkedBreakdowns = await mongoose.models.Breakdown.countDocuments({ machine: id });
      if (linkedBreakdowns > 0) {
        return res.status(400).json({
          message: `Suppression impossible : ${linkedBreakdowns} signalement(s) de panne sont associé(s) à cette machine.`
        });
      }
    }

    await machine.deleteOne();

    res.status(200).json({
      message: 'Machine supprimée avec succès'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createMachine,
  getMachines,
  getMachineById,
  updateMachine,
  deleteMachine
};
