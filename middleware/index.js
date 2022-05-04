const multer = require("multer");

const middleware = {};

middleware.isLoggedIn = function(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    res.redirect("/");
};

middleware.isAdmin = function(req, res, next) {
    if(req.isAuthenticated() && req.user.isAdmin) {
        return next();
    }
    res.redirect("/auth/admin-login");
};

middleware.upload = multer({
      limits: {
        fileSize: 4 * 1024 * 1024,
      }
    });

module.exports = middleware;