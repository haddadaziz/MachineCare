const AppError = require('../utils/AppError');

const globalErrorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;
  error.status = err.status || 'error';

  // Erreur Mongoose : Identifiant ObjectId invalide (CastError)
  if (err.name === 'CastError') {
    error = new AppError(`Ressource introuvable : identifiant "${err.value}" invalide`, 400);
  }

  // Erreur Mongoose : Clé dupliquée (code 11000, ex: référence machine déjà prise)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    error = new AppError(`Conflit : la valeur "${value}" pour le champ "${field}" est déjà utilisée`, 409);
  }

  // Erreur Mongoose : Échec de validation de schéma (ValidationError)
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    error = new AppError(`Erreur de validation : ${messages.join('. ')}`, 400);
  }

  // Erreur JWT : Token corrompu ou invalide
  if (err.name === 'JsonWebTokenError') {
    error = new AppError('Session invalide. Veuillez vous reconnecter', 401);
  }

  // Erreur JWT : Token expiré
  if (err.name === 'TokenExpiredError') {
    error = new AppError('Votre session a expiré. Veuillez vous reconnecter', 401);
  }

  // Format de réponse JSON standardisé
  res.status(error.statusCode).json({
    status: error.status,
    message: error.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = { globalErrorHandler };