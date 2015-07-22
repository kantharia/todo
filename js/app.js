//Initialize Built.io Backend Application
var BuiltApp   = Built.App('blta1d22ed99ebbf615');

//Create `todoApp` AngularJS module
angular.module('todoApp',[])
  .controller('TodoListController', function($scope) {

    $scope.taskList = [];

    /*
      Populate `taskList`
      ===================
      Fetch data from Built.io Backend's
    */
    
      // `BuiltClass` is an instance of Backend class. 
      var BuiltClass = BuiltApp.Class('tasks');

      // `builtQuery` is an instance of Backend's Query.
      var builtQuery = BuiltClass.Query();

      // Execute builtQuery
      builtQuery.exec()
        .then(function(objects){
          $sa($scope, function(){
            $scope.taskList = objects
          });
        });


    /* Add new task in taskList */
    $scope.addTask = function(){
      
      /* 
        Save task object to Built.io Backend
      */
        
        // BuiltApp.Class('class_name').Object returns a Object constructor
        var Task = BuiltApp.Class('tasks').Object;

        // `newTask` is Object of `Task` constructor
        var newTask = Task({
          task_text   : $scope.taskText,
          task_status : false
        })

        // `newTask` save method create new Object in Built.IO Backend's `tasks` Class
        newTask.save()
          // save method return's a promise
          .then(function(responseObj){
            console.log('responseObj', responseObj);
            // On success `responseObj` return a Built.IO Backend's Object we just created
            $sa($scope, function(){
              // add `responseObj` to our `$scope.todoList`
              $scope.taskList.push(responseObj);
              // clear the input text on html form
              $scope.taskText = '';
            })
          })
    }

    /* Delete task */
    $scope.removeTask = function(task){
      //Get index number of task
      var index = $scope.taskList.indexOf(task);
      //Delete from Built.IO Backend
      task.delete()
      .then(function(){
        $sa($scope, function(){
          // Delete task from taskList
          $scope.taskList.splice(index,1);
        })
      });
    }

    /* Update task */
    $scope.updateTask = function(newTask,index){ 
      //Save updated `task` to Built.IO Backend
      newTask.save()
        .then(function(data){
          $sa($scope, function(){
            $scope.taskList.splice(index,1,data);
          })
        });
    }

    /* Edit task text */
    $scope.editTaskText = function(task){
      var index   = $scope.taskList.indexOf(task);
      var text    = prompt("Task Text", task.get('task_text'));
      var newTask = text && task.set('task_text', text);
      if(newTask){
        $scope.updateTask(newTask,index);
      }
    }

    /* Edit task status */
    $scope.editTaskStatus = function(task){
      var index   = $scope.taskList.indexOf(task);
      console.log('status', task.get('task_status'));
      var newTask = task.set('task_status',task.get('task_status'));
      $scope.updateTask(newTask, index);
    }

  });

// Safely apply changes
function $sa(scope, fn) {
  (scope.$$phase || scope.$root.$$phase) ? fn() : scope.$apply(fn);
}