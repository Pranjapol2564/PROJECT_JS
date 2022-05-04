const sharp = require('sharp');
const uid = require('uid');
const fs = require('fs');

const User = require("../models/user"),
      Activity = require("../models/activity"),
      Book = require("../models/book"),
      Issue = require("../models/issue")


exports.getUserDashboard = async(req, res, next) => {
    const user_id = req. user._id;

    try {
        const user = await User.findById(user_id);

        if(user.bookIssueInfo.length > 0) {
            const issues = await Issue.find({"user_id.id" : user._id});
        }
        const activities = await Activity
            .find({"user_id.id": req.user._id})
            .sort({_id: -1})

        const activity_count = await Activity.find({"user_id.id": req.user._id}).countDocuments();

        res.render("user/index", {
					user : user,
					activities : activities,
        });
    } catch(err) {
			console.log(err);
			return res.redirect('back');
    }
}

exports.postIssueBook = async(req, res, next) => {
    if(req.user.violationFlag) {
        req.flash("error", "You are flagged for violating rules/delay on returning books. Untill the flag is lifted, You can't issue any books");
        return res.redirect("back");
    }

    if(req.user.bookIssueInfo.length >= 5) {
        req.flash("warning", "You can't issue more than 5 books at a time");
        return res.redirect("back");
    }

    try {
        const book = await Book.findById(req.params.book_id);
        const user = await User.findById(req.params.user_id);

        book.stock -= 1;
        const issue =  new Issue({
            book_info: {
                id: book._id,
                title: book.title,
                author: book.author,
                ISBN: book.ISBN,
                category: book.category,
                stock: book.stock,
            },
            user_id: {
                id: user._id,
                username: user.username,
            }
        });

        user.bookIssueInfo.push(book._id);

        const activity = new Activity({
            info: {
                id: book._id,
                title: book.title,
            },
            category: "Issue",
            time: {
                id: issue._id,
                issueDate: issue.book_info.issueDate,
                returnDate: issue.book_info.returnDate,
            },
            user_id: {
                id: user._id,
                username: user.username,
            }
        });

        await issue.save();
        await user.save();
        await book.save();
        await activity.save();

        res.redirect("/books/all/all");
    } catch(err) {
        console.log(err);
        return res.redirect("back");
    }
}

exports.getShowRenewReturn = async(req, res, next) => {
    const user_id = req.user._id;
    try {
        const issue = await Issue.find({"user_id.id": user_id});
        res.render("user/return-renew", {user: issue});
    } catch (err) {
        console.log(err);
        return res.redirect("back");
    }
}

exports.postRenewBook = async(req, res, next) => {
    try {
        const searchObj = {
            "user_id.id": req.user._id,
            "book_info.id": req.params.book_id,
        }
        const issue = await Issue.findOne(searchObj);
        let time = issue.book_info.returnDate.getTime();
        issue.book_info.returnDate = time + 7*24*60*60*1000;
        issue.book_info.isRenewed = true;

        const activity = new Activity({
            info: {
                id: issue._id,
                title: issue.book_info.title,
            },
            category: "Renew",
            time: {
                id: issue._id,
                issueDate: issue.book_info.issueDate,
                returnDate: issue.book_info.returnDate,
            },
            user_id: {
                id: req.user._id,
                username: req.user.username,
            }
        });

        await activity.save();
        await issue.save();

        res.redirect("/books/return-renew");
    } catch (err) {
        console.log(err);
        return res.redirect("back");
        
    }
}

exports.postReturnBook = async(req, res, next) => {
    try {
        const book_id = req.params.book_id;
        const pos = req.user.bookIssueInfo.indexOf(req.params.book_id);
        
        const book = await Book.findById(book_id);
        book.stock += 1;
        await book.save();

        const issue =  await Issue.findOne({"user_id.id": req.user._id});
        await issue.remove();

        req.user.bookIssueInfo.splice(pos, 1);
        await req.user.save();

        const activity = new Activity({
            info: {
                id: issue.book_info.id,
                title: issue.book_info.title,
            },
            category: "Return",
            time: {
                id: issue._id,
                issueDate: issue.book_info.issueDate,
                returnDate: issue.book_info.returnDate,
            },
            user_id: {
                id: req.user._id,
                username: req.user.username,
            }
        });
        await activity.save();

        res.redirect("/books/return-renew");
    } catch(err) {
        console.log(err);
        return res.redirect("back");
    }
}



