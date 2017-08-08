(()=> {
  $(document).ready(function() {
    $(window).keydown(function(event){
      if(event.keyCode == 13) {
        event.preventDefault();
        return false;
      }
    });
  });

  let app = angular.module('bookApp', []);

  app.controller('BookController', ['$scope', '$http',
      ($scope, $http)=> {
        $scope.title = '';
        $scope.books = senderBooks || [];
        $scope.bk = (senderBooks && senderBooks[0]) || {};
        $scope.bookId = (senderBooks && senderBooks[0]._id) || '';
        $scope.bookImageUrl = '';
        $scope.selectedIndex = 0;

        $scope.searchBook = ()=> {
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