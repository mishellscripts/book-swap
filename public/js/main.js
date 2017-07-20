(()=> {
  let app = angular.module('bookApp', []);

  app.controller('BookController', ['$scope',
      $scope=> {
        $scope.showBooks = false;
        $scope.title = '';
        $scope.searchBook = ()=> {
          console.log('hello');
          socket.emit('getTitle', $scope.title);

          socket.on('searchBooks', books=> {
            console.log(books);
            $scope.books = books;
            showBooks = true;
          });
        };
      }
  ]);
})();

let socket = io();