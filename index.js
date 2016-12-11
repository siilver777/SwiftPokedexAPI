var express = require('express');
var fs = require('fs');
var sqlite3 = require('sqlite3').verbose();

var app = express();

app.get('/pokemons/', function(req, res) {
	var db = new sqlite3.Database('poke.db');

	var pokemons = [];

	db.serialize(function() {
		db.each("SELECT rowid AS id, name FROM pokemons ORDER BY rowid", function(err, row) {
			if (err) {
				console.error(err);
			}
			else {
				console.log(row.id + ": " + row.name);
				pokemons.push({
					'id': row.id,
					'name': row.name
				});
			}
		}, function() {
			res.setHeader('Content-Type', 'application/json');
			res.send(JSON.stringify(pokemons));
		});
	});
	db.close();
});

app.get('/pokemons/:no/', function(req, res) {
	var db = new sqlite3.Database('poke.db');

	db.serialize(function() {
		db.get("SELECT pokemons.rowid AS id, pokemons.name, description, height, weight, type1.rowid AS type1_id, type1.name AS type1_name, type2.rowid AS type2_id, type2.name AS type2_name, pv, atk, def, atkspe, defspe, vit FROM pokemons LEFT JOIN stats ON pokemons.rowid = stats.id LEFT JOIN types AS type1 ON pokemons.type1 = type1.rowid LEFT JOIN types AS type2 ON pokemons.type2 = type2.rowid WHERE pokemons.rowid = "+req.params.no, function(err, row) {

			// Base pokémon
			var pokemon = {
				'id': row.id,
				'name': row.name,
				'description': row.description,
				'height': row.height,
				'weight': row.weight
			};

			// types
			var types = [];
			console.log(row.type1_id);
			console.log(row.type1_name);
			console.log(row.type2_id);
			console.log(row.type2_name);
			if (row.type1_id != null) {
				types.push({
					'id': row.type1_id,
					'name': row.type1_name
				});
			}
			if (row.type2_id != null) {
				types.push({
					'id': row.type2_id,
					'name': row.type2_name
				});
			}
			pokemon['types'] = types;

			// stats
			var stats = {
				'pv': row.pv,
				'atk': row.atk,
				'def': row.def,
				'atkspe': row.atkspe,
				'defspe': row.defspe,
				'vit': row.vit
			};
			pokemon['stats'] = stats;

			res.setHeader('Content-Type', 'application/json');
			res.send(JSON.stringify(pokemon));
		});
	});

	db.close();
});

app.get('/artworks/:no/', function(req, res) {
	fs.readFile('artworks/'+req.params.no+'.png', function(err, contents) {
		if (err) {
			res.sendStatus(404);
		}
		else {
			res.setHeader('Content-Type', 'image/png');
			res.end(contents, 'binary');
		}
	})
});

app.get('/minis/:no/', function(req, res) {
	fs.readFile('minis/'+req.params.no+'.png', function(err, contents) {
		if (err) {
			res.sendStatus(404);
		}
		else {
			res.setHeader('Content-Type', 'image/png');
			res.end(contents, 'binary');
		}
	})
});

app.get('/sounds/:no/', function(req, res) {
	fs.readFile('sounds/'+req.params.no+'.mp3', function(err, contents) {
		if (err) {
			res.sendStatus(404);
		}
		else {
			res.setHeader('Content-Type', 'audio/mpeg');
			res.end(contents, 'binary');
		}
	})
});

app.listen(8080);
