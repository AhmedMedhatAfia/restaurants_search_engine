var fs = require("fs");
var csv = require("fast-csv");
var stream = fs.createReadStream(dataset_path);
var csv_data = '';
var elasticsearch_client = require('./elasticCon.js');

var self = module.exports = {
    parser: function (callback) {
        var csvStream = csv
            .fromStream(stream, {headers : true})
            .on("data", function(data){
                csv_data+=
                    JSON.stringify({ "index" : { "_index" : es_index, "_type" : es_type, "_id" : data['id'] } }) +
                    '\n' +
                    JSON.stringify({ "id": data['id'], "name_en" : data['name_en'], "name_ar" : data['name_ar'], "opening_hr" : data['opening_hr'], "closing_hr" : data['closing_hr'], "reviews_count" : data['reviews_count']}) +
                    '\n';
            }).on("end", function(){
                elasticsearch_client.syncCsv(csv_data);
            });
    }
};