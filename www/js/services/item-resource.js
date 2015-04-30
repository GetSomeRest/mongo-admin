///////////////////////////////////////////////////////////////////////////////
// Copyright (c) Autodesk, Inc. All rights reserved
// Written by Philippe Leefsma 2015 - ADN/Developer Technical Services
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

angular.module('Autodesk.ADN.MongoAdmin.Service.Resource.Item', [])

.factory('Item', ['$resource', function($resource) {

    var actions = {

        'all':      {method:'GET', isArray:true},
        'get':      {method:'GET'},
        'create':   {method:'POST'},
        'delete':   {method:'DELETE'},
        'update':   {method:'PUT'},
        'query':    {method:'POST', isArray:true, url:'/node/mongo-admin/api/items/query/:collectionName'}
    };

    var Collection = $resource(
        '/node/mongo-admin/api/items/:collectionName/:itemId',
        {
            collectionName: "@collectionName",
            itemId: "@itemId"
        },
        actions);

    return Collection;
}]);

