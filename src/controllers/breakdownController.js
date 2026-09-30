const Breakdown = require('../models/Breakdown');
const Machine = require('../models/Machine');
const mongoose = require('mongoose');

const createBreakdown = async (req, res) => {
  try {
    const { machineId, description } = req.body;

    if (!machineId || !description) {
      return res.status(400).json({ message: 'Veuillez renseigner machineId et une description' });
    }

    if (!mongoose.Types.ObjectId.isValid(machineId)) {
      return res.status(400).json({ message: 'Identifiant machine invalide' });
    }

    const machine = await Machine.findById(machineId);
    if (!machine) {
      return res.status(404).json({ message: 'Machine introuvable' });
    }

    const breakdown = await Breakdown.create({
      machine: machineId,
      declaredBy: req.user._id,
      description
    });

    if (machine.etat === 'disponible') {
      machine.etat = 'en maintenance';
      await machine.save();
    }

    res.status(201).json({
      message: 'Panne signalée avec succès',
      breakdown
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getBreakdowns = async (req, res) => {
  try {
    const { machine, statut } = req.query;
    const filter = {};

    if (machine) {
      if (!mongoose.Types.ObjectId.isValid(machine)) {
        return res.status(400).json({ message: 'Identifiant machine invalide' });
      }
      filter.machine = machine;
    }

    if (statut) {
      filter.statut = statut;
    }

    const breakdowns = await Breakdown.find(filter)
      .populate('machine', 'nom reference atelier etat')
      .populate('declaredBy', 'name email role')
      .populate('resolvedBy', 'name email role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: breakdowns.length,
      breakdowns
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMachineBreakdowns = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Identifiant machine invalide' });
    }

    const machine = await Machine.findById(id);
    if (!machine) {
      return res.status(404).json({ message: 'Machine introuvable' });
    }

    const breakdowns = await Breakdown.find({ machine: id })
      .populate('declaredBy', 'name email role')
      .populate('resolvedBy', 'name email role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      machine: {
        id: machine._id,
        nom: machine.nom,
        reference: machine.reference
      },
      count: breakdowns.length,
      breakdowns
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateBreakdownStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { statut, noteResolution } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Identifiant panne invalide' });
    }

    if (!statut) {
      return res.status(400).json({ message: 'Le statut est obligatoire' });
    }

    const validStatuts = ['en attente', 'en cours', 'resolu'];
    if (!validStatuts.includes(statut)) {
      return res.status(400).json({ message: `Statut non valide. Valeurs possibles : ${validStatuts.join(', ')}` });
    }

    const breakdown = await Breakdown.findById(id);
    if (!breakdown) {
      return res.status(404).json({ message: 'Panne introuvable' });
    }

    if (statut === 'resolu') {
      if (!noteResolution || noteResolution.trim() === '') {
        return res.status(400).json({
          message: 'Une note de résolution ("noteResolution") est obligatoirement requise pour clore une panne'
        });
      }
      breakdown.noteResolution = noteResolution.trim();
      breakdown.resolvedAt = new Date();
      breakdown.resolvedBy = req.user._id;
    }

    breakdown.statut = statut;
    const updatedBreakdown = await breakdown.save();

    res.status(200).json({
      message: `Statut de la panne mis à jour vers "${statut}" avec succès`,
      breakdown: updatedBreakdown
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createBreakdown,
  getBreakdowns,
  getMachineBreakdowns,
  updateBreakdownStatus
};