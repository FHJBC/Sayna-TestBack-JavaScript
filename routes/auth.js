const router = require("express").Router();
const User = require("../models/User");
const Tokens = require("../models/Tokens");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");

// REGISTER User
router.post("/register", async (req, res) => {
  try {
    // Get user input
    const { firstname, lastname, email, password, date_naissance, sexe } = req.body;

    if (!(firstname || lastname || email || password || date_naissance || sexe)) {
        return res.status(401).json({ error: true, message: "L'une ou plusieurs des données obligatoires sont manquantes." });
    } 

    // check if email already exists in the DB

    const oldUser = await User.findOne({ email });

    if (oldUser) {
        return res.status(401).json({ error: true, message: "Votre mail n'est pas correct." })
    }

    const newUser = new User({
        firstname,
        lastname,
        email,
        password: CryptoJS.AES.encrypt(
            password,
            process.env.PASS_SEC
        ).toString(),
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
            { expiresIn: REFRESH_TOKEN_TTL }
        );

        const tokens = await Tokens.create({ accessToken, refreshToken });

        res.status(201).json(
            { 
                error: false, 
                message: "L'utilisateur a bien été créé avec succès.",
                tokens: {
                    token: tokens.accessToken,
                    refreshToken: tokens.refreshToken,
                    createdAt: tokens.createdAt
                }
            }
        );
    }
        
    } catch (err) {
        res.status(500).json(err);
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
                email,
            }
        );

        const hashedPassword = CryptoJS.AES.decrypt(
            user.password,
            process.env.PASS_SEC
        );

        const originalPassword = hashedPassword.toString(CryptoJS.enc.Utf8);
        
        if (!user || originalPassword != password) {           
            return res.status(401).json({ error: true, message: "Votre email ou password est erroné." });
        } 

        // Create an access token
        // const accessToken = jwt.sign(
        // {
        //     user_id: user._id,
        //     isAdmin: user.isAdmin,
        //     email,
        // },
        // process.env.TOKEN_PRIVATE_KEY,
        //     { expiresIn:"2h" }
        // );

        res.status(200).json(
            { 
                error: false, 
                message: "L'utilisateur a été authentifié avec succès.",
                tokens: {
                    token: user.tokens.accessToken,
                    refreshToken: user.tokens.refreshToken,
                    createdAt: user.tokens.createdAt
                }
            }
        );

    }catch(err){
        res.status(500).json(err);
    }

});

module.exports = router;
