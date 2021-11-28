const jwt = require("jsonwebtoken");
const Tokens = require("../models/Tokens");
const User = require("../models/User");
const  verifyJWT = require("../utils/jwt.utils");

const verifyToken = async (req, res, next) => {
  try {
   
    const token = req.params.token;
  
     // validation format token
    const { payload, expired } = await verifyJWT(token);
    
    if (payload === null && expired ===false) {
      return res.status(401).json(
        { error: true, message: "Le token envoyé n'est pas conforme." }
      );
    } else {
      // si token valide -> vérifier son existence dans la BDD
      tokenInDB = await Tokens.findOne({ accessToken: token })
      if (!tokenInDB) {
        return res.status(401).json(
          { error: true, message: "Le token envoyé n'existe pas." }
        ); 
      } else {
        // si token n'est plus valide -> demander à l'utilisateur de le réinitialiser
        
        const { accessToken } = tokenInDB;

        const { payload, expired } = await verifyJWT(accessToken);

        const email = payload !== null ? payload.email : null;

        if (expired) {
          return res.status(401).json(
            { error: true, message: "Votre token n'est plus valide, veuillez le réinitialiser." }
          );    
        }

        if (email) {
          const user = await User.findOne({ email });

          req.user = user;

          next();
        }

      }
    }

  } catch (err) {
    res.status(500).json({message: err.message});
  }
};

module.exports = {
  verifyToken
};
