const nodemailer = require('nodemailer');
const express = require('express');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
require('dotenv').config();  // Importer et configurer dotenv

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware pour servir des fichiers statiques
app.use(express.static(__dirname));

// Configuration de la session
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Ajustez en fonction de votre environnement (true pour HTTPS)
}));

// Initialiser Passport
app.use(passport.initialize());
app.use(passport.session());

// Configuration de Passport pour la sérialisation et désérialisation des utilisateurs
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    done(null, { id: id }); // Exemple de retour d'un utilisateur avec l'ID
});

// Configuration de Passport avec Google
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback'
}, (accessToken, refreshToken, profile, done) => {
    return done(null, profile);
}));

// Créer un transporteur Nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,  // Votre adresse email
        pass: process.env.EMAIL_PASS   // Votre mot de passe d'application généré
    }
});

// Fonction pour envoyer un email
const sendEmail = (to, subject, text) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: to,
        subject: subject,
        text: text
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Erreur lors de l’envoi de l’email:', error);
        } else {
            console.log('Email envoyé:', info.response);
        }
    });
};



passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_CLIENT_ID,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    callbackURL: '/auth/facebook/callback',
    profileFields: ['id', 'emails', 'name']
}, (accessToken, refreshToken, profile, done) => {
    console.log('Facebook Callback - Access Token:', accessToken);
    console.log('Facebook Callback - Refresh Token:', refreshToken);
    console.log('Facebook Callback - Profile:', profile);

    // Ajoutez ici la logique pour sauvegarder ou traiter les informations de l'utilisateur

    return done(null, profile);
}));

// Définir les routes d'authentification
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/' }), (req, res) => {
    // Récupérer l'email de l'utilisateur depuis le profil Google
    const email = req.user.emails[0].value;

    // Envoyer un email de bienvenue
    sendEmail(email, 'Bienvenue!', 'Merci de vous être connecté à notre application !');

    res.redirect('/');
});

app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email'] }));
app.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/' }), (req, res) => {
    res.redirect('/');
});

// Routes pour les pages
// Routes pour les pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/track', (req, res) => {
    res.sendFile(path.join(__dirname, 'track.html'));
});



// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
