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
    var _data = {};
    var RESPONSE_TYPE = 'token';
    var REQUIRED_AND_MISSING = {};
    var _endpoint = {
        gebo: REQUIRED_AND_MISSING,
        redirect: REQUIRED_AND_MISSING,
        clientId: REQUIRED_AND_MISSING,
        clientName: REQUIRED_AND_MISSING,
        authorize: '/dialog/authorize',
        verify: '/verify',
        request: '/request',
        propose: '/propose',
        inform: '/inform',
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
      _data = {};
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
        deferred.resolve(response);
      }).error(function (obj, err) {
        deferred.reject(err);
      });
      return deferred.promise;
    };
    function _request(content) {
      var deferred = $q.defer();
      content.access_token = _get();
      $http.defaults.headers.common['Content-Type'] = 'application/x-www-form-urlencoded';
      $http.post(_getEndpointUri('request'), content).success(function (response) {
        deferred.resolve(response);
      }).error(function (obj, err) {
        deferred.reject(err);
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
    return {
      clear: _clear,
      data: function () {
        return _data;
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
      verify: _verify,
      request: _request,
      set: _set,
      setEndpoints: _setEndpoints
    };
  }
]);