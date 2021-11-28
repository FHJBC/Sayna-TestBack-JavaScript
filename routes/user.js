const User = require("../models/User");
const { verifyToken } = require("../middleware/verifyToken");
const router = require("express").Router();


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

    const { firstname, lastname, date_naissance, sexe } = req.body;

    if(!(firstname && lastname && date_naissance && sexe))
      return res.status(401).json(
          { error: true, message: "Aucun données n'a été envoyé." }
      );

    if(req.user)
      const userId = req.user._id;

    try {
        await User.findOneAndUpdate(
          userId,
          {
              $set: req.body,
          },
          { new: true }
        );
        res.status(200).json(
          { error: false, message: "L'utilisateur a été modifié avec succès."  }
        );
    } catch (err) {
        res.status(500).json(err);
    }
});


//UPDATE Password
router.put("/user/:token", verifyToken, async (req, res) => {

  if (req.body.password) {
    req.body.password = CryptoJS.AES.encrypt(
      req.body.password,
      process.env.PASS_SEC
    ).toString();
  }

   if(req.user)
      const userId = req.user._id;

  try {
    const updatedUser = await User.findOneAndUpdate(
      userId,
      {
        $set: req.body,
      },
      { new: true }
    );

    res.status(200).json(
        { error: false, message: "Le mot de passe a été modifié avec succès."  }
    );

  } catch (err) {
    res.status(500).json(err);
  }
});

//GET ALL USERS
router.get("/users/:token", verifyToken, async (req, res) => {

  try {
    const users = await User.find();

    res.status(200).json({ error: false, ...users });

  } catch (err) {
    res.status(500).json(err);
  }
});

// DELETE a User
router.delete("/user/:token", verifyToken, async (req, res) => {

  if(req.user)
    const userId = req.user._id;

  try {

    await User.findOneAndDelete({_id: userId});

    res.status(200).json(
      { error: false, message: "L'utilisateur a été déconnecté avec succès." }
    );

  } catch (err) {
    res.status(500).json(err);
  }
});


module.exports = router;
