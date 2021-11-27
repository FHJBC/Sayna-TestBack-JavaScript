const User = require("../models/User");
const {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
} = require("./verifyToken");

const router = require("express").Router();


//GET USER
router.get("/user/:token", verifyToken, async (req, res) => {

    // validation format token

    // si token valide -> vérifier son existence dans la BDD

    // si token n'est plus valide -> demander à l'utilisateur de le réinitialiser
  try {

    const user = await User.findOne(req.params.token);

    if (!user) {
        return res.status(401).json({ error: true, message: "Le token envoyé n'est pas conforme" });
    }

    res.status(200).json({
        error: false,
        user: {
            firstName: '',
            lastName: '',
            email: '',
            date_naissance: '',
            sexe: '',
            createdAt: ''
        }
    });


  } catch (err) {
    res.status(500).json(err);
  }
});

//UPDATE a User
router.put("/user/:token", verifyTokenAndAuthorization, async (req, res) => {

    // validation format token

    // si token valide -> vérifier son existence dans la BDD

    // si token n'est plus valide -> demander à l'utilisateur de le réinitialiser

    try {
        const updatedProduct = await User.findOneAndUpdate(
        req.params.token,
        {
            $set: req.body,
        },
        { new: true }
        );
        res.status(200).json(updatedProduct);
    } catch (err) {
        res.status(500).json(err);
    }
});



//UPDATE Password
router.put("/user/:token", verifyTokenAndAuthorization, async (req, res) => {

    newPassword = req.body.password

  if (newPassword) {
    newPassword = CryptoJS.AES.encrypt(
      newPassword,
      process.env.PASS_SEC
    ).toString();
  }

  try {
    const updatedUser = await User.findOneAndUpdate(
      req.params.token,
      {
        $set: req.body,
      },
      { new: true }
    );

    res.status(200).json(updatedUser);

  } catch (err) {
    res.status(500).json(err);
  }
});

//GET ALL USERS
router.get("/users/:token", verifyTokenAndAdmin, async (req, res) => {
    token = req.params.token
  
    // validation format token

    // si token valide -> vérifier son existence dans la BDD

    // si token n'est plus valide -> demander à l'utilisateur de le réinitialiser

  try {
    const users = await User.find();

    
    // res.status(200).json(users);

    res.status(200).send({ error: false, ...users })

  } catch (err) {
    res.status(500).json(err);
  }
});

// DELETE a User
router.delete("/user/:token", verifyTokenAndAuthorization, async (req, res) => {
  try {
    await User.findOneAndDelete(req.params.token);

    res.status(200).json({ error: false, message: "L'utilisateur a été déconnecté avec succès." });
  } catch (err) {
    res.status(500).json(err);
  }
});


module.exports = router;
