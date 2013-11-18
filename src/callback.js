;(function(window) {
'use strict';

angular.module('gebo-client-token')
  .controller('CallbackCtrl', function ($scope, $location) {

    /**
     * Parses an escaped url query string into key-value pairs.
     *
     * (Copied from Angular.js in the AngularJS project.)
     *
     * @param string
     *
     * @returns Object.<(string|boolean)>
     */
    function parseKeyValue(queryString) {
      var obj = {}, key_value, key;
      angular.forEach((queryString || '').split('&'), function(queryString){
        if (queryString) {
          key_value = queryString.split('=');
          key = decodeURIComponent(key_value[0]);
          obj[key] = angular.isDefined(key_value[1]) ? decodeURIComponent(key_value[1]) : true;
        }
      });
      return obj;
    }

    var queryString = $location.path().substring(1);  // preceding slash omitted
    var params = parseKeyValue(queryString);

    // TODO: The target origin should be set to an explicit origin.  Otherwise, 
    //       a malicious site that can receive the token if it manages to change
    //       the location of the parent. (See:
    //       https://developer.mozilla.org/en/docs/DOM/window.postMessage#Security_concerns)

    window.opener.postMessage(params, '*');
    window.close();
  });
}(window));
