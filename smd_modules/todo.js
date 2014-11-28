var express = require('express');
var router = express.Router();
var moment = require('moment');

var Todo = require('../models.js').Todo;

// get all TODOS
router.get('/',function(req,res){

	console.log(moment().format('YYYY-MM-DD hh:mm:ss') + ' Before retrieving Todos... ');

	Todo.find(function(err,todos){
		if (err){
			console.log(moment().format('YYYY-MM-DD hh:mm:ss') + 'Error while retrieving Todos: ' + err);
			res.send(err);
		}
		console.log(moment().format('YYYY-MM-DD hh:mm:ss') + 'Number of todos found: ' + todos.length);
		res.json(todos); // return all todos in JSON format

	})
})

// create todo and send back all todos after creation
router.post('/',function(req,res){

	Todo.create({
		text: req.body.text,
		done: false
	}, function(err,todo){
		if (err){
			res.send(err);
		}

		// get and return all the todos after you create another todo
		Todo.find(function(err,todos){
			if(err){
				res.send(err);
			}
			res.json(todos);
		});

	});
});

// update a TODO and send back all todos after creation
router.post('/:id',function(req,res){

	Todo.update({_id:req.params.id},{text:req.body.text}, function(err,todo){
		if (err){
			res.send(err);
		}

		// get and return all the todos after you create another todo
		Todo.find(function(err,todos){
			if(err){
				res.send(err);
			}
			res.json(todos);
		});

	});
})

router.post('/switchcomplete/:id',function(req,res){	
	Todo.findById(req.params.id,function(err,todo){
		if (err){
			res.send('Error while finding by id: ' + err);
		}

		console.log('Switching COMPLETE state for [id=' + req.params.id + ',text='+todo.text+'] from ' + todo.done + ' to ' + !todo.done);

		Todo.update({_id:req.params.id},{done:!todo.done},function(err,todo){
			if (err){
				res.send('Error while switching complete: ' + err);
			}

			// get and return all the todos after you create another todo
			Todo.find(function(err,todos){
				if(err){
					res.send('Error while retrieving all tODOs: ' + err);
				}
				res.json(todos);
			});
		})
	})

})

// delete a TODO using his id abnd send back all todos
router.delete('/:id',function(req,res){
	console.log('Trying to remove todo with id ' + req.params.id);
	Todo.remove({_id:req.params.id}, function(err){
		if (err){
			res.send(err);
		}

		// get and return all the todos after you create another todo
		Todo.find(function(err,todos){
			if(err){
				res.send(err);
			}
			res.json(todos);
		});
	})
});

module.exports = router;