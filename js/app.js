//APP
angular.module('todoApp',[])
	.constant('BuiltApp', Built.App('blta1d22ed99ebbf615'))
	.factory('todoData', function(BuiltApp){
		var builtQuery  = BuiltApp.Class('todos').Query();
			return builtQuery.exec()
					.then(function(objects){
						return objects;
					})
	})
  .controller('TodoListController', function($scope,BuiltApp,todoData) {

  	$scope.todoList = [];

  	todoData
  		.then(function(data){
  			if(data){
  				data.forEach(function(todo){
  					$scope.todoList.push(todo);
  				});
  				$scope.$apply();
  			}
  		});

  	/* Show number of incomplete todo in todoList */
  	$scope.remaining = function(){
  		return $scope.todoList.filter(function(todo){
  			if(!todo.done){
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
					$scope.todoList.push(data);
					$scope.todoText = '';
					$scope.$apply();
			});
  	}

  	/* Delete todo from todoList */
  	$scope.removeTodo = function(todo){
  		//Get index number of todo
  		var index = $scope.todoList.indexOf(todo);
  		//Delete from Built.IO Backend
  		todo.delete()
			.then(function(data){
				$scope.todoList.splice(index,1);
				$scope.$apply();
			});
  	}

  	/* Update todo and re-render */
  	$scope.updateTodo = function(updatedTodo,index){
			updatedTodo.save()
				.then(function(data){
					$scope.todoList.splice(index,1,data);
					$scope.$apply();
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
  	$scope.editTodoStatus = function(todo,index){
  		var index  = $scope.todoList.indexOf(todo); 
  		$scope.updateTodo(todo, index);
  	}

  	/* Delete all completed todo */
  	$scope.deleteAllCompleted = function(){
  		$scope.todoList = $scope.todoList.filter(function(todo){
  			if(!todo.done){
  				return todo;
  			}
  		});
  	}
  });