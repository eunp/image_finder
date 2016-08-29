'use strict';
var app = angular.module('imgApp', ['ngRoute', 'ngResource', 'ngSanitize']);

app.constant('config', {
  imageDir: 'images/upload'
});

app.config(['$routeProvider', function($routeProvider) {
  $routeProvider
    .when('/', {
      templateUrl: 'home.html',
      controller: 'HomeCtrl'
    })
    .when('/imgs', {
      templateUrl: 'imgs.html',
      controller: 'ImgsCtrl'
    })
    .when('/imgs/:imgId', {
      templateUrl: 'img.html',
      controller: 'ImgsCtrl'
    })
    .otherwise({
      redirectTo: '/'
    });
}]);

app.factory('ImgService', ['$resource', function($resource) {
  return $resource('/imgs/:imgId');
}]);

app.directive('fileModel', ['$parse', function($parse) {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      var model = $parse(attrs.fileModel);
      var modelSetter = model.assign;

      element.bind('change', function() {
        scope.$apply(function() {
          modelSetter(scope, element[0].files[0]);
        });
      });
    }
  };
}]);

app.controller('HomeCtrl', function($scope, $http) {
  $scope.message = "";

  $scope.uploadFiles = function() {
    if ($scope.myfile && $scope.myfile.type.match(/(jpg|jpeg|png)$/i)) {
      var fd = new FormData();
      fd.append('imagefile',$scope.myfile);
      $http.post('/upload', fd, {
        transformRequest: angular.identity,
        headers: {'Content-Type': undefined}
      })
      .then(function(res){
        $scope.data = res.data;
        $scope.message = "Upload successful. "
        + "Click <a href='#imgs/" + $scope.data.file.filename + "'>here</a> to view image";
      });
    } else {
      $scope.message = "Only jpg, jpeg, png files allowed. Try again."
    }
  }
});

app.controller('ImgsCtrl', ['$scope', '$routeParams', 'ImgService', 'config', function($scope, $routeParams, service, config) {
  $scope.imageDir = config.imageDir;
  $scope.imgname = $routeParams.imgId;
  $scope.message = "Searching...";

  service.get({
    imgId: $routeParams.imgId
  }, function(data, headers) {
    if ('files' in data) {
      $scope.imgs = data.files;
    } else if ('matches' in data) {
      var matches = data.matches;
      matches = matches.sort(function(a,b) {
        return a.score - b.score;
      })
      $scope.matches = matches.slice(0,3);
      if ($scope.matches.length < 1) {
        $scope.message = "No similar images found";
      } else {
        $scope.message = "";
      }
    } else {
      $scope.imgs = [];
      $scope.matches = [];
    }
  }, _handleError);
}]);

function _handleError(response) {
  console.log('%c ' + response, 'color:red');
}
