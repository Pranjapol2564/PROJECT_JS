const express = require("express"),
      router = express.Router(),
      middleware = require("../middleware");

const userController = require('../controllers/user');

router.get("/user", middleware.isLoggedIn, userController.getUserDashboard);

router.post("/books/:book_id/issue/:user_id", middleware.isLoggedIn, userController.postIssueBook);

router.get("/books/return-renew", middleware.isLoggedIn, userController.getShowRenewReturn);

router.post("/books/:book_id/renew", middleware.isLoggedIn, middleware.isLoggedIn, userController.postRenewBook);

router.post("/books/:book_id/return", middleware.isLoggedIn, userController.postReturnBook);


module.exports = router;