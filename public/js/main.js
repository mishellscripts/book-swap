(()=> {
  let app = angular.module('bookApp', []);

  app.controller('BookController', ['$scope', '$http',
      ($scope, $http)=> {
        $scope.title = '';
        $scope.books = senderBooks || [];
        $scope.bk = {};
        $scope.bookId = '';
        $scope.bookImageUrl = '';
        $scope.selectedIndex = 0;

        $scope.searchBook = ($event)=> {
          $event.preventDefault();
          const apiURL = 'https://www.googleapis.com/books/v1/volumes?q=' + $scope.title
          $http.get(apiURL).then(data=> {
            $scope.books = data.data.items;
          });
        };

        $scope.updateBookId = (book, $index)=> {
          $scope.bookId = book._id;
          $scope.bookImageUrl = book.imageURL;
          $scope.selectedIndex = $index;
        }

        $scope.updateBook = (book, $index)=> {
          $scope.bk = book;
          $scope.title = book.volumeInfo.title;
          $scope.selectedIndex = $index;
        }
      }
  ]);
})();