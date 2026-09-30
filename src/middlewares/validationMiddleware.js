const mongoose = require('mongoose');
const AppError = require('../utils/AppError');

// Valide qu'un paramètre d'URL est un vrai ObjectId MongoDB
const validateObjectId = (paramName = 'id') => {
  return (req, res, next) => {
    const id = req.params[paramName];
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new AppError(`Identifiant "${id}" invalide dans l'URL`, 400));
    }
    next();
  };
};

// Valide la présence des champs obligatoires dans le body
const validatePayload = (requiredFields = []) => {
  return (req, res, next) => {
    const missingFields = [];

    requiredFields.forEach((field) => {
      if (!req.body[field] || (typeof req.body[field] === 'string' && req.body[field].trim() === '')) {
        missingFields.push(field);
      }
    });

    if (missingFields.length > 0) {
      return next(
        new AppError(`Champs obligatoires manquants ou vides : ${missingFields.join(', ')}`, 400)
      );
    }

    next();
  };
};

module.exports = { validateObjectId, validatePayload };
