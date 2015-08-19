// This line informs Extensions to use the latest version of SDK i.e. v2
Built.Extension.setVersion(2);
Built.Extension.define('verifyEmail', function(request, response) {
	console.log('Email',request.params.email)
  return response.success('Hello World');
});
