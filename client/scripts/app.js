(function () {
	'use strict';
	var app = angular.module('app', [
		'ngSanitize',
		'ngRoute',
		'ngAnimate',
		'ui.bootstrap',
		'ui.router',
		// 'easypiechart',
		'textAngular',
		'ngTagsInput',
		'app.controllers',
		'app.services',
		'app.directives',
		'app.localization',
		'app.nav',
		// 'scrollSectionLoader',
		'akoenig.deckgrid',
		'uploader',
		'animate-change']);
	app
		.config([
			'$controllerProvider', '$stateProvider', '$urlRouterProvider', 'AWSControlProvider', '$locationProvider', function ($controllerProvider, $stateProvider, $urlRouterProvider, AWSControlProvider, $locationProvider) {
				
				$locationProvider.hashPrefix('!');
				// $locationProvider.html5Mode(true);
				var imageSupportParams = {
					type: 'image.*',
					host: 's3',
					Bucket: 'masuk',
					accessKeyId: 'AKIAIABNWCTWZ65JJV4A',
					secretAccessKey: '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',
					region: 'us-west-2'
				};
				AWSControlProvider.supportType(imageSupportParams);
				
				
				var routes, setControllers, setRoutes, routesSingles, setSingleRoutes, routesAdmin, setAdminRoutes;
				routes = ['home', 'about', 'services', 'clients', 'articles', 'admin', '404', 'media', 'products', 'contact', 'site', 'gallery', 'landings'];
				routesSingles = ['services', 'clients', 'articles', 'media', 'products', 'gallery'];
				routesAdmin = ['home', 'about', 'services', 'clients', 'articles', 'media', 'products', 'gallery', 'landings'];
				app.controller = function (name, constructor) {
					$controllerProvider.register(name, constructor);
					return (this);
				};
				setControllers = function (route) {
					
					var name, fun;
					name = route + 'Ctrl';
					fun = function ($scope, $state, $firebase, api, $timeout, $rootScope, $location, $document, $firebaseAuth) {
						$rootScope.title = $location.path() + ' | Masuk Metal - Serving Vancouver BC with metalwork for driveway gates, railings, fences, and home automation.';
						$document[0].title = $rootScope.title;
						
						$scope.sections = [
							'views/fold',
							'views/services',
							'views/products',
							'views/clients',
							'views/about'];
						
						// $scope.sections = routes; //html files to load (about.html, etc)
						$scope.loadedSections = [$scope.sections[0]];
						
						angular.forEach($scope.sections, function (key, value) {
							var nowTime = Date.now();
							var waitTime = value * 1000;
							// console.log("waitTime", waitTime);
							if (value === 3) {
								$timeout(function () {
									$scope.pintrest = true;
									
								}, 5000);
							}
							if (value !== 0) {
								$timeout(function () {
									//console  .log(value, key);
									$scope.loadedSections.push(key);
									var thenTime = Date.now() - nowTime;
									//console.log(thenTime);
								}, waitTime);
							}
							
						});
						
						
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
						angular.forEach(apiList, function (action) {
							$scope[action] = api[action];
							return $scope;
						});
						
						
						$scope.state = $state;
						$scope.api = api;
						$scope.width = api.width;
						var ref = new Firebase("https://metal.firebaseio.com/" + route);
						$scope.authObj = $firebaseAuth(ref);
						$scope.logIn = function (email, password) {
							$scope.authObj.$authWithPassword({
								email: email,
								password: password
							}).then(function (authData) {
								console.log("Logged in as:", authData.uid);
							}).catch(function (error) {
								console.error("Authentication failed:", error);
							});
						};
						$scope.resetPass = function (email) {
							ref.resetPassword({
								email: email
							}, function (error) {
								if (error === null) {
									console.log("Password reset email sent successfully");
								} else {
									console.log("Error sending password reset email:", error);
								}
							});
						};
						
						
						var itemList = new Firebase("https://metal.firebaseio.com/" + route);
						var sync = $firebase(itemList);
						
						
						var aboutText = new Firebase("https://metal.firebaseio.com/about");
						var syncAbout = $firebase(aboutText);
						$scope.aboutHTML = syncAbout.$asArray();
						$scope.saved = api.aboutSaved;
						$scope.media = [];
						$scope.articles = [];
						$scope.productVariations = api.variations;
						$scope.urlFilter = function (url) {
							return url.toLowerCase().replace(/'+/g, '').replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "-").replace(/^-+|-+$/g, '');
						};
						$scope.search = [''];
					};
					app.controller(name, fun);
				};
				setRoutes = function (route) {
					var state, config;
					state = route;
					config = {
						url: '/' + route,
						templateUrl: 'views/' + route + '.html',
						controller: route + 'Ctrl'
					};
					$stateProvider.state(state, config);
					return $stateProvider;
				};
				setAdminRoutes = function (adminRoute) {
					var state, config;
					state = 'admin.' + adminRoute;
					config = {
						url: '/' + adminRoute,
						templateUrl: 'views/admin/' + adminRoute + '-admin.html',
						controller: adminRoute + 'Ctrl'
						
					};
					$stateProvider.state(state, config);
					return $stateProvider;
				};
				setSingleRoutes = function (singleRoute) {
					var state, config;
					state = 'single-' + singleRoute;
					config = {
						url: '/' + singleRoute + '/:' + singleRoute,
						templateUrl: 'views/single/' + singleRoute + '.html',
						controller: function ($scope, $state, api, $firebase, $rootScope, $location, $document) {
							$rootScope.title = $location.path() + ' | Masuk Metal - Serving Vancouver BC with metalwork for driveway gates, railings, fences, and home automation.';
							$document[0].title = $rootScope.title;
							$scope.thisData = $state.current.data;
							$scope.state = $state;
							$scope.api = api;
							var ref = new Firebase("https://metal.firebaseio.com/index/" + singleRoute + "/" + $scope.state.params[singleRoute]);
							ref.on('value', function (snapshot) {
								var itemID = snapshot.val();
								var itemRef = new Firebase("https://metal.firebaseio.com/" + singleRoute + "/" + itemID);
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
				
				routes.forEach(function (route) {
					setControllers(route);
				});
				routes.forEach(function (route) {
					return setRoutes(route);
				});
				routesAdmin.forEach(function (route) {
					return setAdminRoutes(route);
				});
				routesSingles.forEach(function (routesSingle) {
					return setSingleRoutes(routesSingle);
				});
				$stateProvider.state('main', {url: '/', templateUrl: 'views/home.html', controller: 'homeCtrl'});
				
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
		.filter('filterOut', function () {
			return function (input, search) {
				if (typeof search == "undefined") return input;
				var filtered = [];
				angular.forEach(input, function (value) {
					if (search.indexOf(value.$id) < 0) {
						filtered.push(value);
					}
				});
				return filtered;
			};
		})
		.filter('encodeText', function () {
			return function (text) {
				var encodedText;
				encodedText = encodeURIComponent(text);
				console.log('encodedText', encodedText);
				return encodedText;
			}
		})
		.run(function ($rootScope, $window) {
			
			var adminUI = function () {
				var width = $window.innerWidth,
					height = ($window.innerHeight - 70);
				if ($window.innerWidth <= 768) {
					height = (height - 180);
				}
				$rootScope.windowWidth = width;
				$rootScope.windowHeight = height;
				
				$rootScope.adminMenu = {
					background: '#777',
					color: '#333',
					position: 'absolute',
					left: 0,
					top: 0,
					zIndex: 11001,
					padding: (width * .01)
				};
				$rootScope.adminView = {
					maxWidth: width,
					maxHeight: (height * .9),
					overflowY: 'scroll',
					overflowX: 'hidden',
					position: 'absolute',
					bottom: 0,
					top: (height * .1),
					right: 0,
					zIndex: 11000,
					background: 'rgba(255,255,255,.97)',
					boxShadow: '2px 2px 2px rgba(0,0,0,.5)',
					margin: '1em'
				};
				$rootScope.primarySectionStyle = {height: (height * 0.4), width: width, background: 'rgba(0,0,0,.2)'};
				$rootScope.secondSectionStyle = {height: (height * .5), float: 'left'};
				$rootScope.notesStyle = {width: (width * .4), height: (height * .5), float: 'left'};
				$rootScope.notesStyleZ = {
					position: 'absolute',
					zIndex: 11001,
					width: (width * .4),
					height: (height * .5),
					bottom: 0,
					left: 0,
					background: '#FFFFCC',
					padding: '1em'
				};
				$rootScope.articlesStyle = {
					width: (width * .3),
					height: (height * .3),
					float: 'left',
					display: 'table',
					textAlign: 'center'
				};
				$rootScope.landingStyle = {
					width: (width * .4),
					height: (height * .2),
					float: 'left',
					display: 'table',
					textAlign: 'center'
				};
				$rootScope.siteStyle = {
					width: (width * .2),
					height: (height * .2),
					float: 'left',
					display: 'table',
					textAlign: 'center'
				};
				$rootScope.primaryStyle = {
					height: (height * 0.4),
					minWidth: (width / 3),
					float: 'left',
					display: 'table',
					textAlign: 'center'
				};
				$rootScope.itemStyle = {height: '100%', display: 'table-cell', textAlign: 'center', verticalAlign: 'middle'};
				$rootScope.headerStyle = {
					height: (height * 0.1),
					width: width,
					background: 'rgba(0,0,0,.2)',
					display: 'table',
					textAlign: 'center'
				};
				$rootScope.adminStyle = {
					height: height,
					width: width,
					background: '#fff',
					position: 'fixed',
					left: 0,
					top: 60,
					zIndex: 10000
				};
				if ($rootScope.adminStyle.width < 768) {
					$rootScope.adminStyle.top = 120;
				}
			};
			adminUI();
			
			
			angular.element($window).bind('resize', function () {
				adminUI();
				$rootScope.$apply('windowWidth', 'windowHeight');
			});
		});
	
}).call(this);

//# sourceMappingURL=app.js.map
