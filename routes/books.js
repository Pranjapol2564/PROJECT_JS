const express = require("express"),
      router = express.Router();


const bookController = require('../controllers/books');

router.get("/books/:filter/:value", bookController.getBooks);

router.post("/books/:filter/:value", bookController.findBooks);

module.exports = router;