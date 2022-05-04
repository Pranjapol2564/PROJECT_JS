const Book = require('../models/book');



exports.getBooks = async(req, res, next) => {
    const filter = req.params.filter;
    const value = req.params.value;
    let searchObj = {};
 
    if(filter != 'all' && value != 'all') {
       searchObj[filter] = value;
    }

    try {
       const books = await Book
       .find(searchObj)

       const count = await Book.find(searchObj).countDocuments();
 
       res.render("books", {
          books: books,
          filter: filter,
          value: value,
          user: req.user,
       })
    } catch(err) {
       console.log(err)
    }
}

exports.findBooks = async(req, res, next) => {
   const filter = req.body.filter.toLowerCase();
   const value = req.body.searchName;

   if(value == "") {
       req.flash("error", "Search field is empty. Please fill the search field in order to get a result");
       return res.redirect('back');
   }

   const searchObj = {};
   searchObj[filter] = value;

   try {
      const books = await Book
      .find(searchObj)

      const count = await Book.find(searchObj).countDocuments();

      res.render("books", {
         books: books,
         filter: filter,
         value: value,
         user: req.user,
      })
   } catch(err) {
      console.log(err)
   }
}
