const fs = require('fs');

const Book = require('../models/book');
const User = require('../models/user');
const Activity = require('../models/activity');
const Issue = require('../models/issue');

exports.getDashboard = async(req, res, next) => {
    try{
        const users_count = await User.find().countDocuments() - 1;
        const books_count = await Book.find().countDocuments();
        const activity_count = await Activity.find().countDocuments();
        const activities = await Activity
            .find()
            .sort('-entryTime')

        res.render("admin/index", {
            users_count : users_count,
            books_count : books_count,
            activities : activities,
            });   
    } catch(err) {
        console.log(err)
    }
}

exports.postDashboard = async(req, res, next) => {
    try {
        const search_value = req.body.searchUser;
        
        const books_count = await Book.find().countDocuments();
        const users_count = await User.find().countDocuments();

        const activities = await Activity
            .find({
                $or : [
                    {"user_id.username" :search_value},
                    {"category" : search_value}
                ]
            });

        res.render("admin/index", {
            users_count: users_count,
            books_count: books_count,
            activities: activities,
            current: 1,

        });      
        
    } catch (err) {
        console.log(err);
        return res.redirect("back");
    }
}



exports.getAdminBookInventory = async(req, res, next) => {
    try{
        const filter = req.params.filter;
        const value = req.params.value;

        let searchObj = {};
        if(filter !== 'all' && value !== 'all') {
            searchObj[filter] = value;
         }

        const books_count = await Book.find(searchObj).countDocuments();

        const books = await Book
            .find(searchObj)
        
        res.render("admin/bookInventory", {
            books : books,
            filter : filter,
            value : value,
        });
    } catch(err) {
        return res.redirect('back');
    }
}

exports.postAdminBookInventory = async(req, res, next) => {
    try {
        const filter = req.body.filter.toLowerCase();
        const value = req.body.searchName;

        if(value == "") {
            req.flash("error", "Search field is empty. Please fill the search field in order to get a result");
            return res.redirect('back');
        }
        const searchObj = {};
        searchObj[filter] = value;

        const books_count = await Book.find(searchObj).countDocuments();

        const books = await Book
            .find(searchObj)

        
        res.render("admin/bookInventory", {
            books: books,
            filter: filter,
            value: value,
        });

    } catch(err) {
        return res.redirect('back');
    }
}

exports.getUpdateBook = async (req, res, next) => {

    try {
        const book_id = req.params.book_id;
        const book = await Book.findById(book_id);

        res.render('admin/book', {
            book: book,
        })
    } catch(err) {
        console.log(err);
        return res.redirect('back');
    }
};

exports.postUpdateBook = async(req, res, next) => {

    try {
        const book_info = req.body.book;
        const book_id = req.params.book_id;

        await Book.findByIdAndUpdate(book_id, book_info);

        res.redirect("/admin/bookInventory/all/all");
    } catch (err) {
        console.log(err);
        res.redirect('back');
    }
};

exports.getDeleteBook = async(req, res, next) => {
    try {
        const book_id = req.params.book_id;

        const book = await Book.findById(book_id);
        await book.remove();

        req.flash("success", `A book named ${book.title} is just deleted!`);
        res.redirect('back');

    } catch(err) {
        console.log(err);
        res.redirect('back');
    }
};

exports.getUserList = async (req, res, next) =>  {
    try {
        const users = await User
            .find()
            .sort('-joined')

        const users_count = await User.find().countDocuments();

        res.render('admin/users', {
            users: users,
        });

    } catch (err) {
        console.log(err);
        res.redirect('back');
    }
};

exports.postShowSearchedUser = async (req, res, next) => {
    try {
        const search_value = req.body.searchUser;

        const users = await User.find({
            $or: [
                {"firstName": search_value},
                {"lastName": search_value},
                {"username": search_value},
                {"email": search_value},
            ]
        });

        if(users.length <= 0) {
            req.flash("error", "User not found!");
            return res.redirect('back');
        } else {
            res.render("admin/users", {
                users: users,
            });
        }
    } catch (err) {
        console.log(err);
        res.redirect('back');
    }
};

exports.getFlagUser = async (req, res, next) => {
    try {
        const user_id = req.params.user_id;

        const user = await User.findById(user_id);

        if(user.violationFlag) {
            user.violationFlag = false;
            await user.save();
            req.flash("success", `An user named ${user.firstName} ${user.lastName} is just unflagged!`);
        } else {
            user.violationFlag = true;
            await user.save();
            req.flash("warning", `An user named ${user.firstName} ${user.lastName} is just flagged!`);
        }

        res.redirect("/admin/users");
    } catch (err) {
        console.log(err);
        res.redirect('back');
    }
};

exports.getUserProfile = async (req, res, next) => {
    try {
        const user_id = req.params.user_id;

        const user = await User.findById(user_id);
        const issues = await Issue.find({"user_id.id": user_id});
        const activities = await Activity.find({"user_id.id": user_id}).sort('-entryTime');

        res.render("admin/user", {
            user: user,
            issues: issues,
            activities: activities,
        });
    } catch (err) {
        console.log(err);
        res.redirect('back');
    }
}

exports.getUserAllActivities = async (req, res, next) => {
    try {
        const user_id = req.params.user_id;

        const activities = await Activity.find({"user_id.id": user_id})
                                         .sort('-entryTime');
        res.render("admin/activities", {
            activities: activities
        });
    } catch(err) {
        console.log(err);
        res.redirect('back');
    }
};

exports.postShowActivitiesByCategory = async (req, res, next) => {
    try {
        const category = req.body.category;
        const activities = await Activity.find({"category": category});

        res.render("admin/activities", {
            activities: activities,
        });
    } catch(err) {
        console.log(err);
        res.redirect('back');
    }
};

exports.getDeleteUser = async (req, res, next) => {
    try {
        const user_id = req.params.user_id;
        const user = await User.findById(user_id);
        await user.remove();

        await Issue.deleteMany({"user_id.id": user_id});
        await Activity.deleteMany({"user_id.id": user_id});

        res.redirect("/admin/users");
    } catch(err) {
        console.log(err);
        res.redirect('back');
    }
}

exports.getAddNewBook = (req, res, next) => {
    res.render("admin/addBook");
}

exports.postAddNewBook = async(req, res, next) => {
    try {
        const book_info = req.body.book;
        
        const isDuplicate = await Book.find(book_info);

        if(isDuplicate.length > 0) {
            req.flash("error", "This book is already registered in inventory");
            return res.redirect('back');
        } 

        const new_book = new Book(book_info);
        await new_book.save();
        req.flash("success", `A new book named ${new_book.title} is added to the inventory`);
        res.redirect("/admin/bookInventory/all/all");
    } catch(err) {
        console.log(err);
        res.redirect('back');
    }
};
