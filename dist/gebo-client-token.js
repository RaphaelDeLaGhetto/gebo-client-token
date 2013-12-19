;
(function () {
  'use strict';
  angular.module('gebo-client-token', [
    'ngRoute',
    'ngResource'
  ]).factory('Token', [
    '$http',
    '$q',
    '$window',
    '$rootScope',
    '$resource',
    '$filter',
    function ($http, $q, $window, $rootScope, $resource, $filter) {
      var _agent = {};
      var RESPONSE_TYPE = 'token';
      var REQUIRED_AND_MISSING = {};
      var _endpoint = {
          gebo: REQUIRED_AND_MISSING,
          redirect: REQUIRED_AND_MISSING,
          clientId: REQUIRED_AND_MISSING,
          clientName: REQUIRED_AND_MISSING,
          authorize: '/dialog/authorize',
          verify: '/verify',
          perform: '/perform',
          send: '/send',
          localStorageName: REQUIRED_AND_MISSING,
          scopes: ''
        };
      var _getParams = function () {
        var requiredAndMissing = [];
        angular.forEach(_endpoint, function (value, key) {
          if (value === REQUIRED_AND_MISSING || value === undefined) {
            requiredAndMissing.push(key);
          }
        });
        if (requiredAndMissing.length) {
          throw new Error('Token is insufficiently configured. Please ' + 'configure the following options: ' + requiredAndMissing.join(', '));
        }
        return {
          response_type: RESPONSE_TYPE,
          client_id: _endpoint.clientId,
          client_name: _endpoint.clientName,
          redirect_uri: _endpoint.redirect,
          scope: _endpoint.scopes
        };
      };
      var _setEndpoints = function (endpoint) {
        _endpoint = angular.extend(_endpoint, endpoint);
      };
      var _get = function () {
        return localStorage.getItem(_endpoint.localStorageName);
      };
      var _set = function (accessToken) {
        localStorage.setItem(_endpoint.localStorageName, accessToken);
      };
      var _clear = function () {
        _agent = {};
        localStorage.removeItem(_endpoint.localStorageName);
      };
      var _getTokenByPopup = function (extraParams, popupOptions) {
        popupOptions = angular.extend({
          name: 'AuthPopup',
          openParams: {
            width: 650,
            height: 300,
            resizable: true,
            scrollbars: true,
            status: true
          }
        }, popupOptions);
        var deferred = $q.defer(), params = angular.extend(_getParams(), extraParams), url = _getEndpointUri('authorize') + '?' + _objectToQueryString(params);
        var formatPopupOptions = function (options) {
          var pairs = [];
          angular.forEach(options, function (value, key) {
            if (value || value === 0) {
              value = value === true ? 'yes' : value;
              pairs.push(key + '=' + value);
            }
          });
          return pairs.join(',');
        };
        var popup = window.open(url, popupOptions.name, formatPopupOptions(popupOptions.openParams));
        angular.element($window).bind('message', function (event) {
          if (event.source === popup && event.origin === window.location.origin) {
            $rootScope.$apply(function () {
              if (event.data.access_token) {
                deferred.resolve(event.data);
              } else {
                deferred.reject(event.data);
              }
            });
          }
        });
        return deferred.promise;
      };
      var _objectToQueryString = function (obj) {
        var str = [];
        angular.forEach(obj, function (value, key) {
          str.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
        });
        return str.join('&');
      };
      var _verify = function (accessToken) {
        var deferred = $q.defer();
        $http.get(_getEndpointUri('verify') + '?access_token=' + accessToken).success(function (response) {
          _agent = response;
          deferred.resolve(response);
        }).error(function (obj, err) {
          deferred.reject(err);
        });
        return deferred.promise;
      };
      function _perform(content) {
        var deferred = $q.defer();
        if (content instanceof FormData) {
          content.append('access_token', _get());
          $http.defaults.headers.common['Content-Type'] = undefined;
          $http.defaults.transformRequest = angular.identity;
        } else {
          content.access_token = _get();
          $http.defaults.headers.common['Content-Type'] = 'application/x-www-form-urlencoded';
        }
        $http.post(_getEndpointUri('perform'), content).success(function (response) {
          deferred.resolve(response);
        }).error(function (obj, err) {
          deferred.reject({
            code: err,
            message: obj
          });
        });
        return deferred.promise;
      }
      ;
      function _formEncode(obj) {
        var jsonString = '';
        for (var key in obj) {
          if (jsonString.length !== 0) {
            jsonString += '&';
          }
          jsonString += key + '=' + $filter('json')(obj[key]);
        }
        return jsonString;
      }
      function _getEndpointUri(endpoint) {
        return _endpoint.gebo + _endpoint[endpoint];
      }
      function _send(message) {
        var deferred = $q.defer();
        message.access_token = _get();
        $http.defaults.headers.common['Content-Type'] = 'application/x-www-form-urlencoded';
        $http.post(_getEndpointUri('send'), message).success(function (response) {
          deferred.resolve(response);
        }).error(function (obj, err) {
          deferred.reject(err);
        });
        return deferred.promise;
      }
      return {
        clear: _clear,
        agent: function () {
          return _agent;
        },
        formEncode: _formEncode,
        get: _get,
        getEndpoints: function () {
          return _endpoint;
        },
        getEndpointUri: _getEndpointUri,
        getParams: _getParams,
        getTokenByPopup: _getTokenByPopup,
        objectToQueryString: _objectToQueryString,
        perform: _perform,
        verify: _verify,
        send: _send,
        set: _set,
        setEndpoints: _setEndpoints
      };
    }
  ]);
}());
;
(function (window) {
  'use strict';
  angular.module('gebo-client-token').controller('CallbackCtrl', [
    '$scope',
    '$location',
    function ($scope, $location) {
      function parseKeyValue(queryString) {
        var obj = {}, key_value, key;
        angular.forEach((queryString || '').split('&'), function (queryString) {
          if (queryString) {
            key_value = queryString.split('=');
            key = decodeURIComponent(key_value[0]);
            obj[key] = angular.isDefined(key_value[1]) ? decodeURIComponent(key_value[1]) : true;
          }
        });
        return obj;
      }
      var queryString = $location.path().substring(1);
      var params = parseKeyValue(queryString);
      window.opener.postMessage(params, '*');
      window.close();
    }
  ]);
}(window));