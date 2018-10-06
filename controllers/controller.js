module.exports = function(app, urlencodedParser, con){


	app.get('/', function(req, res){
		res.render('index', {mysession : req.session.name, mystatus : req.session.status});
	});


	app.post('/registration', urlencodedParser, function(req, res){
		//console.log(req.body);
		if(req.session.name != null){
			res.redirect('/');
		}
		var acNumber = Math.floor(100000 + Math.random() * 900000000000).toString();
		var pin = Math.floor(100000 + Math.random() * 900);
		var sql = "INSERT into registration (id, name, email, password, contact, gender, ac_number, branch, pin, present_amount, status) values ('','"+req.body.name+"','"+req.body.email+"','"+req.body.password+"','"+req.body.contact_no+"','"+req.body.gender+"','"+acNumber+"','Vishrambagh','"+pin+"', '"+0+"','"+401+"')";
			con.query(sql, function(err){
				if(err) throw err;
				console.log("1 record inserted");
				res.redirect('/regsuccess');
			});
	});


	app.get('/regsuccess', function(req, res){
		res.render('regsuccess');
	});


	app.post('/login', urlencodedParser, function(req, res){
		if(req.session.name != null){
			res.redirect('/');
		}
		var sql = "select * from registration where email ='"+req.body.email+"' and password = '"+req.body.password+"'";
		con.query(sql, function(err, result, field){
				if(err) throw err;
				if(result.length > 0){
					req.session.name = result[0].name;
					req.session.status = result[0].status;
					req.session.acNumber = result[0].ac_number;
					req.session.pin = result[0].pin;
					req.session.branch = result[0].branch;
					req.session.presentAmount = result[0].present_amount;

					res.redirect('/');
				}
				else{
					res.render('loginunsuccess');
				}
			});
	});



	app.get('/logout', function(req, res){
		if(req.session.name == null){
			res.redirect('/');
		}
		req.session.destroy();
		res.redirect('/');
	});


	app.get('/transaction', function(req, res){
		if(req.session.name == null){
			res.redirect('/');
		}
		res.render('transaction', {mysession : req.session.name, mystatus : req.session.status});
	});


	app.get('/transDetails', function(req, res){
		
	});

	app.post('/transaction', urlencodedParser, function(req, res){
		var sql = "select * from transaction where ac_number = '"+req.body.acNumber+"'";
		var temp = [];
		var data1;
		con.query(sql, function(err, result, field){
				if(err) throw err;
				if(result.length > 0){
					var i = 0;
					while (i < result.length) {
						temp.push(result[i]);
						i++;
					}
				}
				else{
					var data = {data :"No Transaction yet"};
					temp.push(data);
				}
				res.render('transDetails', {data : temp, mysession : req.session.name, mystatus : req.session.status});
			});
	});


	app.get('/profile', function(req, res){
		if(req.session.name == null){
			res.redirect('/');
		}
		var sql = "select * from registration where name = '"+req.session.name+"'";
		con.query(sql, function(err, result, field){
			if(err) throw err;
			if(result.length > 0){
				var acNumber = result[0].ac_number;
				var branch = result[0].branch;
				var pin = result[0].pin;
				var presentAmount = result[0].present_amount;
			}
			res.render('profile', {mysession : req.session.name, mystatus : req.session.status, myacnumber : req.session.acNumber, mypin : pin, mybranch : branch, mypresentAmount : presentAmount});
		});
	});

	app.get('/deposit', function(req, res){
		if(req.session.name == null && req.session.status == 401){
			res.redirect('/');
		}
		res.render('deposit', {mysession : req.session.name, mystatus : req.session.status});
	});

	app.post('/deposit',  urlencodedParser, function(req, res){
		var sql = "select * from registration where ac_number='"+req.body.acNumber+"' and pin='"+req.body.pin+"'";
		con.query(sql, function(err, result, field){
			if(err) throw err;
			if(result.length > 0){
				res.render('doDeposit', {mysession : req.session.name, mystatus : req.session.status, acNumber : req.body.acNumber});
			}
			else{
				console.log('error');
			}
		});
	});

	app.post('/doDeposit', urlencodedParser, function(req, res){
		var sql = "select * from registration where ac_number='"+req.body.acNumber+"'";
		con.query(sql, function(err, result, field){
			if(err) throw err;
			if(result.length > 0){
				var presentAmount = result[0].present_amount;
				if((parseInt(presentAmount) + parseInt(req.body.amount)) > 0){
					var now = parseInt(presentAmount) + parseInt(req.body.amount);
					var sql2 = "insert into transaction values('"+req.body.acNumber+"', '', '"+req.body.amount+"', '"+now+"')";
					con.query(sql2, function(err, result, field){
						if(err) throw err;
						else{
							var sql3 = "update registration set present_amount = '"+now+"' where ac_number = '"+req.body.acNumber+"'";
							con.query(sql3, function(err, result, field){
								if(err) throw err;
								res.render('depsuccess');
							});
						}
					});
				}
			}
		});
	});


	app.get('/withdrawal', function(req, res){
		if(req.session.name == null || req.session.status == 401){
			//res.writeHead(200, {'Contant-Type' : 'text/html'});
			res.redirect('/');
		}
		res.render('withdrawal', {mysession : req.session.name, mystatus : req.session.status});
	});


	app.post('/withdrawal', urlencodedParser, function(req, res){
		var sql = "select * from registration where ac_number='"+req.body.acNumber+"' and pin='"+req.body.pin+"'";
		con.query(sql, function(err, result, field){
			if(err) throw err;
			if(result.length > 0){
				res.render('doWithdrawal', {mysession : req.session.name, mystatus : req.session.status, acNumber : req.body.acNumber});
			}
			else{
				console.log('error');
			}
		});
	});


	app.post('/doWithdrawal', urlencodedParser, function(req, res){
		var sql = "select * from registration where ac_number='"+req.body.acNumber+"'";
		con.query(sql, function(err, result, field){
			if(err) throw err;
			if(result.length > 0){
				var presentAmount = result[0].present_amount;
				if((parseInt(presentAmount) - parseInt(req.body.amount)) > 0){
					var now = parseInt(presentAmount) - parseInt(req.body.amount);
					var sql2 = "insert into transaction values('"+req.body.acNumber+"', '"+req.body.amount+"', '', '"+now+"')";
					con.query(sql2, function(err, result, field){
						if(err) throw err;
						else{
							var sql3 = "update registration set present_amount = '"+now+"' where ac_number = '"+req.body.acNumber+"'";
							con.query(sql3, function(err, result, field){
								if(err) throw err;
								res.render('withdrawalsuccess');
							});
						}
					});
				}
				else{
					res.render('withdrawalno');
				}
			}
		});
	});

}