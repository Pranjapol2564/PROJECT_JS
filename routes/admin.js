const express = require("express"),
      router = express.Router(),
      passport = require("passport"),
      middleware = require("../middleware"),
      User = require("../models/user"),
      Book = require("../models/book"),
      Activity = require("../models/activity"),
      Issue = require("../models/issue")

const adminController = require('../controllers/admin');

router.get("/admin", middleware.isAdmin, adminController.getDashboard);

router.post("/admin", middleware.isAdmin, adminController.postDashboard);

router.get("/admin/bookInventory/:filter/:value", middleware.isAdmin, adminController.getAdminBookInventory);

router.post("/admin/bookInventory/:filter/:value", middleware.isAdmin, adminController.postAdminBookInventory);

router.get("/admin/book/update/:book_id", middleware.isAdmin, adminController.getUpdateBook);

router.post("/admin/book/update/:book_id", middleware.isAdmin, adminController.postUpdateBook);

router.get("/admin/book/delete/:book_id", middleware.isAdmin, adminController.getDeleteBook);
 
router.get("/admin/users", middleware.isAdmin, adminController.getUserList);

router.post("/admin/users", middleware.isAdmin, adminController.postShowSearchedUser); 

router.get("/admin/users/flagged/:user_id", middleware.isAdmin, adminController.getFlagUser);

router.get("/admin/users/profile/:user_id", middleware.isAdmin, adminController.getUserProfile);

router.get("/admin/users/activities/:user_id", middleware.isAdmin, adminController.getUserAllActivities);

router.post("/admin/users/activities/:user_id", middleware.isAdmin, adminController.postShowActivitiesByCategory);

router.get("/admin/users/delete/:user_id", middleware.isAdmin, adminController.getDeleteUser);

router.get("/admin/books/add", middleware.isAdmin, adminController.getAddNewBook);

router.post("/admin/books/add", middleware.isAdmin, adminController.postAddNewBook);


module.exports = router;