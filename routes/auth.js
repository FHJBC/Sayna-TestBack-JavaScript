const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const moment = require("moment");
const User = require("../models/User");
const Tokens = require("../models/Tokens");



const MAX_LOGIN_ATTEMPTS = 5; // after which the account should be locked
const LOCK_DURATION = 60; // in minutes

// REGISTER User
router.post("/register", async (req, res) => {
    
  try {
    // Get user input
    const { firstname, lastname, email, password, date_naissance, sexe } = req.body;

    if (!(firstname || lastname || email || password || date_naissance || sexe)) {
        res.status(401).json({ error: true, message: "L'une ou plusieurs des données obligatoires sont manquantes." });
    } 

    // Check if email already exists in the DB

    const oldUser = await User.findOne({ email });

    if (oldUser) {
        return res.status(401).json({ error: true, message: "Votre mail n'est pas correct." })
    }

    //Encrypt user password
    encryptedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
        firstname,
        lastname,
        email,
        password: encryptedPassword,
        date_naissance,
        sexe,
    });

    const savedUser = await newUser.save();

    if (savedUser) {
        // Create an access token
        const accessToken = jwt.sign(
        {
            userId: savedUser._id,
            email,
        },
        process.env.ACCESS_TOKEN_SECRET_KEY,
            { expiresIn: process.env.ACCESS_TOKEN_TTL }
        );
  
        // Create a refresh token
        const refreshToken = jwt.sign(
            {
                userId: savedUser._id,
                email,
            },
            process.env.REFRESH_TOKEN_SECRET_KEY,
            { expiresIn: process.env.REFRESH_TOKEN_TTL }
        );

        // const tokens = await Token.create({ accessToken, refreshToken });
        const tokensToSave = new Tokens({ accessToken, refreshToken });

        const tokens = await tokensToSave.save();

        // Add tokens to the registered user
        await User.findOneAndUpdate(
            { email: savedUser.email },
            {
                $set: { tokens }
            }
        );

        res.status(201).json(
            { 
                error: false, 
                message: "L'utilisateur a bien été créé avec succès.",
                tokens: {
                    token: accessToken,
                    refreshToken: refreshToken,
                    createdAt: tokens.createdAt
                }
            }
        );
    }
        
    } catch (err) {
        res.status(500).json({error: true, message: err.message});
    }

});

// LOGIN User

router.post('/login', async (req, res) => {
    try{
        const { email, password } = req.body;

        if (!(email || password)) {
            return res.status(401).json({ error: true, message: "L'email/password est manquant" });
        }

        const user = await User.findOne(
            {
                email
            }
        );

        if (user && user.isLocked && user.unlockAt > new Date()) {
            return res.status(401).json(
                {
                    error: true,
                    message: `Trop de tentatives sur l'email ${email} - Veuillez patienter 1h`
                }
            );
        }
        
        let attempts = user.loginAttempts;

        if (user && !(await bcrypt.compare(password, user.password))) { 

            attempts += 1;

            const updatedUser = await User.findOneAndUpdate(
                { email: user.email },
                {
                    $set: { loginAttempts: attempts }
                },
                { new: true }
            );

            if (updatedUser.loginAttempts >= MAX_LOGIN_ATTEMPTS) {

                let d = new Date();

                d.setMinutes(d.getMinutes() + LOCK_DURATION);

                await User.findOneAndUpdate(
                    { email: user.email },
                    {
                        $set: { isLocked: true, unlockAt: d }
                    }
                );
            }

            return res.status(401).json(
                { 
                    error: true, message: "Votre email ou password est erroné." 
                }
            );
        } 

        await User.findOneAndUpdate(
            { email: user.email },
            {
                $set: { loginAttempts: 0, isLocked: false, unlockAt: null }
            }
        );

        const { accessToken, refreshToken, createdAt } = user.tokens;

        res.status(200).json(
            { 
                error: false, 
                message: "L'utilisateur a été authentifié avec succès.",
                tokens: {
                    token: accessToken,
                    refreshToken: refreshToken,
                    createdAt: createdAt
                }
            }
        );

    }catch(err){
        res.status(500).json({message: err.message});
    }

});

module.exports = router;
