angular.module('app.services', ['firebase'])
	.factory('api', ['$firebase',
		function($firebase) {

// Database Setup
			var api = {show:{},sync:{index:{}},index:{}};
			var types = ['media','clients','services','articles', 'gallery', 'about','products','contact','site', 'domains'];
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

// Helper Functions
            api.addToArray = function(array,item){
                if (item && item.length > 0) {
                    if(array[0]===('No Tags Selected')){
                        array.splice(0,1);
                    }
                    array.push(item);
                    console.log('pushed to: ',array);
                    return array;
                }

            };
            api.removeFromArray = function(array,index){
                if(array[0] !== 'No Tags Selected'){
                    array.splice(index,1);

                }


            };

// Site
			api.saveContact = function(provider, address){
				api.sync.contact.$set(provider, address);
			};
			api.saveSite = function(feature, address){
				api.sync.site.$set(feature, address);
			};
            api.addDomain = function(url, text){
                if (api.show.domains.length > 0){
                    var domains = api.show.domains;
                    domains.$add({url: url, text:text,image:['No Image Yet']}).then(
                        function(domain){
                            var newURL = url.toLowerCase().replace(/'+/g, '').replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "-").replace(/^-+|-+$/g, '');
                            var newID = domain.name();
                            console.log(domain,newID);
                            api.sync.index.domains.$set(newURL, newID)
                        }
                    );

                } else {
                    api.sync.domains.$push({url:url, text:text,image:['No Image Yet']}).then(
                        function(domain){
                            var newURL = url.toLowerCase().replace(/'+/g, '').replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "-").replace(/^-+|-+$/g, '');
                            var newID = domain.name();
                            console.log(domain,newID);
                            api.sync.index.domains.$set(newURL, newID)
                        }
                    );
                }

            };
            api.updateDomain = function(domain, heading, text, url, media, link, linkText, title, description){
                api.sync.domains.$set(domain, {heading:heading, text:text, url:url, image:media, link:link, linkText:linkText, title:title, description:description}).then(
                    function(domain){
                        var newURL = url.toLowerCase().replace(/'+/g, '').replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "-").replace(/^-+|-+$/g, '');
                        var newID = domain.name();
                        api.sync.index.domains.$set(newURL, newID);

                    }
                );
            };
            api.removeDomain = function (id,url) {
                console.log('id:',id);
                api.sync.domains.$remove(id);
                api.sync.index.domains.$remove(url);
            };


            var myMedia = api.sync.media.$asArray();

            setTimeout(function(){
                angular.forEach(myMedia,function(media, key){

                    if (!media.mediaTags) {
                        media.mediaTags = ['No Tags Selected'];
                    }
                    if (!media.mediaDescription){
                        media.mediaDescription = 'Vancouver Metalwork';
                    }

                    myMedia.$save();

                });
            }, 5000);



// Media
			api.saveMedia = function(id, title, description, tags){
				var link = title.toLowerCase().replace(/'+/g, '').replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "-").replace(/^-+|-+$/g, '');
                if (!tags) {
                    var tags = ['No Tags Selected'];
                } else if (tags[0] === 'No Tags Selected' && tags.length > 1) {
                    tags.splice(0,1);
                }
			    api.sync.media.$update(id, {mediaTitle:title, mediaLink:link, mediaDescription:description, mediaTags:tags}).then(function(media){
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

            // Galleries

            api.saveGallery = function(title, description, media, articles){
                if(!media){
                    var media = [];
                    media[0] = 'No Media';
                }
                if(!articles){
                    var articles = [];
                    articles[0] = 'No Articles';
                }
                this.media = media;
                var galleryURL = title.toLowerCase().replace(/'+/g, '').replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "-").replace(/^-+|-+$/g, '');
                var time = Date.now();
                api.sync.gallery.$push({title:title, description:description, galleryURL:galleryURL, media:media, articles:articles, time:time}).then(function (gallery){
                    api.newID = gallery.name();
                    if(!api.show.gallery.$getRecord(api.newID).media){
                        api.sync.gallery.$update(api.newID, {media:['']});
                    }
                    if(!api.show.gallery.$getRecord(api.newID).articles){
                        api.sync.gallery.$update(api.newID, {articles:['']});
                    }
                    api.sync.index.gallery.$set(galleryURL, api.newID);
                });
            };
            api.removeGallery = function(name,id){
                api.sync.gallery.$remove(id).then(function(){
                    api.sync.index.gallery.$remove(name);
                });

            };
            api.updateGalleryTitle = function(id, title){
                var link = title.toLowerCase().replace(/'+/g, '').replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "-").replace(/^-+|-+$/g, '');
                api.sync.gallery.$update(id, {title:title, galleryURL:link}).then(function(gallery){
                    api.newID = gallery.name();
                    api.sync.index.gallery.$set(link, api.newID);
                })
            };
            api.updateGallery = function(id, description, media, articles){

                api.sync.gallery.$update(id, {description:description, media:media, articles:articles});
            };

			return api;

	}]);
