//APP
angular.module('todoApp',[])
	.constant('BuiltApp', Built.App('blta1d22ed99ebbf615'))
	.factory('todoData', function(BuiltApp){
		/* 
			Initially Fetch All Todo Data From 
			Built.IO Backend Using SDK Query 
		*/
		var builtQuery  = BuiltApp.Class('todos').Query();
			return builtQuery.exec()
				.then(function(objects){
					return objects;
				})
	})
  .controller('TodoListController', function($scope,BuiltApp,todoData) {

  	$scope.todoList = [];
  	$scope.preloader = true; //Show Loader Animation

  	/* Populate todoList */
  	todoData
  		.then(function(allTodoItems){
  			if(allTodoItems){
  				$scope.todoList = allTodoItems;
          $sa($scope, function(){
            $scope.preloader = false; //Hide Loader Animation
          });
  			}
  		});

  	/* Show number of incomplete todo in todoList */
  	$scope.remaining = function(){
  		return $scope.todoList.filter(function(todo){
  			if(!todo.get('done')){
  				return todo;
  			}
  		}).length;
  	};

  	/* Add new todo in todoList */
  	$scope.addTodo = function(){
  		//create todo object
  		var todo = {text:$scope.todoText, done:false};
  		
  		//Save todo object to Built.io Backend
  		BuiltApp.Class('todos')
  			.Object(todo)
				.save()
				.then(function(data){
          $sa($scope, function (){
            $scope.todoList.push(data);
            $scope.todoText = '';
          });
			});
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

  	/* Update todo and re-render */
  	$scope.updateTodo = function(updatedTodo,index){
  		//Save updated `todo` to Built.IO Backend
			updatedTodo.save()
				.then(function(data){
          $sa($scope, function(){
            $scope.todoList.splice(index,1,data);
          })
  			});
  	}

  	/* Edit todo text */
  	$scope.editTodoText = function(todo){
  		var index = $scope.todoList.indexOf(todo);
  		var text 	= prompt("Todo Text", todo.get('text'));
  		var updatedTodo = text && todo.set('text', text);
  		if(updatedTodo){
  			$scope.updateTodo(updatedTodo,index);
  		}
  	}

  	/* Edit todo status */
  	$scope.editTodoStatus = function(todo){
      var index   = $scope.todoList.indexOf(todo);
  		var newTodo = todo.set('done',todo.get('done'));
  		$scope.updateTodo(newTodo, index);
  	}

  });

// Safe apply
function $sa(scope, fn) {
  (scope.$$phase || scope.$root.$$phase) ? fn() : scope.$apply(fn);
}