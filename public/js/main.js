(()=> {
  let app = angular.module('bookApp', []);

  app.controller('BookController', ['$scope', '$http',
      ($scope, $http)=> {
        $scope.title = '';
        $scope.books = [];
        $scope.bk = {};

        $scope.searchBook = ()=> {
          const apiURL = 'https://www.googleapis.com/books/v1/volumes?q=' + $scope.title
          $http.get(apiURL).then(data=> {
            $scope.books = data.data.items;
            console.log(data.data.items[0]);
          });
        };

        $scope.updateBook = book=> {
          $scope.bk = book;
          $scope.title = book.volumeInfo.title;
        }
      }
  ]);
})();