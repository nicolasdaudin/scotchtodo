var scotchTodo = angular.module('scotchTodo',[]);

function mainController($scope, $http){

	$scope.formData = {};	

	// when landing on the page, ge tall todos and show them
	$http.get('/api/todos')
		.success(function(data){
			$scope.todos = data;
			console.log(JSON.stringify(data));
		})
		.error(function(data){
			console.log('Error : ' + data);
		});

	// when submitting the add/modify form, 
	// -- if it's to add a todo: send the text to the node API
	// -- if it's to update a todo: send the id and the text to the node API
	$scope.createOrUpdateTodo = function(){
		
		if ($scope.formData._id == '' || $scope.formData._id == null){
			console.log('Creating this TODO: ' + JSON.stringify($scope.formData));
			$http.post('/api/todos',$scope.formData)
				.success(function(data){
					$scope.formData = {}; // clear the form so our user is ready to enter another thing
					$scope.todos = data;
					console.log(JSON.stringify(data));
				})
				.error(function(data){
					console.log('Error while creating a todo : ' + data);
				});
		} else {
			console.log('Updating this TODO: ' + JSON.stringify($scope.formData));
			$http.post('/api/todos/'+$scope.formData._id,$scope.formData)
				.success(function(data){
					$scope.formData = {}; // clear the form so our user is ready to enter another thing
					$scope.todos = data;
					console.log(JSON.stringify(data));
				})
				.error(function(data){
					console.log('Error while updating a todo : ' + data);
				});
		}
		
	};

	// complete a todo
	$scope.completeTodo = function(todoId){
		$http.post('/api/todos/switchcomplete/'+todoId)
			.success(function(data){
				$scope.formData = {}; // clear the form so our user is ready to enter another thing
				$scope.todos = data;
				console.log(JSON.stringify(data));
			})
			.error(function(data){
				console.log('Error while deleting a todo : ' + data);
			});
	}

	// delete a todo
	$scope.deleteTodo = function(todoId){
		$http.delete('/api/todos/'+todoId)
			.success(function(data){
				$scope.formData = {}; // clear the form so our user is ready to enter another thing
				$scope.todos = data;
				console.log(JSON.stringify(data));
			})
			.error(function(data){
				console.log('Error while deleting a todo : ' + data);
			});
	}

	// when clicking on "Modify" in front of a todo
	// update the form data with that todo's data
	$scope.editTodo = function(todoToEdit){
		$scope.formData = todoToEdit;		
		console.log('Todo to edit: ' + JSON.stringify(todoToEdit));
	};

	$scope.getClickBankStatsMonth = function(){
		$http.get('/clickbank/month')
				.success(function(data){					
					console.log('Clickbank month operation: success');
					console.log(JSON.stringify(data));
					$scope.clickbankResultMonth = data.accountData.quickStats.sale;
				})
				.error(function(data){
					console.log('Clickbank operation: ERROR');
				});

	}

	$scope.getClickBankStatsSumup = function(){
		$http.get('/clickbank/sumup')
				.success(function(data){					
					console.log('Clickbank sumup operation: success');
					console.log(JSON.stringify(data));
					$scope.cbSumup = data;
				})
				.error(function(data){
					console.log('Clickbank operation: ERROR');
				});

	}

}

