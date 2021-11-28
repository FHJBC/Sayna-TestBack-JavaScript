const router = require("express").Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { verifyToken } = require("../middleware/verifyToken");


//GET USER
router.get("/user/:token", verifyToken, async (req, res) => {
  if (req.user) {

    const { firstname, lastname, email, date_naissance, sexe, createdAt } = req.user;

    return res.status(200).json({
            error: false,
            user: {
                firstname,
                lastname,
                email,
                date_naissance,
                sexe,
                createdAt
            }
        });
  }
});

//UPDATE a User
router.put("/user/:token", verifyToken, async (req, res) => {

    if( Object.keys(req.body).length === 0)
      return res.status(401).json(
          { error: true, message: "Aucune données n'a été envoyé." }
      );

    if(req.user) {

        try {
            await User.findOneAndUpdate(
              req.user._id,
              {
                  $set: req.body,
              },
              { new: true }
            );
            res.status(200).json(
              { error: false, message: "L'utilisateur a été modifié avec succès."  }
            );
        } catch (err) {
            res.status(500).json({ error: true, message: err.message });
        }
    }

});


//UPDATE Password
router.put("/user/pwd/:token", verifyToken, async (req, res) => {

  if (req.body.password && req.user) {
    //Encrypt user password
      encryptedPassword = await bcrypt.hash(req.body.password, 10);
      try {
            await User.findOneAndUpdate(
              req.user._id,
              {
                $set: { password: encryptedPassword },
              }
            );

            res.status(200).json(
                { error: false, message: "Le mot de passe a été modifié avec succès."  }
            );

      } catch (err) {
        res.status(500).json({ error: true, message: err.message });
      }
  }
  
});

//GET ALL USERS
router.get("/users/:token", verifyToken, async (req, res) => {

  try {
    const users = await User.find().populate("tokens", "-__v").select("-__v");

    res.status(200).json({ error: false, ...users });

  } catch (err) {
    res.status(500).json(err);
  }
});

// DELETE a User
router.delete("/user/:token", verifyToken, async (req, res) => {

  if(req.user) {
        // console.log(req.user);

        try {
      
          await User.findOneAndDelete({_id: req.user._id});
      
          res.status(200).json(
            { error: false, message: "L'utilisateur a été déconnecté avec succès." }
          );
      
        } catch (err) {
          res.status(500).json({ error: true, message: err.message });
        }
    }

});


module.exports = router;
