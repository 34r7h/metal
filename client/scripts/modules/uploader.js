/*

	Uploader module
	-------------------

	This assumes that a specific file type will have its own handler. A file type can
	be set strictly or as a regex.

	method supportType() is used to define how a certain file type is supposed to be handled

		it takes main parameters host (which can be 's3') and type which is the file type regex.
		other additional parameters specific to the host can also be added.

	
	method canHandle is used by the directive to check if a file's type has a handler before
		attempting to upload it

	method upload does the actual upload and returns a promise.
		this method also broadcasts events on success and fail that can be caught in your
		controllers

	ToDos
	------

	* Do something with the directive model in a way that the controller can use to know 
		if a file has been selected/uploaded/is the expected format

	* More error checking in uploader


*/


var uploader = angular.module('uploader', []);

uploader.provider('AWSControl', function(){
  var mimes = [];

  this.supportType = function(params){
    /*
      type is regex 
      
      params (in the case of S3) is an object with properties Bucket, accessKeyId, secretAccessKey, region
      
      host is 'S3' for now
    */
    mimes.push(params);    
  };


  this.$get = function($q, $rootScope, $firebase, api){
      return {
          mimes: mimes,
          canHandle: function(fileType){
                        var canBeHandled = false;
                        for (var i=0; i < this.mimes.length; i++){
                          if (!canBeHandled){
                             if (fileType.match(this.mimes[i].type)){
                               canBeHandled = true;
                               continue;
                             }                 
                          }
                        }// end 
                        return canBeHandled;
                    },
            myUpload: function(file){
                api.mediaFile = file;
                console.log(api.mediaFile);
            },


          upload: function(file, key){


/*









              function createObjectURL() {
                  console.log('file',file);
                  return (window.URL) ? window.URL.createObjectURL(file) : window.webkitURL.createObjectURL(file);

              };

              function revokeObjectURL(url) {
                  console.log('url',url);
                  return (window.URL) ? window.URL.revokeObjectURL(url) : window.webkitURL.revokeObjectURL(url);


              };

              (function myUploadOnChangeFunction() {

                          console.log('file',file);
                          var src = createObjectURL(file);
                  console.log('src',src);

                  var image = new Image();
                  console.log('image',image);

                  src = src.toLowerCase().replace(/'+/g, '').replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "-").replace(/^-+|-+$/g, '');

                          image.src = src;
                          console.log('image.src',image.src);
                  api.testMe = image.src;
                  return api.testMe;
                  // Do whatever you want with your image, it's just like any other image
                          // but it displays directly from the user machine, not the server!


              })();


*/


              console.log('file', file);

              console.log('key', key);




	          var cDate = Date.now();
              key = key.toLowerCase().replace(/'+/g, '').replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "-").replace(/^-+|-+$/g, '');
              key = key+'-'+ cDate+'.png';
	            var handlerIndex = -1;
	            angular.forEach(this.mimes, function(mime, index){
	              if (handlerIndex === -1){
	                if (file.type.match(mime.type)){
	                  handlerIndex = index;
	                }
	              }
	            });
	            if (handlerIndex === -1){
	              return false; //this should almost never happen considering canHandle is called prior
	            }
	            //now for handlers
	            var deferred = $q.defer();
	            var handler = this.mimes[handlerIndex];

              var createThumbnail = function(file, callback) {
                  var fileReader;
                  fileReader = new FileReader;
                  fileReader.onload = (function(_this) {
                      return function() {
                          var img;
                          img = document.createElement("img");
                          img.onload = function() {
                              var canvas, ctx, resizeInfo, thumbnail, _ref, _ref1, _ref2, _ref3;
                              file.width = img.width;
                              file.height = img.height;

                              canvas = document.createElement("canvas");
                              ctx = canvas.getContext("2d");
                              canvas.width = 100;
                              canvas.height = 100;
                              drawImageIOSFix(ctx, img, (_ref = 50) != null ? _ref : 0, (_ref1 = 50) != null ? _ref1 : 0, 100, 100, (_ref2 = 50) != null ? _ref2 : 0, (_ref3 = 40) != null ? _ref3 : 0, 90, 400);
                              thumbnail = canvas.toDataURL("image/png");
                              console.log('thumbnail',thumbnail);

                              _this.emit("thumbnail", file, thumbnail);
                              if (callback != null) {
                                  return callback();
                              }
                          };
                          console.log('img.src',img.src);
                          return img.src = fileReader.result;
                      };
                  })(this);
                  return fileReader.readAsDataURL(file);
              };
              createThumbnail(file);

	            //TODO switch for different host handlers. Must retun a promise and use $timeout to reject quickly
	            if (handler.host === 's3'){//begin S3 handler


	              var params = {Key: key, ContentType: file.type, Body: file};
	              AWS.config.update({accessKeyId: handler.accessKeyId, secretAccessKey: handler.secretAccessKey });
	              AWS.config.region = handler.region;
	              AWS.config.host = handler.host;
	              var bucket = new AWS.S3( { params: {Bucket: handler.Bucket } } );

	              bucket.putObject(params, function (err, api) {

	                if (err){
	                  $rootScope.$broadcast('AWSUploadError');
	                  deferred.reject(err);
	                }
	                else{
	                    $rootScope.$broadcast('AWSUploadSuccess');
						$rootScope.newImage = 'https://' + AWS.config.host + '-' + AWS.config.region + '.amazonaws.com/' + handler.Bucket +'/'+ encodeURIComponent(key);
	                    $rootScope.mediaTitle = prompt('Upload Successful! Please name your media.');
		                $rootScope.mediaTitle = $rootScope.mediaTitle.toLowerCase().replace(/'+/g, '').replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "-").replace(/^-+|-+$/g, '');

/* beginning of self-called check on path availablility
						 var index = new Firebase("https://metal.firebaseio.com/index/media");
						 var sync = $firebase(index);
						 var mediaIndex = sync.$asObject();
						 console.log(mediaIndex);
		                (function(){
			                console.log($rootScope.mediaTitle + ' function running: '+mediaIndex);
			                while ($rootScope.mediaTitle){
				                console.log('in loop..');
				                $rootScope.mediaTitle = prompt('Try again, that\'s taken! Please name your media.');
				                $rootScope.mediaTitle = $rootScope.mediaTitle.toLowerCase().replace(/'+/g, '').replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "-").replace(/^-+|-+$/g, '');
			                }
			                console.log('loop over.')
		                })();
*/
	                    console.log($rootScope.newImage + ' ' + $rootScope.newImage);
	                    var media = new Firebase("https://metal.firebaseio.com/media");
	                    var sync = $firebase(media);
	                    sync.$push({mediaURL:$rootScope.newImage, mediaTitle:$rootScope.mediaTitle, mediaLink:$rootScope.mediaTitle.toLowerCase().replace(/'+/g, '').replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "-").replace(/^-+|-+$/g, '')}).then(function (media){
		                    var newID = media.name();
		                    var index = new Firebase("https://metal.firebaseio.com/index/media");
		                    var sync = $firebase(index);
		                    sync.$set($rootScope.mediaTitle,newID);
	                    });
	                    deferred.resolve(data);
	                }


	              });

	              return deferred.promise;




	            }// end S3 handler
	            else{

	              alert('No handler');

	            }



	        }

      };// return brace

  }; //end .$get

});

uploader.directive('uploader', function(AWSControl){

  return {
    replace: true,
    scope : {},
    require: 'ngModel',
    template: '<form novalidate ><input class="well" type="file" /><button class="btn btn-behance" id="upIt" data-ng-click="upload()">Upload</button></form>',
    restrict: 'E',
    link: function(scope, elem, attrs, ngModel){
       
       scope.upload = function(){
        
        var fileInput = elem[0].children[0];
        if (fileInput.files.length){          
          var file = fileInput.files[0];
          elem[0].children[1].disabled = true;
          elem[0].children[1].innerHTML = 'Uploading...';

          if (!AWSControl.canHandle(file.type)){
            elem[0].children[1].disabled = false;
            elem[0].children[1].innerHTML = 'Upload';
            alert('Generic alert or some notification about an unsupported file type');

          }
          else{
            
            AWSControl.upload(file, file.name).then(
              function(data){
                elem[0].reset(); //clear the file input
                elem[0].children[1].disabled = false;
                elem[0].children[1].innerHTML = 'Upload';
                //alert('Notification about a successful upload');
              },

              function(err){
                elem[0].children[1].disabled = false;
                elem[0].children[1].innerHTML = 'Upload';
                console.log(err);
                //alert('FAILED: Notification about a failed upload');
              },

              function(msg){

              });


          }

        }
        else{
          console.log('No file');
        }

      };// end scope.upload
      
      
    }// end link
  };
  
});
