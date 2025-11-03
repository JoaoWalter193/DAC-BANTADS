const express = require("express");
const clienteComposition = require("./clienteComposition");
const gerenteComposition = require("./gerenteComposition");

const router = express.Router();

router.use("/", clienteComposition);
router.use("/", gerenteComposition);

module.exports = router;