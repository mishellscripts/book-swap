(()=> {
  let app = angular.module('bookApp', []);

  app.controller('BookController', ['$scope', '$http',
      ($scope, $http)=> {
        $scope.title = '';
        $scope.books = sender.books || [];
        $scope.bk = {};
        $scope.bookId = '';
        $scope.bookImageUrl = '';

        $scope.searchBook = ()=> {
          const apiURL = 'https://www.googleapis.com/books/v1/volumes?q=' + $scope.title
          $http.get(apiURL).then(data=> {
            $scope.books = data.data.items;
          });
        };

        $scope.updateBookId = book=> {
          console.log($scope.books);
          $scope.bookId = book._id;
          $scope.bookImageUrl = book.imageURL;
        }

        $scope.updateBook = book=> {
          $scope.bk = book;
          $scope.title = book.volumeInfo.title;
        }
      }
  ]);
})();