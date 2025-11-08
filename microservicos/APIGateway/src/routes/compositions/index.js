const express = require("express");
const clienteComposition = require("./clienteComposition");
const gerenteComposition = require("./gerenteComposition");
const setupProxies = require("../proxies");

const router = express.Router();

router.use("/clientes", clienteComposition);
router.use("/gerentes", gerenteComposition);

module.exports = router;
