//Initialize Built.io Backend Application
var BuiltApp   = Built.App('blta1d22ed99ebbf615');

//Create `todoApp` AngularJS module added `ngRoute` as dependency
angular.module('todoApp',['ngRoute'])
  .config(['$routeProvider','$locationProvider', function($routeProvider, $locationProvider){
    $routeProvider
      .when('/', {
        templateUrl : 'template/sign-in.html',
        controller  : 'SignInController'
      })
      .when('/sign-up', {
        templateUrl : 'template/sign-up.html',
        controller  : 'SignUpController'
      })
      .when('/todo', {
        templateUrl : 'template/todo.html',
        controller  : 'TodoListController'
      })
      .when('/google_login', {
        templateUrl : 'template/google-login.html',
        controller  : 'GoogleLoginController'
      })
  }])
  .controller('TodoListController', function($scope, $rootScope, $location, $timeout) {
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

      /* 
        First get current user 
        and then execute builtQuery 
      */
      BuiltApp.User.getCurrentUser()
        .then(function(user){
          var uid = user.toJSON().uid;
          builtQuery = builtQuery.where('app_user_object_uid', uid);
          builtQuery
            .exec()
            .then(function(data){
              $sa($scope, function(){
               /* Populate taskList */
                $scope.taskList = data;
              });
            })
        }, function(){
          /* If current user is null, redirect to '/' sign-in route */
          $timeout(function(){
            $location.path('/')
          },0);
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
  })
  .controller('SignInController', function($scope, $location, $rootScope){
    /* Redirect to `todo` route when user is present */
    if ($scope.user){
      return $location.path('/todo');
    }

    /*
      User Sign-In method
    */
    $scope.signIn = function(){
      /* Create a `user` instance from SDK User constructor */
      var user = BuiltApp.User();

      /* Built.io Backend - login method */
      user.login($scope.email, $scope.password)
        .then(function(data){
          /* 
            Set user on rootscope so It can be accessible to other controller 
          */
          $rootScope.setUser(data.toJSON());

          /*
            If user logs in successfully redirect to `/todo` route
          */
          $sa($scope, function(){
            $location.path('/todo');
          })

        }, function(error){
          /*
            If user log-in fails set `$scope.signInStatus`
            This is show error message on log-in route.
          */
          $sa($scope, function(){
            $scope.signInStatus = {"status": false, "message" : "Sign-In failed."}
          })
        });
    }


    /*
      Sign-in user with Google
    */
    $scope.signInWithGoogle = function(){
      //
      var e = function(u) {return encodeURIComponent(u);}
      var base = 'https://accounts.google.com/o/oauth2/auth';
      var response_type = e('token');
      var client_id = e('322741339463-m02mbf2ikp9oc9bb930lh8h70hq8s4k0.apps.googleusercontent.com');
      var redirect_uri = e(document.URL.split("/#")[0] + '/google_oauth_callback.html');
      var scope = e('https://www.googleapis.com/auth/userinfo.email');
      var state = e('lollalal');
      var approval_prompt = e('auto');
      var hd = 'raweng.com';

      base = base +
        '?response_type=' + response_type +
        '&client_id=' + client_id +
        '&redirect_uri=' + redirect_uri +
        '&scope=' + scope +
        '&state=' + state +
        '&approval_prompt=' + approval_prompt; 
        // + '&hd=' + hd;

      window.location.href = base;
      return false;
    }
  })  
  .controller('SignUpController', function($scope){
    /* Built.IO Backend Application User Sign-Up/Register */
    $scope.signUp = function(){
      /* Create `user` Object */
      var user = BuiltApp.User();
      /* User Registeration */
      user.register($scope.email, $scope.password1, $scope.password2)
        .then(function(data){
          console.log('Data', data);
          /* Clear Form Elements */
          $sa($scope, function(){
            $scope.email = "";
            $scope.password1 = "";
            $scope.password2 = "";
          })
        }, function(err){
          console.log('Error',err);
        })
    }
  })
  .controller('GoogleLoginController', function($scope,$routeParams, $rootScope, $location){
    /* Get token from Query Params */
    var google_token = $routeParams.google_token;

    var user = BuiltApp.User();
    
    /*
      SDK method accepts google auth token
    */
    user.loginWithGoogle(google_token)
      .then(function(user){
        $rootScope.setUser(user.toJSON());
        $sa($scope, function(){
          $location.path('/todo');
        })
      }, function(error){
        $sa($scope, function(){
          $scope.signInStatus = {"status": false, "message" : "Sign-In with Google failed."}
        })
      })
  })
  .run(['$rootScope','$location', function($rootScope, $location){
      /* Set User on a `$rootScope` */
      $rootScope.setUser = function(user){
        console.log('setUser', user);
        $rootScope.user = user;
      }

      /* Delete User Information */
      $rootScope.clearUser = function(){
        delete $rootScope.user;
      }

      /* 
        Logout current user and redirect to `/` route 
      */
      $rootScope.logout = function(){
          BuiltApp.User.getCurrentUser()
            .then(function(user){
              return user.logout();
            })
            .then(function(res){
              BuiltApp.User.clearSession;
              $sa($rootScope, function() {
                $rootScope.clearUser();
                $location.path('/');
              });
            }, function (err){
              console.log('Error : ', err);
              $sa($rootScope, function() {
                $rootScope.clearUser();
                $location.path('/');
              });
            });
      }

      /*
        If current user is present redirect to `/profile` route
      */
      BuiltApp.User.getCurrentUser()
        .then(function(data){
          $sa($rootScope, function(){
            $rootScope.setUser(data.toJSON());
            $location.path('/todo');
          });
        }, function(error){
          console.log('Please Login Again.');
        });
  }])

// Safely apply changes
function $sa(scope, fn) {
  (scope.$$phase || scope.$root.$$phase) ? fn() : scope.$apply(fn);
}