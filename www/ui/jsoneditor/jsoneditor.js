///////////////////////////////////////////////////////////////////////////////
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
///////////////////////////////////////////////////////////////////////////////
'use strict';

///////////////////////////////////////////////////////////////////////////////
//
//
///////////////////////////////////////////////////////////////////////////////
angular.module('Autodesk.ADN.MongoAdmin.Dialog.JsonEditor',
    [

    ])

    ///////////////////////////////////////////////////////////////////////////
    //
    //
    ///////////////////////////////////////////////////////////////////////////
    .controller('Autodesk.ADN.MongoAdmin.Dialog.JsonEditor.Controller',

    function($scope) {

        var container = document.getElementById("jsonEditor");

        var editor = new JSONEditor(container);

        ///////////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////////
        $scope.$on('edit-query',

          function (event, data) {

              $scope.caption = "Edit Mongo Query";

              editor.set(data.query);

              $('#jsonEditorDlg').modal('show');

              $scope.onOk = function() {

                  $scope.$emit('query-edited', {
                      query: editor.get()
                  });
              };
          });

        ///////////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////////
        $scope.$on('edit-item',

          function (event, data) {

              var editedNode = data.node;

              var editedItemId = data.node.item._id;

              $scope.caption = "Edit Item [" + editedItemId + "]";

              delete editedNode.item._id;

              editor.set(editedNode.item);

              $('#jsonEditorDlg').modal('show');

              $scope.onOk = function() {

                  editedNode.item = editor.get();

                  editedNode.item._id = editedItemId;

                  $scope.$emit('item-edited', {

                      node: editedNode
                  });
              };
          });

        ///////////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////////
        $scope.onCancel = function() {

        }
    });