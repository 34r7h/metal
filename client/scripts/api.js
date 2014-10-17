angular.module('app.services', ['firebase'])
	.factory('api', ['$firebase',
		function($firebase) {

			var api = {show:{},sync:{index:{}},index:{}};

			var types = ['media','clients','services','articles', 'about','products','contact','site'];
			var baseURL = 'https://metal.firebaseio.com/';
			var indexURL = 'https://metal.firebaseio.com/index/';
			angular.forEach(types, function(type){
				api[type] = new Firebase(baseURL+type);
				api.sync[type] = $firebase(api[type]);
				api.index[type] = new Firebase(indexURL+type);
				api.sync.index[type] = $firebase(api.index[type]);
				// makes display object
				api.show[type] = api.sync[type].$asArray();
			});
// Site
			api.saveContact = function(provider, address){
				api.sync.contact.$set(provider, address);
			};
			api.saveSite = function(feature, address){
				api.sync.site.$set(feature, address);
			};

// Media
			api.saveMedia = function(id, title, description){
				var link = title.toLowerCase().replace(/'+/g, '').replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "-").replace(/^-+|-+$/g, '');

			    api.sync.media.$update(id, {mediaTitle:title, mediaLink:link, mediaDescription:description}).then(function(media){
				api.newID = media.name();
				if(api.sync.index.media[link] === false){
					api.sync.index.media.$set(link, api.newID);
				}
			})
			};
			api.removeMedia = function(name,id){
				api.sync.media.$remove(id).then(function(){
					api.sync.index.media.$remove(name);
				});

			};
// About
			api.updateAbout = function(id, text){
				api.sync.about.$update(id, {description:text});
				api.aboutSaved = 'About Saved!'
			};
// Add to Content
			api.addContentMedia = function(content, id, media){
                console.log(content,id,media);
				media.unshift(id);
			};
			api.removeContentMedia = function(media, id){
				for(var i=0; i< media.length; i++){
					if(media[i] === id){
						media.splice(i, 1);  //removes 1 element at position i
						break;
					}
				}
			};
			api.addContentArticles = function(content, id, articles){
				if(articles[0]==='No Articles'){
					articles[0]=id;
				} else {
					var cleanArticles = articles;
					cleanArticles.push(id);
					cleanArticles = cleanArticles.filter( function( item, index, inputArray ) {
						return inputArray.indexOf(item) == index;
					});
					console.log('Clean = ' + cleanArticles);
					articles = cleanArticles;
					console.log('Articles = '+articles);
					return articles;
				}
			};
			api.removeContentArticles = function(articles, id){
				for(var i=0; i< articles.length; i++){
					if(articles[i] === id){
						articles.splice(i, 1);  //removes 1 element at position i
					}
				}
				if(articles.length === 0){
					articles[0] = 'No Articles';
				}
			};
			api.addVariation = function(variation, variations){
				if(variations[0]==='No Variations'){
					variations[0]={name:variation.name, description:variation.description};
				} else {
					variations.push({name:variation.name, description:variation.description});
				}
			};
			api.removeVariation = function(index, variations){
				variations.splice(index, 1);
				if(variations.length === 0){
					variations[0] = 'No Variations';
				}
			};
			api.addTestimonial = function(testimonial, testimonials){
				if(testimonials[0]==='No Testimonials'){
					testimonials[0]={name:testimonial.name, description:testimonial.description};
				} else {
					testimonials.push({name:testimonial.name, description:testimonial.description});
				}
			};
			api.removeTestimonial = function(index, testimonials){
				testimonials.splice(index, 1);
				if(testimonials.length === 0){
					testimonials[0] = 'No Testimonials';
				}
			};

// Clients
			api.saveClient = function(title, description, testimonials, media, articles){
				if(!media){
					var media = [];
					media[0] = 'No Media';
				}
				if(!testimonials){
					var testimonials = [];
					testimonials[0] = 'No Testimonials';
				}
				if(!articles){
					var articles = [];
					articles[0] = 'No Articles';
				}
				this.media = media;
				var time = Date.now();
				var clientURL = title.toLowerCase().replace(/'+/g, '').replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "-").replace(/^-+|-+$/g, '');
				api.sync.clients.$push({title:title,description:description, testimonials: testimonials, clientURL:clientURL, media:media, articles:articles, time:time}).then(function (client){
					api.newID = client.name();
					if(!api.show.clients.$getRecord(api.newID).media){
						api.sync.clients.$update(api.newID, {media:['']});
					}
					if(!api.show.clients.$getRecord(api.newID).testimonials){
						api.sync.clients.$update(api.newID, {testimonials:['']});
					}
					if(!api.show.clients.$getRecord(api.newID).articles){
						api.sync.clients.$update(api.newID, {articles:['']});
					}
					api.sync.index.clients.$set(clientURL, api.newID);
				});
			};
			api.removeClient = function(name,id){
				api.sync.clients.$remove(id).then(function(){
					api.sync.index.clients.$remove(name);
				});

			};
			api.updateClientTitle = function(id, title){
				var link = title.toLowerCase().replace(/'+/g, '').replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "-").replace(/^-+|-+$/g, '');
				api.sync.clients.$update(id, {title:title, clientURL:link}).then(function(client){
					api.newID = client.name();
					api.sync.index.clients.$set(link, api.newID);
				})
			};
			api.updateClient = function(id, description, testimonials, media, articles){
				api.sync.clients.$update(id, {description:description, testimonials:testimonials, media:media, articles:articles});
			};

// Services
			api.saveService = function(title, description, variations, media, articles, price){
				if(!media){
					var media = [];
					media[0] = 'No Media';
				}
				if(!variations){
					var variations = [];
					variations[0] = 'No Variations';
				}
				if(!articles){
					var articles = [];
					articles[0] = 'No Articles';
				}
				this.media = media;
				var serviceURL = title.toLowerCase().replace(/'+/g, '').replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "-").replace(/^-+|-+$/g, '');
				var time = Date.now();
				api.sync.services.$push({title:title,description:description, variations: variations, serviceURL:serviceURL, media:media, articles:articles, startingPrice:price, time:time}).then(function (service){
					api.newID = service.name();
					if(!api.show.services.$getRecord(api.newID).media){
						api.sync.services.$update(api.newID, {media:['']});
					}
					if(!api.show.services.$getRecord(api.newID).variations){
						api.sync.services.$update(api.newID, {variations:['']});
					}
					if(!api.show.services.$getRecord(api.newID).articles){
						api.sync.services.$update(api.newID, {articles:['']});
					}
					api.sync.index.services.$set(serviceURL, api.newID);
				});
			};
			api.removeService = function(name,id){
				api.sync.services.$remove(id).then(function(){
					api.sync.index.services.$remove(name);
				});

			};
			api.updateServiceTitle = function(id, title){
				var link = title.toLowerCase().replace(/'+/g, '').replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "-").replace(/^-+|-+$/g, '');
				api.sync.services.$update(id, {title:title, serviceURL:link}).then(function(service){
					api.newID = service.name();
					api.sync.index.services.$set(link, api.newID);
				})
			};
			api.updateService = function(id, description, variations, media, articles, price){
				variations = angular.copy(variations);
				api.sync.services.$update(id, {description:description, variations:variations, media:media, articles:articles, startingPrice:price});
			};
// Products
			api.saveProduct = function(title, description, variations, media, articles, price){
				if(!media){
					var media = [];
					media[0] = 'No Media';
				}
				if(!variations){
					var variations = [];
					variations[0] = 'No Variations';
				}
				if(!articles){
					var articles = [];
					articles[0] = 'No Articles';
				}
				this.media = media;
				var time = Date.now();
				var productURL = title.toLowerCase().replace(/'+/g, '').replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "-").replace(/^-+|-+$/g, '');
				api.sync.products.$push({title:title,description:description, variations: variations, productURL:productURL, media:media, articles:articles, price:price, time:time}).then(function (product){
					api.newID = product.name();
					if(!api.show.products.$getRecord(api.newID).media){
						api.sync.products.$update(api.newID, {media:['']});
					}
					if(!api.show.products.$getRecord(api.newID).variations){
						api.sync.products.$update(api.newID, {variations:['']});
					}
					if(!api.show.products.$getRecord(api.newID).articles){
						api.sync.products.$update(api.newID, {articles:['']});
					}
					api.sync.index.products.$set(productURL, api.newID);
				});
			};
			api.removeProduct = function(name,id){
				api.sync.products.$remove(id).then(function(){
					api.sync.index.products.$remove(name);
				});

			};
			api.updateProductTitle = function(id, title){
				var link = title.toLowerCase().replace(/'+/g, '').replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "-").replace(/^-+|-+$/g, '');
				api.sync.products.$update(id, {title:title, productURL:link}).then(function(product){
					api.newID = product.name();
					api.sync.index.products.$set(link, api.newID);
				})
			};
			api.updateProduct = function(id, description, variations, media, articles, price){
				api.sync.products.$update(id, {description:description, variations:variations, media:media, articles:articles, price:price});
			};

// Articles
			api.saveArticle = function(title, description, media, articles, published){
				if(!media){
					var media = [];
					media[0] = 'No Media';
				}
				if(!variations){
					var variations = [];
					variations[0] = 'No Variations';
				}
				if(!articles){
					var articles = [];
					articles[0] = 'No Articles';
				}
				if(!published){
					published = false;
				}
				this.media = media;
				var time = Date.now();
				var articleURL = title.toLowerCase().replace(/'+/g, '').replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "-").replace(/^-+|-+$/g, '');
				api.sync.articles.$push({title:title,description:description, articleURL:articleURL, media:media, articles:articles, time:time, published:published}).then(function (article){
					api.newID = article.name();
					if(!api.show.articles.$getRecord(api.newID).media){
						api.sync.articles.$update(api.newID, {media:['']});
					}
					if(!api.show.articles.$getRecord(api.newID).variations){
						api.sync.articles.$update(api.newID, {variations:['']});
					}
					if(!api.show.articles.$getRecord(api.newID).articles){
						api.sync.articles.$update(api.newID, {articles:['']});
					}
					api.sync.index.articles.$set(articleURL, api.newID);
				});
			};
			api.removeArticle = function(name,id){
				api.sync.articles.$remove(id).then(function(){
					api.sync.index.articles.$remove(name);
				});

			};
			api.updateArticleTitle = function(id, title){
				var link = title.toLowerCase().replace(/'+/g, '').replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "-").replace(/^-+|-+$/g, '');
				api.sync.articles.$update(id, {title:title, articleURL:link}).then(function(article){
					api.newID = article.name();
					api.sync.index.articles.$set(link, api.newID);
				})
			};
			api.updateArticle = function(id, description, media, articles){
                console.log(id, description, media, articles);
				api.sync.articles.$update(id, {description:description, media:media, articles:articles});
			};

			return api;

	}]);