'use strict';

var Bluebird = require('bluebird');
var mockApi = require('../common/mockApi');

// Problem:
//  Specific:
//      You have an API that is paged, and you want to iterate through all of the items in order. For instance:
//          foo.api.com/jobs?pg=N => return { jobs: [], page: N, totalPages: M }
//          foo.api.com/jobs?pg=M+1 => ????
//      After each API call, we want to save the data (another async operation)
//      Oh, and we have to throttle our calls, 1 every 15 seconds. ;-)
//  General:
//      We want to sequentially loop through an async api (ONE), and perform another async operation (TWO) after each call,
//      and we want to cancel the operation when the API call fails.
//





var internals = {}

internals.callKnownTimes = function(){

    console.log('Calls the api a known number of times (3)...');
    console.log('Calling One...');

    var pageNumber = 0;
    return mockApi.pagedApi(++pageNumber)
        .then(function(){
            console.log('Calling Two...');
            return mockApi.pagedApi(++pageNumber);
        })
        .then(function(){
            console.log('Calling Three...');
            return mockApi.pagedApi(++pageNumber);
        })
        .then(function(){
            console.log('Called the api %d times',pageNumber);
            mockApi.pagedApi.dumpCallInfo();
        });

};

internals.callParallel = function(){

    console.log('Calls the api in a while loop checking returns to see if should call again...');

    var promises = [];
    for(var i = 0; i < 20; i++){
        promises.push(mockApi.pagedApi(i));
    }
    Bluebird.all(promises)
        .then(function(){
            mockApi.pagedApi.dumpCallInfo();
        });


};


internals.callWithWhileLoop = function(){

    console.log('Calls the api in a while loop checking returns to see if should call again...');

    var callAndCheckApiReturn = function(pageNum){
        return mockApi.pagedApi(pageNum)
            .then(function(results){
                console.log('\n - Call %d returned: ', pageNum, results);
                //console.log('\n - Call %d returned: %s', pageNum, JSON.stringify(results));
                return results;
            })
            .then(function(results){
                if(results.page < results.total){
                    console.log(' - page < total. calling again!');
                    return callAndCheckApiReturn(++pageNum);
                }
                console.log('All done (page = total)');
                return;
            })
    }

    callAndCheckApiReturn(1)
        .then(function(results){
            mockApi.pagedApi.dumpCallInfo();
        });
};

//internals.callKnownTimes();
//internals.callParallel();
internals.callWithWhileLoop();