const User = require('../models/User');
const { generateToken } = require('../services/authService');

const getMe = async (req, res) => {
    try {
        res.status(200).json({
            user: req.user
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur introuvable' });
        }
        const { name, email, password } = req.body;
        if (email && email !== user.email) {
            const emailExists = await User.findOne({ email });
            if (emailExists) {
                return res.status(400).json({ message: 'Cet email est déjà utilisé' });
            }
            user.email = email;
        }
        if (name) {
            user.name = name;
        }
        if (password) {
            if (password.length < 6) {
                return res.status(400).json({ message: 'Le mot de passe doit comporter au moins 6 caractères' });
            }
            user.password = password;
        }
        const updatedUser = await user.save();
        res.status(200).json({
            message: 'Profil mis à jour avec succès',
            user: {
                id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Veuillez fournir un email et un mot de passe' });
        }

        const user = await User.findOne({ email }).select('+password');

        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ message: 'Identifiants invalides' });
        }

        const token = generateToken(user._id, user.role);

        res.status(200).json({
            message: 'Connexion réussie',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'Cet email est déjà utilisé' });
        }

        const user = await User.create({
            name,
            email,
            password,
            role: role || 'operateur'
        });

        const token = generateToken(user._id, user.role);

        res.status(201).json({
            message: 'Utilisateur créé avec succès',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { login, register, getMe, updateMe };
