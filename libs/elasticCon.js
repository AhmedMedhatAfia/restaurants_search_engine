var elasticsearch=require('elasticsearch');
var esclient = new elasticsearch.Client( {
    hosts: [
        'http://'+es_address+':'+es_port
    ]
});

var self = module.exports = {
    deploy : function(callback) {
            self.deleteIndex(callback);
    },
    deleteIndex : function (callback) {
        esclient.indices.delete({index: es_index},function(err,resp,status) {
            if (err)
                console.log('its a first time to create index');
            else
                console.log("delete", resp);
            self.createIndex(callback);
        });
    },
    createIndex : function (callback) {
        esclient.indices.create({ index: es_index},function(err,resp,status) {
            if (err)
                console.log(err);
            else
                console.log("create", resp);
            self.putMapping(callback);
        });
    },
    putMapping : function (callback) {
        esclient.indices.putMapping({
            index: es_index, type: es_type,
            body: {
                properties: {
                    'id': {'type': 'integer'},
                    'name_en': {'type': 'text'},
                    'name_ar': {'type': 'text'},
                    'opening_hr_12': {'type': 'date', 'format': 'HH:mm:ss a'},
                    'closing_hr_12': {'type': 'date', 'format': 'HH:mm:ss a'},
                    'opening_hr_24': {'type': 'date', 'format': 'HH:mm'},
                    'closing_hr_24': {'type': 'date', 'format': 'HH:mm'},
                    'reviews_count': {'type': 'integer'},
                }
            }
        },function(err,resp,status){
            if(err)
                console.log(err);
            else
                console.log("put mapping & create type",resp);

            callback();
        });
    },
    syncCsv : function (data) {
            esclient.bulk({
                index: es_index,
                type: es_type,
                body: data
            },function(err,resp,status) {
                if(err)
                    console.log(err);
                else
                    console.log("index restaurants",resp);
            });
    },
    search : function (word,page,copyRequest) {
        var condition = [];
        if(word){
            condition = [
                {
                    "multi_match" : {
                        "query":      word,
                        "type":       "phrase_prefix",
                        "fields":     [ "name_en", "name_ar" ],
                        "tie_breaker": 0.3,
                        "minimum_should_match": "30%"
                    }
                }
            ];
        }
        esclient.search({
            index: es_index,
            type: es_type,
            body: {
                from : (page * number_restaurants_per_page) - number_restaurants_per_page,
                size : number_restaurants_per_page,
                sort : [
                    { "reviews_count" : {"order" : "desc"}},
                ],
                query:{
                    bool: {
                        must: condition,
                        // filter: {
                        //     "bool": {
                        //         "must": [
                        //             { "range": { "opening_hr_12" : { "lte" : "now", "format": "HH:mm:ss a" }}},
                        //             { "range": { "closing_hr_12" : { "gt" : "now", "format": "HH:mm:ss a" }}}
                        //         ]
                        //     }
                        // },
                        "minimum_should_match" : "30%",
                        "boost" : 1.0
                    }
                }
            }
        },function (error, response,status) {
            if (error){
                console.log("search error: "+error)
            }
            else {
                var json_data = JSON.stringify(response.hits);
                console.log(response);
                copyRequest(json_data);
            }
        });
    }
};