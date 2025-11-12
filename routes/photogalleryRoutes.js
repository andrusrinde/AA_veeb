const express = require("express");

const router = express.Router();

const {photogalleryHome} = require("../controllers/photogalleryControllers");

router.route("/").get(photogalleryHome);

module.exports = router;