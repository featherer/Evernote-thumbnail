var express = require('express');
var router = express.Router();
var fs = require('fs');
var https = require('https');
var querystring = require('querystring');
var Evernote = require('evernote').Evernote;
// var bodyParser = require('body-parser');

router.post('/', function(req, res, next) {
	var developerToken = "S=s1:U=9124c:E=155e401b3fb:C=14e8c5084e0:P=1cd:A=en-devtoken:V=2:H=5087ce2ab38dae7b8f3f048b99bc738b";
	var client = new Evernote.Client({token: developerToken});
	var noteStore = client.getNoteStore();
	var filter = new Evernote.NoteFilter();
	var spec = new Evernote.NotesMetadataResultSpec({includeTitle: true});
	var guidList = [];

	function getImage (option, postData, path, name) {
		return new Promise(function (resolve, reject) {
			var req = https.request(option, function (res) {
				var imgData = '';
				res.setEncoding('binary');
				res.on('data', function (chunk) {
					imgData += chunk;
				})
				res.on('end', function () {
					fs.writeFileSync(path + name, imgData, 'binary', function (err) {
						reject(err);
					})
					resolve((path + name).replace('public', 'static'));
				}) 
			})
			req.write(postData);
			req.end();
		})	
	}
	function getAllImage(guidList) {
		var length = guidList.length;
		var postData = querystring.stringify({auth: developerToken});
		var promises = guidList.map(function (v, i) {
			return getImage({
				host: 'sandbox.evernote.com',
				path: '/shard/s1/thm/note/' + guidList[i] + '.png',
				port: 443,
				method: 'post',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
					'Content-Length': postData.length
				}
			}, postData, 'public/images/', i + '.png');
		})
		Promise.all(promises).then(function (data) {
			res.send(data);
		})
	}

	noteStore.findNotesMetadata(filter, 0, 100, spec, function(err, notes) {
		var guid, length = (notes && notes.totalNotes) || 0;
		for(var i = 0; i < length; i++) {
			guid = notes.notes[i].guid;
			guidList.push(guid);
		}
		getAllImage(guidList);
	})
});

router.get('/', function (req, res, next) {
	res.render('index')
});

module.exports = router;
