var express = require("express");
var router = express.Router();
var fs = require("fs");
var request = require("request");

var jobInfo = require("../models/jobInfo");
var userInfo = require("../models/userInfo");

// SEARCH: show the search page
router.get("/jobs", function (req, res) {
	res.render("SEARCH");
});

// EXAMPLE: jump to example result
router.get("/jobs/example", function (req, res) {
	var jobId = 'example';
	fs.exists('data/results/' + jobId + '.res', function (exists) {
		if (!exists) {
			res.render("404");
		}
		else {
			// ============================
			// analysis deepdom result data
			// ============================
			var results = [];
			var names = [];
			var arr = fs.readFileSync('data/upload/' + jobId + '_UPLOAD.fa').toString().replace(/^[\n|\r\n]*|[\n|\r\n]*$/g, '').split(/\r\n|\n\r|[\n\r]/);
			for (var i = 0; i < arr.length; i++)
				if (i % 2 == 0) {
					names.push(arr[i]);
				}

			var scores = [];
			arr = fs.readFileSync('data/results/' + jobId + '.res').toString().replace(/^[\n|\r\n]*|[\n|\r\n]*$/g, '').split(/\r\n|\n\r|[\n\r]/);
			for (var i = 0; i < arr.length; i++)
				if (i % 2 == 0) {
					var result = { name: arr[i], score: arr[i + 1] }
					results.push(result);
					// names.push(arr[i]);
					scores.push(arr[i + 1]);
				}

			var data = fs.readFileSync('data/input/' + jobId + '_INPUT.fa').toString().replace(/^[\n|\r\n]*|[\n|\r\n]*$/g, '').split(/\r\n|\n\r|[\n\r]/);
			var seq = [];
			var j = 0;
			for (var i = 0; i < results.length; i++) {
				var name = results[i].name;
				var s = "";
				var num = 0;
				while (j < data.length) {
					var tmp = data[j].lastIndexOf('_');
					var na = data[j].substring(0, tmp);

					if (name === na) {
						if (s != "") {
							if (num > 0) {
								s = s.substring(0, 80 * num);
							}
						}
						s += data[j + 1];
						j += 2;
						num++;
					}
					else {
						seq.push(s);
						s = "";
						break;
					}
				}
				if (s != "") seq.push(s);
			}
			res.render("EXAMPLE", { names: names, scores: scores, seq: seq, file: jobId + '.res', jobId: jobId });
		}
	});
});

// JOBSLIST: show all jos
router.get("/jobs/all", function (req, res) {
	jobInfo.find({ 'ipAddress': get_client_ip(req) }, function (err, docs) {
		if (err)
			console.error(err);
		userInfo.findOne({ 'ipAddress': get_client_ip(req) }, function (err, doc) {
			if (err)
				console.error(err);
			if (doc == undefined) {
				var user = new userInfo({
					ipAddress: get_client_ip(req),
					capacity: 0
				});
				user.save(function (err, u) {
					if (err)
						console.error(err);
					else {
						console.log("Create a new user: " + get_client_ip(req));
						console.log("======================================");
					}
				})
				// ------------------
				// get user location
				// ------------------
				// var locURL = "/process/location/";
				// var locData = { ip: get_client_ip(req) };
				request("http://ip-api.com/json/" + get_client_ip(req) + "?lang=EN", { json: true }, (err, res, body) => {
					if (err) { return console.log(err); }
					var update = { $set: { lat: body.lat, lon: body.lon } };
					userInfo.updateOne({ 'ipAddress': body.query }, update, function (err, u) {
						if (err)
							console.log(err);
						else {
							console.log("User info was updated!");
							console.log("User location: " + body.lat + ", " + body.lon);
							console.log("======================================");
						}
					});
				});
				// $.post(locURL, locData, function (data, status) {
				// 	console.log("get user location");
				// });
				res.render("JOBSLIST", { docs: docs, ip: get_client_ip(req), capacity: 0 });
			}
			else res.render("JOBSLIST", { docs: docs, ip: get_client_ip(req), capacity: doc.capacity });
		});
	});
});

// SHOW: show result
router.get("/jobs/:id", function (req, res) {
	var jobId = req.params.id;
	jobId = jobId.substr(1);

	// var file = jobId + '.res';

	fs.exists('data/results/' + jobId + '.res', function (exists) {
		if (!exists) {
			res.render("404");
		}
		else {
			// ============================
			// analysis deepdom result data
			// ============================
			var results = [];
			var names = [];
			var arr = fs.readFileSync('data/upload/' + jobId + '.fa').toString().replace(/^[\n|\r\n]*|[\n|\r\n]*$/g, '').split(/\r\n|\n\r|[\n\r]/);
			for (var i = 0; i < arr.length; i++)
				if (i % 2 == 0) {
					names.push(arr[i]);
				}

			var scores = [];
			arr = fs.readFileSync('data/results/' + jobId + '.res').toString().replace(/^[\n|\r\n]*|[\n|\r\n]*$/g, '').split(/\r\n|\n\r|[\n\r]/);
			for (var i = 0; i < arr.length; i++)
				if (i % 2 == 0) {
					var result = { name: arr[i], score: arr[i + 1] }
					results.push(result);
					// names.push(arr[i]);
					scores.push(arr[i + 1]);
				}

			var data = fs.readFileSync('data/input/' + jobId + '.fa').toString().replace(/^[\n|\r\n]*|[\n|\r\n]*$/g, '').split(/\r\n|\n\r|[\n\r]/);
			var seq = [];
			var j = 0;
			for (var i = 0; i < results.length; i++) {
				var name = results[i].name;
				var s = "";
				var num = 0;
				while (j < data.length) {
					var tmp = data[j].lastIndexOf('_');
					var na = data[j].substring(0, tmp);

					if (name === na) {
						if (s != "") {
							if (num > 0) {
								s = s.substring(0, 80 * num);
							}
						}
						s += data[j + 1];
						j += 2;
						num++;
					}
					else {
						seq.push(s);
						s = "";
						break;
					}
				}
				if (s != "") seq.push(s);
			}
			// console.log(seq);
			// names.length--;
			// console.log(names);
			// scores.length--;
			// console.log(scores);

			res.render("SHOW", { names: names, scores: scores, seq: seq, file: jobId + '.res', jobId: jobId });
			// fs.readFile('data/results/' + file, function (err, data) {
			// 	if (err) {
			// 		return console.log(err);
			// 	}
			// 	arr = data.toString().split('\n');
			// 	for (var i = 0; i < arr.length; i++)
			// 		if (i % 2 == 0) {
			// 			var result = { name: arr[i], score: arr[i + 1] }
			// 			results.push(result);
			// 		}
			// 	// console.log(results);
			// 	res.render("SHOW", { results: results, seq: seq, file: file });
			// });
		}
	});
});

// DOWNLOAD: download the result file
router.get("/jobs/download/:id", function (req, res) {
	var file = req.params.id.substr(1);
	res.download("data/results/" + file);
});

// DELETE: delete the selected job
router.post("/jobs/delete/:id", function (req, res) {
	var job = req.params.id.substr(1);
	// console.log(job);

	// update user capacity
	var fileSize = 0;
	fs.stat('data/upload/' + job + '.fa', function (err, stats) {
		if (err)
			return console.error(err);
		fileSize = stats.size;
	});
	userInfo.findOne({ 'ipAddress': get_client_ip(req) }, function (err, doc) {
		if (err)
			console.error(err);
		if (doc != undefined) {
			// var update = { $set: { capacity: 0 } };
			var update = { $set: { capacity: doc.capacity - fileSize } };
			userInfo.updateOne({ 'ipAddress': get_client_ip(req) }, update, function (err, u) {
				if (err)
					console.log(err);
				else {
					console.log("User info was updated!");
					console.log("User Size: " + (doc.capacity - fileSize));
				}
			});
		}
	});

	// delete jobs
	jobInfo.findOne({ _id: job }, function (err, doc) {
		if (err)
			return console.error(err);
		if (doc != undefined) {
			var dFile = doc.file;
			fs.unlink('data/input/' + dFile, function (err) {
				if (err) console.error(err);
			});
			fs.unlink('data/results/' + doc.id + '.res', function (err) {
				if (err) console.error(err);
			});
			fs.unlink('data/upload/' + dFile, function (err) {
				if (err) console.error(err);
			});
			fs.unlink('data/SCOP/' + doc.id + '_SCOP.csv', function (err) {
				if (err) console.error(err);
			});
			fs.unlink('data/CATH/' + doc.id + '_CATH.csv', function (err) {
				if (err) console.error(err);
			});
		}
		return console.log("Delete files of the job: " + job);
	});
	jobInfo.deleteOne({ _id: job }, function (err) {
		if (err)
			return console.error(err);
		console.log("Delete log of the job:" + job);
		return console.log("======================================");
	});
});

function get_client_ip(req) {
	var ipStr = req.ip.split(':');
	return ipStr[ipStr.length - 1];
};

module.exports = router;