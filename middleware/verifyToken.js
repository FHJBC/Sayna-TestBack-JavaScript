const jwt = require("jsonwebtoken");
const Tokens = require("../models/Tokens");
const User = require("../models/User");
const { verifyJWT } = require("../utils/jwt.utils");

const verifyToken = async (req, res, next) => {
  try {
   
    const { token } = req.params;
    
     // validation format token
    const { payload } = verifyJWT(token);
    
    if (payload === null) {
      return res.status(401).json(
        { error: true, message: "Le token envoyé n'est pas conforme." }
      );
    } else {
      // si token valide -> vérifier son existence dans la BDD
      tokenInDB = Tokens.findOne({ accessToken: token })
      if (!tokenInDB) {
        return res.status(401).json(
          { error: true, message: "Le token envoyé n'existe pas." }
        ); 
      } else {
        // si token n'est plus valide -> demander à l'utilisateur de le réinitialiser
        const { accessToken } = tokenInDB;

        const { payload, expired  } = verifyJWT(accessToken);

        const { userId } = payload;

        if (expired) {
          return res.status(401).json(
            { error: true, message: "Votre token n'est plus valide, veuillez le réinitialiser." }
          );    
        }

        const user = await User.findById(userId);

        req.user = user;

        next();

      }
    }

  } catch (err) {
    res.status(500).json(err);
  }
};

const verifyTokenAndAuthorization = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.id === req.params.id || req.user.isAdmin) {
      next();
    } else {
      res.status(403).json("You are not alowed to do that!");
    }
  });
};

const verifyTokenAndAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.isAdmin) {
      next();
    } else {
      res.status(403).json("You are not alowed to do that!");
    }
  });
};

module.exports = {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
};
