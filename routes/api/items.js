////////////////////////////////////////////////////////////////////
// Copyright (c) Autodesk, Inc. All rights reserved
// Written by Philippe Leefsma 2014 - ADN/Developer Technical Services
//
// Permission to use, copy, modify, and distribute this software in
// object code form for any purpose and without fee is hereby granted,
// provided that the above copyright notice appears in all copies and
// that both that copyright notice and the limited warranty and
// restricted rights notice below appear in all supporting
// documentation.
//
// AUTODESK PROVIDES THIS PROGRAM "AS IS" AND WITH ALL FAULTS.
// AUTODESK SPECIFICALLY DISCLAIMS ANY IMPLIED WARRANTY OF
// MERCHANTABILITY OR FITNESS FOR A PARTICULAR USE.  AUTODESK, INC.
// DOES NOT WARRANT THAT THE OPERATION OF THE PROGRAM WILL BE
// UNINTERRUPTED OR ERROR FREE.
////////////////////////////////////////////////////////////////////
var dbConnector = require('../../dbConnector');
var config = require('../../config-server');
var express = require('express');
var mongo = require('mongodb');

var router = express.Router();

var db = null;

////////////////////////////////////////////////////////////////
//
//
////////////////////////////////////////////////////////////////
dbConnector.initializeDb(config,

  function(databse){
    db = databse;
  },

  function(error){
    console.log(error);
  });

////////////////////////////////////////////////////////////////
//
//
////////////////////////////////////////////////////////////////
router.get('/:collectionName', function (req, res) {

  var collectionName = req.params.collectionName;

  var pageQuery = {};

  var fieldQuery = {};

  if (typeof req.query.skip !== 'undefined')
    pageQuery.skip = req.query.skip;

  if (typeof req.query.limit !== 'undefined')
    pageQuery.limit = req.query.limit;

  if (typeof req.query.field !== 'undefined' &&
    typeof req.query.value !== 'undefined') {

    var field = req.query.field;

    var value = req.query.value;

    //case insensitive search
    var exp = ["^", value, "$"].join("");

    fieldQuery[field] = new RegExp(exp, "i");
  }

  db.collection(collectionName, function (colErr, collection) {

    collection.find(fieldQuery, pageQuery)
      .sort({ name: 1 }).toArray(

      function (error, items) {

        var response = (items ? items : []);

        res.json(response);
      });
  });
});

////////////////////////////////////////////////////////////////
//
//
////////////////////////////////////////////////////////////////
router.post('/query/:collectionName', function (req, res) {

  var collectionName = req.params.collectionName;

  var query = req.body.query;

  db.collection(collectionName, function (colErr, collection) {

    collection.find(query).toArray(

      function (error, items) {

        var response = (items ? items : []);

        res.json(response);
      });
  });
});

////////////////////////////////////////////////////////////////
//
//
////////////////////////////////////////////////////////////////
router.get('/:collectionName/:itemId', function (req, res) {

  var collectionName = req.params.collectionName;

  var itemId = req.params.itemId;

  db.collection(collectionName, function (colErr, collection) {

      collection.findOne(

        { '_id': new mongo.ObjectID(itemId)},

        function (error, item) {

          if (error) {

            res.status(400);
            res.json(error);
          }
          else {

            res.json(item);
          }
        });
    });
});

///////////////////////////////////////////////////////////////////////////////
//
//
///////////////////////////////////////////////////////////////////////////////
router.post('/:collectionName', function (req, res) {

  var collectionName = req.params.collectionName;

  var item = req.body.item;

  if(typeof item._id !== 'undefined') {
    item._id = new mongo.ObjectID(item._id);
  }

  db.collection(collectionName, function (colError, collection) {

    collection.insert(
      item,
      {safe: true},

      function (error, result) {

        if (error) {

          res.status(400);
          res.json(error);
        }
        else {

          res.json(item);
        }
      });
  });
});

///////////////////////////////////////////////////////////////////////////////
//
//
///////////////////////////////////////////////////////////////////////////////
router.put('/:collectionName', function (req, res) {

  var collectionName = req.params.collectionName;

  var item = req.body.item;

  if(typeof item._id !== 'undefined') {
    item._id = new mongo.ObjectID(item._id);
  }

  db.collection(collectionName, function (colError, collection) {

    collection.update(
      { _id: new mongo.ObjectID(item._id) },
      item,

      function (error, result) {

        if (error) {

          res.status(400);
          res.json(error);
        }
        else {

          res.json(result);
        }
      });
  });
});

///////////////////////////////////////////////////////////////////////////////
//
//
///////////////////////////////////////////////////////////////////////////////
router.delete('/:collectionName/:itemId', function (req, res) {

  var collectionName = req.params.collectionName;

  var itemId = req.params.itemId;

  db.collection(collectionName, function (colErr, collection) {

    collection.remove(
      { _id: new mongo.ObjectID(itemId) },
      null,
      function (error, result) {

        if (error) {

          res.status(400);
          res.json(error);
        }
        else {

          res.json(result);
        }
      }
    );
  });
});

module.exports = router;