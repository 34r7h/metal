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

	  'akoenig.deckgrid',
      'uploader']);
	app.config([
    '$controllerProvider','$stateProvider', '$urlRouterProvider', 'AWSControlProvider', function($controllerProvider, $stateProvider, $urlRouterProvider, AWSControlProvider) {
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
      routes = ['home','about','services','clients','articles','admin', '404', 'media','products'];
      routesSingles = ['services','clients','articles','media','products'];
		app.controller = function(name, constructor){
			$controllerProvider.register(name, constructor);
			return(this);
		};
      setControllers = function(route){
	      var name, fun;
	      name = route+'Ctrl';
	      fun = function($scope, $state, api, $firebase) {
		      var apiList = [
			      'updateAbout',
			      'saveArticle',
			      'updateArticleTitle',
			      'saveService',
			      'updateServiceTitle',
			      'updateService',
			      'removeService',
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
			      'addVariation'
		      ];
		      angular.forEach(apiList, function(action){
			      $scope[action] = api[action];
			      return $scope;

		      });
		      $scope.state = $state;
		      $scope.api = api;
		      var itemList = new Firebase("https://metal.firebaseio.com/"+route);
		      var sync = $firebase(itemList);
		      $scope.showMe = sync.$asArray();
		      var aboutText = new Firebase("https://metal.firebaseio.com/about");
		      var syncAbout = $firebase(aboutText);
		      $scope.aboutHTML = syncAbout.$asArray();
		      $scope.saved = api.aboutSaved;
		      $scope.media = [];
			  $scope.productVariations = api.variations;
		      $scope.urlFilter = function(url) {
			      return url.toLowerCase().replace(/'+/g, '').replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "-").replace(/^-+|-+$/g, '');
		      };

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
			  controller: function($scope, $state, api, $firebase){
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
	  return $urlRouterProvider.otherwise('/home');

    }
  ]);

}).call(this);

//# sourceMappingURL=app.js.map
