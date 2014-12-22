'use strict';

var Bluebird = require('bluebird');


var dumpCallInfo = function(callInfo){
    var firstCall = callInfo[0].callTime.getTime();
    var prevCall = callInfo[0].callTime.getTime();
    callInfo.forEach(function(call){
        var ct = call.callTime.getTime();
        console.log('call: %d  [time: %d] delta first call: %d   delta prev call: %d', call.callNumber, ct, ct-firstCall, ct-prevCall);
        prevCall = ct;
    });
}

var createApi = function(apiCallback){

    var callNumber = 0;
    var callInfo = [];

    var apiCall = function(apiArg){

        var ci = {
            callTime: new Date(),
            callNumber: ++callNumber
        };
        callInfo.push(ci);

        return apiCallback(apiArg, callNumber);
        //var preApiCallDelay = Math.floor(Math.random() * 300) + 50;
        //return Bluebird.delay(preApiCallDelay)
        //    .then(function(){
        //        return apiCallback(apiArg, callNumber);
        //    });
    };

    apiCall.callInfo = callInfo;
    apiCall.dumpCallInfo = function(){
        return dumpCallInfo(callInfo);
    };

    return apiCall;
};


var pagedApiCallback = function(apiArg, callNumber) {
    console.log('   pagedApi apiArg', apiArg);
    console.log('   pagedApi callNumber', callNumber);

    var ret = {};
    var apiDelay = Math.floor(Math.random() * 1800) + 200;
    if(callNumber <= 10){
        ret = {
            widgets: [],
            apiDelay: apiDelay,
            page: apiArg,
            total: 10
        };
    }
    //setTimeout(function(){
    //    return ret;
    //}, apiDelay);
    return Bluebird.delay(apiDelay)
        .then(function(){
            return ret;
        });
};



exports.createApi = createApi;

exports.pagedApi = createApi(pagedApiCallback);
