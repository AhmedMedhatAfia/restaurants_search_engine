var moment = require('moment');
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
                var closing_hr_24 = self.time12To24(data['closing_hr']);
                var opening_hr_24 = self.time12To24(data['opening_hr']);
                var hours_flag = 0;
                if(opening_hr_24 === closing_hr_24)
                    hours_flag = 1;
                else if(opening_hr_24 > closing_hr_24)
                    hours_flag = 2;

                csv_data+=
                    JSON.stringify({ "index" : { "_index" : es_index, "_type" : es_type, "_id" : data['id'] } }) +
                    '\n' +
                    JSON.stringify({ "id": data['id'], "name_en" : data['name_en'], "name_ar" : data['name_ar'], "opening_hr_12" : data['opening_hr'],"opening_hr_24" : opening_hr_24, "closing_hr_12" : data['closing_hr'], "closing_hr_24" : closing_hr_24,"hours_flag":hours_flag ,"reviews_count" : data['reviews_count']}) +
                    '\n';
            }).on("end", function(){
                elasticsearch_client.syncCsv(csv_data);
            });
    },
    time12To24: function (time12) {
        var momentObj = moment(time12, ["hh:mm:ss A"]);
        return parseInt(momentObj.format("HHmm"));
    }
};