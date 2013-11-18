gebo-client-token
=================

The client-side gebo OAuth2 AngularJS token service

## Install

```
% bower install gebo-client-token --save
```

## Point your app to its location:

The following will, of course, vary by project

### On page load (e.g., index.html)

```
<script src="components/gebo-client-token/dist/gebo-client-token.min.js"></script>
```

### Inject into the app (e.g., app.js)

```
angular.module('geboRegistrantHaiApp', ['ngRoute', 'gebo-client-token']).
    config(function ($routeProvider) {
        $routeProvider.
            when('/', {
                templateUrl: 'views/main.html',
                controller: 'MainCtrl'
              })
            .otherwise({
                redirectTo: '/'
              });
      });
```

### Unit tests (e.g., karma.conf.js)

```
files = [
    JASMINE,
    JASMINE_ADAPTER,
    'app/components/angular/angular.js',
    'app/components/angular-mocks/angular-mocks.js',
    'app/components/angular-resource/angular-resource.js',
    'app/components/angular-route/angular-route.js',
    'app/components/gebo-client-token/dist/gebo-client-token.min.js',
    'app/scripts/*.js',
    'app/scripts/**/*.js',
    'test/mock/**/*.js',
    'test/spec/**/*.js'
  ];
```
                                                                    
## Configure the token (e.g., in main.js)

```
angular.module('myApp')
    .controller('MainCtrl', function ($scope, Token) { 
        var baseUrl = window.location.origin;
                
        Token.setEndpoints({
            clientId: 'gebo-registrant-hai@capitolhill.ca',
            clientName: 'some-gebo-hai',
            gebo: 'https://localhost:3443', 
            localStorageName: 'some-gebo-hai-token',
            redirect: baseUrl + '/components/gebo-client-token/dist/oauth2callback.html',
        }); 
}); 

```

