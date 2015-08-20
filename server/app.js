// This line informs Extensions to use the latest version of SDK i.e. v2
Built.Extension.setVersion(2);

/*
 Will trigger before saving object to class
*/
Built.Extension.beforeSave('tasks', function(request, response) {
  //Check event-type for create and update
  if(request.event === 'create' || request.event === 'update'){
    var taskText = request.object.get('task_text');
    console.error('taskText', taskText);
    if(!taskText){
      return response.error()
    } else {
      return response.success();
    }
  }
});

/*
  Will trigger after saving object to class
*/
Built.Extension.afterSave('tasks', function(request, response) {
  //Create an instance of Analytic Event
  var tasksEvent = new Built.Analytics.Event('task_saved');
  tasksEvent.trigger({
    onSuccess: function() {
      console.log('Task Created');
      // successfully triggered
      return response.success();
    }
  });
})