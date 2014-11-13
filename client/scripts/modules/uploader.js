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

    this.yeah = 'Hi';
    this.dataImg = '';

    this.supportType = function(params){
        /*
         type is regex

         params (in the case of S3) is an object with properties Bucket, accessKeyId, secretAccessKey, region

         host is 'S3' for now
         */
        mimes.push(params);
        console.log('mimes',mimes);
    };

    this.setYeah = function(yeah){ this.yeah = yeah; };
    this.setImg = function(yeah){ this.dataImg = dataImg; };

    this.$get = function($q, $rootScope, $firebase, api){

        return {

            yeah: this.yeah,
            dataImg: this.dataImg,

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
// todo What's this? myUpload()
            myUpload: function(file){
                api.mediaFile = file;
                console.log(api.mediaFile);
            },

            upload: function(file, key){



                console.log('file: ',file);
                console.log('key: ',key);
                var originalKey = key;
                $rootScope.dataImg = file;
                var cDate = Date.now();
                key = key.toLowerCase().replace(/'+/g, '').replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "-").replace(/^-+|-+$/g, '');
                key = key+'-'+ cDate+'.png';

                var handlerIndex = -1;

                angular.forEach(this.mimes, function(mime, index){
                    if (handlerIndex === -1){

                        handlerIndex = index;

                    }
                });

                if (handlerIndex === -1){
                    return false; //this should almost never happen considering canHandle is called prior
                }

                //now for handlers

                var deferred = $q.defer();

                var handler = this.mimes[handlerIndex];

                //TODO switch for different host handlers. Must retun a promise and use $timeout to reject quickly

                if (handler.host === 's3'){//begin S3 handler

                    var params = {Key: key, ContentType: file.type, Body: file};

                    AWS.config.update({accessKeyId: handler.accessKeyId, secretAccessKey: handler.secretAccessKey });
                    AWS.config.region = handler.region;
                    AWS.config.host = handler.host;

                    var bucket = new AWS.S3( { params: {Bucket: handler.Bucket } } );

                    bucket.putObject(params, function (err, data) {

                        if (err){
                            $rootScope.$broadcast('AWSUploadError');
                            deferred.reject(err);
                        }
                        else{
                            $rootScope.$broadcast('AWSUploadSuccess');
                            deferred.resolve(data);

                            $rootScope.newImage = 'https://' + AWS.config.host + '-' + AWS.config.region + '.amazonaws.com/' + handler.Bucket +'/'+ encodeURIComponent(key);
                            $rootScope.mediaTitle = originalKey;
                            $rootScope.mediaDescription = 'Vancouver Metalwork';
                            $rootScope.mediaTitle = $rootScope.mediaTitle.toLowerCase().replace(/'+/g, '').replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "-").replace(/^-+|-+$/g, '');
                            $rootScope.mediaTags = [originalKey];
                            var media = new Firebase("https://metal.firebaseio.com/media");
                            var sync = $firebase(media);
                            sync.$push({mediaURL:$rootScope.newImage, mediaTitle:$rootScope.mediaTitle, mediaLink:$rootScope.mediaTitle.toLowerCase().replace(/'+/g, '').replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "-").replace(/^-+|-+$/g, ''), mediaDescription:$rootScope.mediaDescription, mediaTags:$rootScope.mediaTags}).then(function (media){
                                var newID = media.name();
                                var index = new Firebase("https://metal.firebaseio.com/index/media");
                                var sync = $firebase(index);
                                sync.$set($rootScope.mediaTitle,newID);
                            });

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
        templateUrl: 'views/admin/uploader.html',
        restrict: 'E',
        link: function(scope, elem, attrs, ngModel){

            scope.upload = function(){
                var fileList = document.getElementById("yourInput").files.length;

                for(x=0;x<fileList;x++){
                    var fileInput = elem[0].children[0];
                    var file = fileInput.files[x];
                    elem[0].children[1].disabled = true;
                    elem[0].children[1].innerHTML = 'Uploading...';

                    if (!AWSControl.canHandle(file.type)){
                        elem[0].children[1].disabled = false;
                        elem[0].children[1].innerHTML = 'Upload';
                        alert('Generic alert or some notification about an unsupported file type');

                    }
                    else{
                        scope.reader = new FileReader();
                        scope.reader.onload = (function(lefile){

                            scope.reader.readAsDataURL(file);

                            setTimeout(function() {
                                AWSControl.dataImg = scope.reader.result;
                                console.log('dataImg',AWSControl.dataImg);
                            });

                            return function(e){
                                console.log("Filereader done");
                                /*
                                AWSControl.upload(e.target.result, lefile.name).then(
                                    function(data){
                                        elem[0].reset(); //clear the file input
                                        elem[0].children[1].disabled = false;
                                        elem[0].children[1].innerHTML = 'Upload';
                                        console.log('data',data);
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
*/
                                //---


                            };


                        })(file);



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


                /*

                 var fileInput = elem[0].children[0];
                 if (fileInput.files.length){
                 console.log('files',fileInput.files);
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
                 console.log(data);
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
                 */
            };// end scope.upload


        }// end link
    };

});
