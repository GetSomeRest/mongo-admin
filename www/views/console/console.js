/////////////////////////////////////////////////////////////////////////////////
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
/////////////////////////////////////////////////////////////////////////////////
angular.module('Autodesk.ADN.MongoAdmin.View.Console',
  [
    'ngRoute',
    'treeControl',
    'ngSanitize',
    'ui.select',
    'Autodesk.ADN.MongoAdmin.Dialog.JsonEditor',
    'Autodesk.ADN.MongoAdmin.Service.Resource.Collection',
    'Autodesk.ADN.MongoAdmin.Service.Resource.Item'
  ])

  ///////////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////////
  .config(['$routeProvider',

    function($routeProvider) {

      $routeProvider.when('/console', {
        templateUrl: './views/console/console.html',
        controller: 'Autodesk.ADN.MongoAdmin.View.Console.Controller'
      });
    }])

  ///////////////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////////////
  .controller('Autodesk.ADN.MongoAdmin.View.Console.Controller',

    ['$scope', '$sce', 'Collection', 'Item',

      function ($scope, $sce, Collection, Item) {

      ///////////////////////////////////////////////////////////////////////
      //
      //
      ///////////////////////////////////////////////////////////////////////
      $scope.$parent.activeView = 'console';

      $scope.filterCaption = "Activate";

      $scope.filterActivated = false;

      $scope.filterValue = null;

      $scope.collectionsMap = {};

      $scope.collections = [];

      $scope.treeNodes = [];

      $scope.expandedNodes = [];

      $scope.dropTreeNodes = [];

      $scope.dropExpandedNodes = [];

      $scope.treeOptions = {

        multiSelection: true,
        nodeChildren: "children",
        dirSelectable: true,

        injectClasses: {
          "ul": "c-ul",
          "li": "c-li",
          "liSelected": "c-liSelected",
          "iExpanded": "c-iExpanded",
          "iCollapsed": "c-iCollapsed",
          "iLeaf": "c-iLeaf",
          "label": "c-label",
          "labelSelected": "c-labelSelected"
        }
      }

      var dropTreeNodesSelected = {};

      var treeNodesSelected = {};

      ///////////////////////////////////////////////////////////////////////
      //
      //
      ///////////////////////////////////////////////////////////////////////
      $scope.activateFilter = function () {

        $scope.filterActivated = !$scope.filterActivated;

        $scope.filterCaption = ($scope.filterActivated ?
          "Deactivate" : "Activate" );
      }

      ///////////////////////////////////////////////////////////////////////
      //
      //
      ///////////////////////////////////////////////////////////////////////
      $scope.nodeFilter = function (node) {

        var regExp = new RegExp($scope.filterValue, 'i');

        var res = !$scope.filterActivated ||
          !$scope.filterValue ||
          !node.parent ||
          regExp.test(node.label) ||
          regExp.test(node.value);

        node.children.forEach(function(child) {

          res = res || $scope.nodeFilter(child);

        });

        return res;
      };

      ///////////////////////////////////////////////////////////////////////
      //
      //
      ///////////////////////////////////////////////////////////////////////
      $scope.onNodeSelected = function (node, selected) {

        node.selected = selected && node.selectable;

        if(node.selected) {

          treeNodesSelected[node.id] = node;
        }
        else {

          delete treeNodesSelected[node.id];
        }
      }

      $scope.onDropNodeSelected = function (node, selected) {

        node.selected = selected && node.selectable;

        if(node.selected) {

          dropTreeNodesSelected[node.id] = node;
        }
        else {

          delete dropTreeNodesSelected[node.id];
        }
      }

      ///////////////////////////////////////////////////////////////////////
      //
      //
      ///////////////////////////////////////////////////////////////////////
      $scope.addCollection = function () {

        var collectionName = $('#newColName').val();

        if(collectionName.length){

          Collection.create(
            {collectionName: collectionName},
            {collectionName: collectionName}
          )
          .$promise.then(
            //success
            function(value){
             console.log(value);
             $('#newColName').val('');
              $scope.collections.push({
                name: collectionName,
                label: $sce.trustAsHtml(collectionName)
              });
            },
            //error
            function(error){
              console.log("error creating collection: ");
              console.log(error);
            }
          );
        }
      }

      ///////////////////////////////////////////////////////////////////////
      //
      //
      ///////////////////////////////////////////////////////////////////////
      $scope.sendQuery = function () {

        if(!$scope.collection.selected)
          return;

        var collectionName = $scope.collection.selected.name;

        var queryStr = $('#queryValue').val();

        if(queryStr.length){

          try {

            var query = JSON.parse(queryStr);

            Item.query(
              {collectionName: collectionName},
              {query: query}
            )
              .$promise.then(
              //success
              function(items){

                var collectionNode = $scope.treeNodes[0];

                collectionNode.children = [];

                items.forEach(function(item) {

                  var node = objectToTreeNode(
                    item,
                    item._id,
                    collectionNode);

                  node.selectable = true;
                });
              },
              //error
              function(error){
                console.log("error performing query: ");
                console.log(error);
              }
            );
          }
          catch (ex) {

            console.log(ex);
          }
        }
      }

      ///////////////////////////////////////////////////////////////////////
      //
      //
      ///////////////////////////////////////////////////////////////////////
      $scope.onDblClick = function() {

        var queryStr = $('#queryValue').val();

        try {

          var query = JSON.parse(queryStr);

          $scope.$broadcast('edit-query', {
            query: query
          });
        }
        catch (ex) {

          $scope.$broadcast('edit-query', {
            query: {}
          });
          }
      }

      ///////////////////////////////////////////////////////////////////////
      //
      //
      ///////////////////////////////////////////////////////////////////////
      $scope.$on('query-edited',

        function (event, data) {

          try {

            var queryStr = JSON.stringify(data.query);

            if(queryStr !== "{}")
              $('#queryValue').val(queryStr);
          }
          catch (ex) {

          }
        });

      ///////////////////////////////////////////////////////////////////////
      //
      //
      ///////////////////////////////////////////////////////////////////////
      function newGUID() {

        var d = new Date().getTime();

        var uuid = 'xxxx-xxxx-xxxx-xxxx-xxxx'.replace(
          /[xy]/g,
          function (c) {
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
          });

        return uuid;
      };

      ///////////////////////////////////////////////////////////////////////
      //
      //
      ///////////////////////////////////////////////////////////////////////
      function createNode(label, value, item, parent) {

        var node = {
          id: newGUID(),
          label: label,
          value: value,
          children: [],
          parent: parent,
          item: item,
          selectable: false
        }

        if (parent)
          parent.children.push(node);

        return node;
      }

      ///////////////////////////////////////////////////////////////////////
      //
      //
      ///////////////////////////////////////////////////////////////////////
      $scope.clearDrop = function () {

        $scope.dropMessage = "Drag and drop .json file to import...";
        $scope.dropTreeNodes = [];
      }

      ///////////////////////////////////////////////////////////////////////
      //
      //
      ///////////////////////////////////////////////////////////////////////
      function loadCollections() {

        $scope.collections = [];

        Collection.all(function(collections) {

            collections.forEach(function(collection){

              if(collection.name !== 'system.indexes') {

                collection.label = $sce.trustAsHtml(collection.name);

                $scope.collections.push(collection);
              }
            });
          }
        );
      }

      ////////////////////////////////////////////////
      // watch selected collection
      //
      ////////////////////////////////////////////////
      $scope.collection = {};

      $scope.$watch('collection.selected', function() {

        if($scope.collection.selected) {

          loadItems($scope.collection.selected.name);
        }
      });

      ///////////////////////////////////////////////////////////////////////
      //
      //
      ///////////////////////////////////////////////////////////////////////
      function loadItems(collectionName) {

        $scope.treeNodes = [];

        var collectionNode = createNode(collectionName);

        Item.all({collectionName: collectionName}, function(items) {

          items.forEach(function(item){

            var itemNode = objectToTreeNode(
              item,
              item._id,
              collectionNode);

            itemNode.selectable = true;
          });

          $scope.expandedNodes = [collectionNode];
        });

        $scope.treeNodes.push(collectionNode);
      }

      ///////////////////////////////////////////////////////////////////////
      //
      //
      ///////////////////////////////////////////////////////////////////////
      function initializeSelect(collections) {

        $('#collection-select').append(
          '<option value=' + '**none**' + '>' +
          '* none *' +
          '</option>');

        collections.forEach(function(collection) {

          $('#collection-select').append(
            '<option value=' + collection.name + '>' +
              collection.name +
            '</option>');
        });

        $('#collection-select').multiselect({

          onChange: function (option, checked, select) {

            if(option.context.value !== '**none**') {

              loadItems(option.context.value);
            }
          }
        });
      }

      ///////////////////////////////////////////////////////////////////////
      //
      //
      ///////////////////////////////////////////////////////////////////////
      function objectToTreeNode(obj, label, parent) {

        var objNode = createNode(label, '', obj, parent);

        if(Array.isArray(obj)) {

          obj.forEach(function(item, idx) {

            objectToTreeNode(item, 'Item [' + idx + ']' , objNode);
          });
        }

        else {

          for (var prop in obj) {

            propToTreeNode(prop, obj, objNode);
          }
        }

        return objNode;
      }

      ///////////////////////////////////////////////////////////////////////
      //
      //
      ///////////////////////////////////////////////////////////////////////
      function propToTreeNode(prop, obj, parent) {

        if(prop === '$promise' ||
           prop === '$resolved') {

          return null;
        }

        switch(typeof obj[prop]) {

          case 'object':

            var label = prop.toString();

            return objectToTreeNode(obj[prop], label, parent);

          case 'function':
            break;

          case 'undefined':
            break;

          default :

            var label = prop.toString() + ': ';

            var value = obj[prop].toString();

            return createNode(label, value, null, parent);
        }

        return null;
      }

      ///////////////////////////////////////////////////////////////////////
      //
      //
      ///////////////////////////////////////////////////////////////////////
      var dropzone = document.getElementById('dropzone');

      dropzone.addEventListener('dragover', function (e) {
        e.preventDefault();
        e.currentTarget.classList.add('over-line');
      });

      dropzone.addEventListener('dragleave', function (e) {
        e.preventDefault();
        e.currentTarget.classList.remove('over-line');
      });

      dropzone.addEventListener('drop', function (e) {

        e.stopPropagation();
        e.preventDefault();

        var file = e.dataTransfer.files[0];

        var splits = file.name.split('.');

        if (splits[splits.length - 1] == 'json') {

          var reader = new FileReader();

          reader.onload = function (event) {

            var content = JSON.parse(event.target.result);

            $scope.dropTreeNodes = [];

            var dropNode = objectToTreeNode(content, splits[0]);

            dropNode.children.forEach(function(node) {

              node.selectable = true;

            });

            $scope.dropTreeNodes.push(dropNode);

            $scope.dropExpandedNodes = [dropNode];

            $scope.dropMessage = '';
          };

          reader.onerror = function (event) {
            alert('Cannot read file!');
          };

          reader.readAsText(file);
        }

        e.currentTarget.classList.remove('over-line');
      });

      ///////////////////////////////////////////////////////////////////////
      //
      //
      ///////////////////////////////////////////////////////////////////////
      function initializeContextMenu() {

        $.contextMenu({

          selector: "#dropzone",

          items: {

            insertSelected: {
              name: "Insert selected", callback: onInsertSelected, icon: "copy"
            },

            "sep1": "---------",

            insertAll: {
              name: "Insert all", callback: onInsertAll, icon: "copy"
            }
          }
        });

        $.contextMenu({

          selector: "#itemsId",

          build: function($trigger, e) {

            var items = {};

            var nbSelected = Object.keys(treeNodesSelected).length;

            if(nbSelected === 1) {

              items.edit = {
                name: "Edit selected", callback: onEditItem, icon: "edit"
              };

              items.sep1 = "---------";
            }

            if(nbSelected) {

              items.deleteSelected = {
                name: "Delete selected", callback: onDeleteItems, icon: "delete"
              };

              items.sep2 = "---------";
            }

            if($scope.collection.selected) {

              items.deleteCollection = {
                name: "Delete collection", callback: onDeleteCollection, icon: "delete"
              };
            }

            return {
              callback: function(key, options) {

              },
              items: items
            };
          }
        });
      }

      ///////////////////////////////////////////////////////////////////////
      //
      //
      ///////////////////////////////////////////////////////////////////////
      function onEditItem(key, opt) {

        var id = Object.keys(treeNodesSelected)[0];

        var node = treeNodesSelected[id];

        $scope.$broadcast('edit-item', {
          node: node
        });
      }

      ///////////////////////////////////////////////////////////////////////
      //
      //
      ///////////////////////////////////////////////////////////////////////
      $scope.$on('item-edited',

        function (event, data) {

          var collectionName = $scope.collection.selected.name;

          Item.update(
            {collectionName: collectionName},
            {item: data.node.item}
          )
            .$promise.then(
            //success
            function(response){

              if(response.nModified === 1) {

                data.node.children = [];

                for (var prop in  data.node.item) {

                  propToTreeNode(prop,  data.node.item, data.node);
                }
              }
            },
            //error
            function(error){
              console.log("Error updating item: ");
              console.log(error);
            }
          );
        });

      ///////////////////////////////////////////////////////////////////////
      //
      //
      ///////////////////////////////////////////////////////////////////////
      function insertItem(collectionName, item) {

        Item.create(
          {collectionName: collectionName},
          {item: item}
        )
        .$promise.then(
          //success
          function(response){

            var itemNode = objectToTreeNode(
              item,
              item._id,
              $scope.treeNodes[0]);

            itemNode.selectable = true;
          },
          //error
          function(error){
            console.log("Error inserting item: ");
            console.log(error);
          }
        );
      }

      ///////////////////////////////////////////////////////////////////////
      //
      //
      ///////////////////////////////////////////////////////////////////////
      function onInsertAll(key, opt) {

        var collectionName = $scope.treeNodes[0].label;

        $scope.dropTreeNodes[0].children.forEach(function(node) {

          insertItem(collectionName, node.item);
        });
      }

      ///////////////////////////////////////////////////////////////////////
      //
      //
      ///////////////////////////////////////////////////////////////////////
      function onInsertSelected(key, opt) {

        var collectionName = $scope.treeNodes[0].label;

        for(var id in dropTreeNodesSelected) {

          var node = dropTreeNodesSelected[id];

          insertItem(collectionName, node.item);
        }
      }

      ///////////////////////////////////////////////////////////////////////
      //
      //
      ///////////////////////////////////////////////////////////////////////
      function onDeleteItems (key, opt) {

        var collectionName = $scope.treeNodes[0].label;

        var ids = Object.keys(treeNodesSelected);

        async.each(ids,

          function (id, callback) {

            var node = treeNodesSelected[id];

            Item.delete(
              {
                collectionName: collectionName,
                itemId:node.item._id
              },
              {item: node.item}
            )
            .$promise.then(
              //success
              function(value){
                delete treeNodesSelected[node.id];
                callback();
              },
              //error
              function(error){
                console.log("Error removing item: ");
                console.log(error);
                callback();
              }
            );
          },
          function (err) {

            loadItems(collectionName);
          });
      }

      ///////////////////////////////////////////////////////////////////////
      //
      //
      ///////////////////////////////////////////////////////////////////////
      function onDeleteCollection (key, opt) {

        var collectionName = $scope.treeNodes[0].label;

        Collection.delete(
          {collectionName: collectionName}
        )
        .$promise.then(
          //success
          function(response){

            $scope.collection = {};

            //removes collection from $scope.collections array
            for(var i=0; i<$scope.collections.length; ++i) {

                if(collectionName === $scope.collections[i].name){

                  $scope.collections.splice(i, 1);
                  break;
                }
            };

            $scope.treeNodes = [];

            treeNodesSelected = {};
          },
          //error
          function(error){
            console.log("Error deleting collection: ");
            console.log(error);
          }
        );
      }

      ///////////////////////////////////////////////////////////////////////
      //
      //
      ///////////////////////////////////////////////////////////////////////
      function initialize() {

        $scope.clearDrop();

        loadCollections();

        initializeContextMenu();
      }

      initialize();
  }]);