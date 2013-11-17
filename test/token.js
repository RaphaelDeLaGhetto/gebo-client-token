'use strict';

describe('Service: Token', function () {

    var REDIRECT_URI = 'https://capitolhill.ca',
        GEBO_ADDRESS = 'https://theirhost.com',
        CLIENT_ID = 'gebo-client-token@capitolhill.ca',
        CLIENT_NAME = 'gebo-client-token',
        LOCAL_STORAGE_NAME = 'gebo-client-token',
        SCOPES = ['*'],
        ACCESS_TOKEN = '1234';

    var PUT_SUCCESS = { success: true },
        DATA_TO_SAVE = { cat_breath: 'smells like catfood' };

    var VERIFICATION_DATA = {
                _id: '1',
                name: 'dan',
                email: 'dan@email.com',
                admin: false,
            };

    var token,
        $rootScope,
        $httpBackend;
    
    beforeEach(module('gebo-client-token'));

    beforeEach(inject(function(Token, $injector) {
        token = Token;
        $httpBackend = $injector.get('$httpBackend');
        $rootScope = $injector.get('$rootScope');
        $httpBackend.when('GET', 'views/main.html').respond();

        /**
         * localStorage spies
         */
        var store = {};

        spyOn(localStorage, 'getItem').andCallFake(function(key) {
            return store[key];
        });

        spyOn(localStorage, 'setItem').andCallFake(function(key, value) {
            return store[key] = value + '';
        });

        spyOn(localStorage, 'clear').andCallFake(function(key, value) {
            return store = {}; 
        });
        
        spyOn(localStorage, 'removeItem').andCallFake(function(key, value) {
            delete store[key]; 
        });
    }));
        
    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('should do something', function() {
      expect(!!token).toBe(true);
    });
  
    /**
     * getParams
     */
    describe('getParams', function() {
  
        it('should throw an exception if not initialized', function() {
            expect(function() { token.getParams(); }).toThrow(
                    new Error('Token is insufficiently configured. ' +
                            'Please configure the following options: ' +
                            'gebo, redirect, clientId, clientName, localStorageName'));
        });

        it('should return an object if initialized', function() {
            token.setEndpoints({
              gebo: GEBO_ADDRESS,
              redirect: REDIRECT_URI,
              clientId: CLIENT_ID,
              clientName: CLIENT_NAME,
              localStorageName: LOCAL_STORAGE_NAME
            });

            expect(token.getParams()).toEqual({
              response_type: 'token',
              client_id: token.getEndpoints().clientId,
              client_name: token.getEndpoints().clientName,
              redirect_uri: REDIRECT_URI,
              scope: ''
            });
        });
    });

    /**
     * getEndpointUri
     */
    describe('getEndpointUri', function() {
        beforeEach(function() {
            token.setEndpoints({
              gebo: GEBO_ADDRESS,
              redirectUri: REDIRECT_URI,
              scopes: SCOPES
            });
          });

        it('should return a properly endpoint URIs', function() {
            expect(token.getEndpointUri('authorize')).toBe(GEBO_ADDRESS + token.getEndpoints().authorize);
            expect(token.getEndpointUri('verify')).toBe(GEBO_ADDRESS + token.getEndpoints().verify);
            expect(token.getEndpointUri('request')).toBe(GEBO_ADDRESS + token.getEndpoints().request);
            expect(token.getEndpointUri('propose')).toBe(GEBO_ADDRESS + token.getEndpoints().propose);
            expect(token.getEndpointUri('inform')).toBe(GEBO_ADDRESS + token.getEndpoints().inform);
        });

    });

    /**
     * get/set 
     */
    describe('get/set', function() {

        beforeEach(function() {
            token.setEndpoints({
              gebo: GEBO_ADDRESS,
              clientId: token.getEndpoints().clientId,
              redirect: REDIRECT_URI,
              scopes: SCOPES
            });
          });

        it('should return undefined if nothing stored in localStorage', function() {
            expect(token.get()).toBe(undefined);
            expect(localStorage.getItem).toHaveBeenCalled();
        });

        it('should return the value stored in localStorage', function() {
            expect(token.get()).toBe(undefined);
            expect(localStorage.getItem).toHaveBeenCalled();
            token.set('1234');
            expect(localStorage.setItem).toHaveBeenCalled();
            expect(token.get()).toBe('1234');
            expect(localStorage.getItem).toHaveBeenCalled();
        });

        it('should overwrite the value stored in localStorage', function() {
            expect(token.get()).toBe(undefined);
            expect(localStorage.getItem).toHaveBeenCalled();
            token.set('1234');
            expect(localStorage.setItem).toHaveBeenCalled();
            expect(token.get()).toBe('1234');
            expect(localStorage.getItem).toHaveBeenCalled();
            token.set('5678');
            expect(localStorage.setItem).toHaveBeenCalled();
            expect(token.get()).toBe('5678');
            expect(localStorage.getItem).toHaveBeenCalled();
         });

    });

    /**
     * objectToQueryString
     */
    describe('objectToQueryString', function() {
        it('should take an object and spit out a query string', function() {
           var obj = {
                    response_type: "token", 
                    client_id: token.getEndpoints().clientId, 
                    redirect_uri: REDIRECT_URI,
                    scope: SCOPES 
               }; 
           expect(token.objectToQueryString(obj)).toBe(
                                'response_type=token&client_id=' + 
                                encodeURIComponent(token.getEndpoints().clientId) +
                                '&redirect_uri=' + encodeURIComponent(REDIRECT_URI) +
                                '&scope=' + SCOPES);
        });

    }); 

    /**
     * clear
     */
    describe('clear', function() {
        it('should delete the token in localStorage', function() {
            expect(token.get()).toBe(undefined);
            expect(localStorage.getItem).toHaveBeenCalled();
            token.set('1234');
            expect(localStorage.setItem).toHaveBeenCalled();
            expect(token.get()).toBe('1234');
            token.clear();
            expect(localStorage.removeItem).toHaveBeenCalled();
            expect(token.get()).toBe(undefined);
            expect(token.data()).toEqual({});
        });
    });

    /**
     * Configured operations
     */
    describe('Configured operation:', function() {

        var unsavedData,
            savedData,
            expectedUnsavedData;
    
        beforeEach(function() {
            token.setEndpoints({
                  gebo: GEBO_ADDRESS,
                  redirect: REDIRECT_URI,
                  scopes: SCOPES
                });
            token.set(ACCESS_TOKEN);

            unsavedData = angular.copy(DATA_TO_SAVE);

            expectedUnsavedData = angular.copy(unsavedData);
            expectedUnsavedData.access_token = ACCESS_TOKEN;

            savedData = angular.copy(unsavedData);
            savedData.id = 'some mongo id 1234';

            $httpBackend.whenGET(token.getEndpointUri('verify') + 
                    '?access_token=' + ACCESS_TOKEN).respond(VERIFICATION_DATA); 
       });

        /**
         * request
         */
        describe('request', function() {
        
            /**
             * action: ls
             */
            describe('action: ls', function() {

                it('should get the list of documents in the collection', function() {
                    $httpBackend.expectPOST(token.getEndpointUri('request'), {
                            action: 'ls',
                            access_token: ACCESS_TOKEN
                        }).respond([{ _id: '1', name: 'doc 1'},
                                    { _id: '2', name: 'doc 2'}]);

                    var deferred = token.request({ action: 'ls' });
       
                    var _list;
                    deferred.then(function(list) {
                      _list = list; 
                    });
       
                    $httpBackend.flush();
       
                    expect(_list[0]._id).toBe('1');
                    expect(_list[0].name).toBe('doc 1');
                    expect(_list[1]._id).toBe('2');
                    expect(_list[1].name).toBe('doc 2');
                });
             });

            /**
             * action: cp
             */
            describe('action: cp', function() {
                it('should get the requested document from the collection', function() {
                    $httpBackend.expectPOST(token.getEndpointUri('request'), {
                            action: 'cp',
                            id: '1',
                            access_token: ACCESS_TOKEN
                        }).respond(VERIFICATION_DATA);

                     var deferred = token.request({ action: 'cp', id: '1' });
        
                     var _doc;
                     deferred.then(function(doc) {
                       _doc = doc; 
                     });
        
                     $httpBackend.flush();
        
                     expect(_doc._id).toBe('1');
                     expect(_doc.name).toBe('dan');
                     expect(_doc.email).toBe('dan@email.com');
                     expect(_doc.admin).toEqual(false);
                });
            });
        });

        /**
         * verify
         */
        describe('verify', function() {
            it('should return verification data', inject(function($q, $rootScope) {
                $httpBackend.expectGET(token.getEndpointUri('verify') + 
                        '?access_token=' + ACCESS_TOKEN); 
    
                token.verify(ACCESS_TOKEN).
                    then(function(verified) {
                        expect(verified).toEqual(VERIFICATION_DATA);
                      });
    
                $httpBackend.flush();
            }));
    
            it('should save the verification data', inject(function($q, $rootScope) {
                $httpBackend.expectGET(token.getEndpointUri('verify') + 
                        '?access_token=' + ACCESS_TOKEN); 
    
                var deferred = $q.defer();
                token.verify(ACCESS_TOKEN, deferred, function() {
                    var data = token.data();
                    expect(data.name).toEqual(VERIFICATION_DATA.name);
                    expect(data.email).toEqual(VERIFICATION_DATA.email);
                    expect(data.id).toEqual(VERIFICATION_DATA.id);
                    expect(data.scopes).toEqual(VERIFICATION_DATA.scopes);
                });
    
                $httpBackend.flush();
            }));
        });
    });
});
