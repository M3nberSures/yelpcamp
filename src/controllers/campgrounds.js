const Campground = require("../models/campground");
const Comment = require("../models/comment");
const cloudinary = require('cloudinary');

const utils = require('../Utils/date');


function Camground(name, image, description, price, username, iduser) {
    this.name = name;
    this.image = image;
    this.description = description;
    this.price = price;
    this.author = {
      username: username,
      id: iduser
    };
  };

module.exports.getCampgrounds = (req, res) => {
    // get all campgrounds from db
    Campground.find({}, (err, campgrounds) => {
      if (err) {
        console.log(err);
      } else {
        res.render("campgrounds", {
          campgrounds: campgrounds,
          doctitle: "Camgrounds Page",
        });
      }
    });
  }

  module.exports.getCampground = function (req, res) {
    let id = req.params.id;
    Campground.findById(id).populate("comments").exec(function (err, foundCampground) {
      if (err) {
        console.log(err);
      } else  {
        res.render("show", {
          doctitle: "Show",
          campground: foundCampground,
          formatFromAgo: utils.formatFromAgo
        });
      }
    });
  }

  module.exports.postCampground = (req, res) => {
    cloudinary.uploader.upload(req.file.path, function (result) {
      // add cloudinary url for the image to the campground object under image property
      req.body.image = result.secure_url;
      let newCampground = new Camground (req.body.name, req.body.image, req.body.description, req.body.price, req.user.username, req.user._id);
      Campground.create(newCampground, function (err, newlyCreated) {
        if (err) throw err;
        req.flash("success", "Successfully created new campground " + newlyCreated.name +" !");
        res.redirect(`/campgrounds/${newlyCreated._id}`);
      });
    });
  }

  module.exports.postComment = function (req, res) {
    Campground.findById(req.params.id, function (err, campground) {
      if (err) throw err;
      Comment.create({
        text: req.body.comment,
        author: {
          id: req.user._id,
          username: req.user.username,
        }
      }, function (err, comment) {
        if (err) throw err;
        campground.comments.push(comment);
        campground.save();
        return res.redirect("/campgrounds/" + campground._id);
      });
    });
  }

  module.exports.postEditComment = function (req, res) {
    let newdata = {
      text: req.body.comment
    };
    Comment.findByIdAndUpdate(req.params.commentid, newdata ,function(err, comment){
      res.redirect("/campgrounds/" + req.params.id);
    });
  }

  module.exports.deleteComment = function (req, res) {
    Comment.findByIdAndRemove(req.params.commentid, function(err, comment){
      if (err) throw err;
      res.redirect("/campgrounds/" + req.params.id);
    });
  }

  module.exports.postEditCampground = function(req, res){
    if (typeof req.file == 'undefined') {
      Campground.findById(req.params.id, function(err, foundcampground){
        if (err) throw err;
        let newData = {
          name: req.body.name,
          image: foundcampground.image,
          description: req.body.description,
          price: req.body.price
        };
        Campground.findByIdAndUpdate(req.params.id, newData, function(err, campground) {
          if (err) throw err;
          req.flash("success", "Successfully updated " + campground.name + " campground!");
          res.redirect("/campgrounds/" + req.params.id);
      });
      });
     } else {
      cloudinary.uploader.upload(req.file.path, function(result) {
        // add cloudinary url for the image to the campground object under image property
        req.body.image = result.secure_url;
        Campground.findByIdAndUpdate(req.params.id, req.body, function(err, campground) {
            if (err) throw err;
            req.flash("success", "Successfully updated " + campground.name + " campground!");
            res.redirect("/campgrounds/" + req.params.id);
        });
      });
     };
  }

  module.exports.deleteCampground = function(req, res){
    Campground.findByIdAndRemove(req.params.id, function(err, deletedCampground){
      if (err) throw err;
      req.flash("success", "Successfully deleted " + deletedCampground.name + " campground!");
      res.redirect("/campgrounds");
    });
  }