//Initialize Built.io Backend Application
var BuiltApp   = Built.App('blta1d22ed99ebbf615');

//Create `todoApp` AngularJS module
angular.module('todoApp',[])
  .controller('TodoListController', function($scope) {

    $scope.todoList = [];

    /*
      Populate `todoList`
      ===================
      Fetch data from Built.io Backend's
    */
    
      // `BuiltClass` is an instance of Backend class. 
      var BuiltClass = BuiltApp.Class('todos');

      // `builtQuery` is an instance of Backend's Query.
      var builtQuery = BuiltClass.Query();

      // Execute builtQuery
      builtQuery.exec()
        .then(function(objects){
          console.log('objects', objects);
          $sa($scope, function(){
            $scope.todoList = objects
          });
        });


    /* Add new todo in todoList */
    $scope.addTodo = function(){
      
      /* 
        Save todo object to Built.io Backend
      */
        
        // BuiltApp.Class('class_name').Object returns a Object constructor
        var Todo = BuiltApp.Class('todos').Object;

        // `newTodo` is Object of `Todo` constructor
        var newTodo = Todo({
          text: $scope.todoText,
          done: false
        })

        // `newTodo` save method create new Object in Built.IO Backend's `todos` Class
        newTodo.save()
          // save method return's a promise
          .then(function(responseObj){
            // On success `responseObj` return a Built.IO Backend's Object we just created
            $sa($scope, function(){
              // add `responseObj` to our `$scope.todoList`
              $scope.todoList.push(responseObj);
              // clear the input text on html form
              $scope.todoText = '';
            })
          })
    }

    /* Delete todo from todoList */
    $scope.removeTodo = function(todo){
      //Get index number of todo
      var index = $scope.todoList.indexOf(todo);
      //Delete from Built.IO Backend
      todo.delete()
      .then(function(data){
        $sa($scope, function(){
          $scope.todoList.splice(index,1);
        })
      });
    }

    /* Update todo */
    $scope.updateTodo = function(newTodo,index){ 
      //Save updated `todo` to Built.IO Backend
      newTodo.save()
        .then(function(data){
          $sa($scope, function(){
            $scope.todoList.splice(index,1,data);
          })
        });
    }

    /* Edit todo text */
    $scope.editTodoText = function(todo){
      var index = $scope.todoList.indexOf(todo);
      var text  = prompt("Todo Text", todo.get('text'));
      var newTodo = text && todo.set('text', text);
      if(newTodo){
        $scope.updateTodo(newTodo,index);
      }
    }

    /* Edit todo status */
    $scope.editTodoStatus = function(todo){
      var index   = $scope.todoList.indexOf(todo);
      var newTodo = todo.set('done',todo.get('done'));
      $scope.updateTodo(newTodo, index);
    }

  });

// Safely apply changes
function $sa(scope, fn) {
  (scope.$$phase || scope.$root.$$phase) ? fn() : scope.$apply(fn);
}