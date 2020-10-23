var config = require("./config.js");
var utility = require("./utility.js");


const fs = require('fs');
const https = require('https');
const http = require('https');
const { Sequelize, Model, DataTypes } = require('sequelize');
var path = require('path');

//Geo library
var proj4 = require('proj4');


module.exports = {
    load_routes(app,database) {
        app.get("/data_csv/postalcodes", function (req, res) {
            res.send(JSON.stringify(utility.get_postalcodes()));
        });


        app.get("/data_csv/countries", function (req, res) {
            res.send(JSON.stringify(utility.get_countries()));
        });

        app.get("/data_csv/postalcodes", function (req, res) {
            res.send(JSON.stringify(utility.get_postalcodes()));
        });

        app.post("/data_csv/cities", function (req, res) {
            var postalcode = req.body.postalcode;
            utility.get_cities_by_postalcode(postalcode, function (result) {
                res.send(JSON.stringify(result));
            });

        });

        app.post("/search_service_levels", function (req, res) {
            var position = req.body.position;

            //WGS84
            proj4.defs("EPSG:4326", "+proj=longlat +datum=WGS84 +no_defs");
            //ETRS89 LAEA
            proj4.defs("EPSG:3035", "+proj=laea +lat_0=52 +lon_0=10 +x_0=4321000 +y_0=3210000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");

            var x = parseFloat(position.lng);
            var y = parseFloat(position.lat);
            var convertedCoords = proj4("EPSG:4326", "EPSG:3035", [x, y]);

            var x = convertedCoords[0];
            var y = convertedCoords[1];
            var delta = 100;
            sql = "SELECT * FROM internetServiceLevels WHERE ( \
              (xCoord>"  + (x - delta).toString() + " AND xCoord<" + (x + delta).toString() + ") AND \
              (yCoord>" + (y - delta).toString() + " AND yCoord<" + (y + delta).toString() + "));";

            database.execute_raw_query(sql, function (results, metadata) {
                res.send(results);
            });

        });

    }
}