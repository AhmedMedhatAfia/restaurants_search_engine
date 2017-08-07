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
                    JSON.stringify({ "id": data['id'], "name_en" : data['name_en'], "name_ar" : data['name_ar'], "opening_hr_12" : data['opening_hr'],"opening_hr_24" : self.time(data['opening_hr']), "closing_hr_12" : data['closing_hr'], "closing_hr_24" : self.time(data['closing_hr']), "reviews_count" : data['reviews_count']}) +
                    '\n';
            }).on("end", function(){
                elasticsearch_client.syncCsv(csv_data);
            });
    },
    time: function (time) {
        var hours = Number(time.match(/^(\d+)/)[1]);
        var minutes = Number(time.match(/:(\d+)/)[1]);
        var AMPM = time.match(/\s(.*)$/)[1];
        if(AMPM == "PM" && hours<12) hours = hours+12;
        if(AMPM == "AM" && hours==12) hours = hours-12;
        var sHours = hours.toString();
        var sMinutes = minutes.toString();
        if(hours<10) sHours = "0" + sHours;
        if(minutes<10) sMinutes = "0" + sMinutes;
        return sHours + ":" + sMinutes;
    }
};