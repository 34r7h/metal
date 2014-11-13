(function() {
  'use strict';
  var app = angular.module('app', [
	  'ngSanitize',
	  'ngRoute',
	  'ngAnimate',
	  'ui.bootstrap',
	  'ui.router',
	  'easypiechart',
	  'textAngular',
	  'ngTagsInput',
	  'app.controllers',
	  'app.services',
	  'app.directives',
	  'app.localization',
	  'app.nav',
      'scrollSectionLoader',
	  'akoenig.deckgrid',
      'uploader']);
	app
		.config([
    '$controllerProvider','$stateProvider', '$urlRouterProvider', 'AWSControlProvider', '$locationProvider',function($controllerProvider, $stateProvider, $urlRouterProvider, AWSControlProvider,$locationProvider) {

        $locationProvider.hashPrefix('!');
        // $locationProvider.html5Mode(true);
        var imageSupportParams = {
          type           : 'image.*',
          host           : 's3',
          Bucket         : 'masuk',
          accessKeyId    : 'AKIAIABNWCTWZ65JJV4A',
          secretAccessKey: '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',
          region         : 'us-west-2'
        };
        AWSControlProvider.supportType(imageSupportParams);


      var routes, setControllers, setRoutes, routesSingles, setSingleRoutes;
      routes = ['home','about','services','clients','articles','admin', '404', 'media','products', 'contact', 'site', 'gallery'];
      routesSingles = ['services','clients','articles','media','products','gallery'];
        app.controller = function(name, constructor){
            $controllerProvider.register(name, constructor);
            return(this);
        };
      setControllers = function(route){

	      var name, fun;
	      name = route+'Ctrl';
	      fun = function($scope, $state, $firebase, api, $timeout, $rootScope, $location, $document) {
              $rootScope.title = $location.path()+' | Masuk Metal - Serving Vancouver BC with metalwork for driveway gates, railings, fences, and home automation.';
              $document[0].title = $rootScope.title;

              $scope.sections = ['views/fold','views/services','views/products','views/clients', 'views/about'];

              // $scope.sections = routes; //html files to load (about.html, etc)
              $scope.loadedSections = [$scope.sections[0]];
              $timeout(function(){
                  $scope.loadedSections.push($scope.sections[1]);
              },2000);


               var apiList = [
               'updateAbout',
               'saveArticle',
               'updateArticleTitle',
               'saveService',
               'updateServiceTitle',
               'updateService',
               'removeService',
               'saveGallery',
               'updateGalleryTitle',
               'updateGallery',
               'removeGallery',
               'saveProduct',
               'updateProductTitle',
               'updateProduct',
               'removeProduct',
               'saveClient',
               'updateClientTitle',
               'updateClient',
               'removeClient',
               'saveMedia',
               'removeMedia',
               'addContentMedia',
               'removeContentMedia',
               'addVariation',
               'addContentArticles',
               'removeContentArticles'
               ];
               angular.forEach(apiList, function(action){
               $scope[action] = api[action];
               return $scope;

               });


		      $scope.state = $state;
		      $scope.api = api;
		      var itemList = new Firebase("https://metal.firebaseio.com/"+route);
		      var sync = $firebase(itemList);


		      var aboutText = new Firebase("https://metal.firebaseio.com/about");
		      var syncAbout = $firebase(aboutText);
		      $scope.aboutHTML = syncAbout.$asArray();
		      $scope.saved = api.aboutSaved;
		      $scope.media = [];
		      $scope.articles = [];
			  $scope.productVariations = api.variations;
		      $scope.urlFilter = function(url) {
			      return url.toLowerCase().replace(/'+/g, '').replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "-").replace(/^-+|-+$/g, '');
		      };
		      $scope.search = ['JXAr2DW0CX5iRtxd0R3'];
	      };
	      app.controller(name, fun);
      };
			routes.forEach(function(route) {
				setControllers(route);
			});
      setRoutes = function(route) {
        var state, config;
	    state = route;
        config = {

            /*
             resolve:{test1:'api',test:function(test1, $q, $timeout){
             var deferred = $q.defer();
             $timeout(function(){
             deferred.resolve(test1);
             }, 2000);
             return deferred.promise;
             }},
             */

          url: '/' + route,
          templateUrl: 'views/' + route + '.html',
	      controller: route+'Ctrl'
        };
        $stateProvider.state(state, config);
        return $stateProvider;
      };

	  setSingleRoutes = function(singleRoute) {
		  var state, config;
		  state = 'single-'+singleRoute;
		  config = {
			  url: '/'+ singleRoute+ '/:' + singleRoute,
			  templateUrl: 'views/single/'+ singleRoute + '.html',
			  controller: function($scope, $state, api, $firebase, $rootScope, $location, $document){
                  $rootScope.title = $location.path()+' | Masuk Metal - Serving Vancouver BC with metalwork for driveway gates, railings, fences, and home automation.';
                  $document[0].title = $rootScope.title;
				  $scope.thisData = $state.current.data;
				  $scope.state = $state;
				  $scope.api = api;
				  var ref = new Firebase("https://metal.firebaseio.com/index/"+singleRoute+"/"+$scope.state.params[singleRoute]);
				  ref.on('value', function (snapshot) {
					  var itemID = snapshot.val();
					  var itemRef = new Firebase("https://metal.firebaseio.com/"+singleRoute+"/"+itemID);
					  var sync = $firebase(itemRef);
					  $scope.singleData = sync.$asObject();
				  }, function (errorObject) {
					  console.log('The read failed: ' + errorObject.code);
				  });
			  }
		  };
		  $stateProvider.state(state, config);
		  return $stateProvider;
	  };

	  routes.forEach(function(route) {
	      return setRoutes(route);
      });

	  routesSingles.forEach(function(routesSingle) {
		  return setSingleRoutes(routesSingle);
	  });
                $stateProvider.state('main',{url:'/',templateUrl:'views/home.html', controller:'homeCtrl'});

               /* TODO Admin Routing Start
                $stateProvider.state('new-admin',{
                    url:'/new-admin',
                    controller:'AdminCtrl',
                    views:{
                        view1:{
                            template: 'views/admin.html',
                            controller:'AdminCtrl'
                        },
                        view2:{
                            template: 'views/media.html',
                            controller:'AdminCtrl'
                        }
                    }
                });
                */

	  return $urlRouterProvider.otherwise('/home');

    }
  ])
		.filter('filterOut', function() {
			return function(input, search) {
				if (typeof search == "undefined") return input;
				var filtered = [];
				angular.forEach(input, function(value) {
					if (search.indexOf(value.$id) < 0) {
						filtered.push(value);
					}
				});
				return filtered;
			};
	})
        .filter('encodeText', function(){
            return function(text){
                var encodedText;
                encodedText = encodeURIComponent(text);
                console.log('encodedText',encodedText);
                return encodedText;
            }
        });

}).call(this);

//# sourceMappingURL=app.js.map
