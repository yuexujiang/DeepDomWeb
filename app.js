var express = require("express"),
	app = express(),
	bodyParser = require("body-parser"),
	mongoose = require("mongoose");

var uploadsRoutes = require("./routes/uploads"),
	jobsRoutes = require("./routes/jobs"),
	resultsRoutes = require("./routes/results"),
	indexRoutes = require("./routes/index"),
	processRoutes = require("./routes/process");

mongoose.connect("mongodb://localhost/deepdom");

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static('assets'))

app.use(indexRoutes);
app.use(uploadsRoutes);
app.use(jobsRoutes);
app.use(processRoutes);
app.use(resultsRoutes);

app.get("*", function (req, res) {
	res.render("404");
});

app.listen(3000, process.env.IP, function () {
	console.log("The DeepDom Server Has Started At: http://localhost:3000/");
	console.log("");
})