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
router.get('/', function (req, res) {

  var cursor = db.listCollections();

  cursor.toArray(function(err, collections) {

    res.json(collections);
  });
});

////////////////////////////////////////////////////////////////
//
//
////////////////////////////////////////////////////////////////
router.post('/:collectionName', function (req, res) {

  var collectionName = req.body.collectionName;

  db.createCollection(collectionName, function(error, collection) {

    if(error && collectionName) {
      res.status(400);
      res.json(error);
    }
    else {
      res.json({collection:collectionName});
    }
  });
});

////////////////////////////////////////////////////////////////
//
//
////////////////////////////////////////////////////////////////
router.delete('/:collectionName', function (req, res) {

  var collectionName = req.params.collectionName;

  db.collection(collectionName, function (errCol, collection) {

    collection.drop(function (errDrop, result) {

      if(errDrop) {

        res.status(400);
        res.json(errDrop);
      }
      else {

        res.json(result);
      }
    });
  });
});

module.exports = router;