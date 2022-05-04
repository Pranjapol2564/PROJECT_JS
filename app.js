const express = require("express"),
  app = express(),
  mongoose = require("mongoose"),
  session = require("express-session"),
  passport = require("passport"),
  multer = require("multer"),
  uid = require("uid"),
  path = require("path"),
  sanitizer = require("express-sanitizer"),
  methodOverride = require("method-override"),
  localStrategy = require("passport-local"),
  MongoStore = require("connect-mongodb-session")(session),
  flash = require("connect-flash"),
  User = require("./models/user"),
  userRoutes = require("./routes/users"),
  adminRoutes = require("./routes/admin"),
  bookRoutes = require("./routes/books"),
  authRoutes = require("./routes/auth");


if (process.env.NODE_ENV !== "production") require("dotenv").config();

app.set("view engine", "ejs");
app.use(methodOverride("_method"));
app.use(express.static(__dirname + "/public"));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(sanitizer());

mongoose
  .connect(process.env.DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log("MongoDB is connected"))
  .catch((error) => console.log(error));


const store = new MongoStore({
  uri: process.env.DB_URL,
  collection: "sessions",
});

app.use(
  session({
    secret: process.env.SESSION_SECRET || "Wrong",
    saveUninitialized: false,
    resave: false,
    store,
  })
);

app.use(flash());
app.use(passport.initialize()); 
app.use(passport.session());

passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());




app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  res.locals.warning = req.flash("warning");
  next();
});

app.use(userRoutes);
app.use(adminRoutes);
app.use(bookRoutes);
app.use(authRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`server is running`);
});
