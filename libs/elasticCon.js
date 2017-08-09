var elasticsearch = require('elasticsearch');
var moment = require('moment');
var esclient = new elasticsearch.Client({
    hosts: [
        'http://' + es_address + ':' + es_port
    ]
});
var self = module.exports = {
    deploy: function (callback) {
        self.deleteIndex(callback);
    },
    deleteIndex: function (callback) {
        esclient.indices.delete({index: es_index}, function (err, resp, status) {
            if (err)
                console.log('its a first time to create index');
            else
                console.log("delete", resp);
            self.createIndex(callback);
        });
    },
    createIndex: function (callback) {
        esclient.indices.create({index: es_index}, function (err, resp, status) {
            if (err)
                console.log(err);
            else
                console.log("create", resp);
            self.putMapping(callback);
        });
    },
    putMapping: function (callback) {
        esclient.indices.putMapping({
            index: es_index, type: es_type,
            body: {
                properties: {
                    'id': {'type': 'integer'},
                    'name_en': {'type': 'text'},
                    'name_ar': {'type': 'text'},
                    'opening_hr_12': {'type': 'date', 'format': 'HH:mm:ss a'},
                    'closing_hr_12': {'type': 'date', 'format': 'HH:mm:ss a'},
                    'opening_hr_24': {'type': 'integer'},
                    'closing_hr_24': {'type': 'integer'},
                    'hours_flag': {'type': 'integer'},
                    'reviews_count': {'type': 'integer'},
                }
            }
        }, function (err, resp, status) {
            if (err)
                console.log(err);
            else
                console.log("put mapping & create type", resp);

            callback();
        });
    },
    syncCsv: function (data) {
        esclient.bulk({
            index: es_index,
            type: es_type,
            body: data
        }, function (err, resp, status) {
            if (err)
                console.log(err);
            else
                console.log("index restaurants", resp);
        });
    },
    search: function (word, page, time, copyRequest) {
        var now = parseInt(moment().format('HHmm'));
        if (time !== null) {
            var momentObj = moment(time, ["HH:mm"]);
            now = parseInt(momentObj.format("HHmm"));
        }
        var condition = {};
        if (word) {
            condition = {
                "multi_match": {
                    "query": word,
                    "type": "phrase_prefix",
                    "fields": ["name_en", "name_ar"],
                    "tie_breaker": 0.3,
                    "minimum_should_match": "30%"
                }
            };
        }
        esclient.search({
            index: es_index,
            type: es_type,
            body: {
                from: (page * number_restaurants_per_page) - number_restaurants_per_page,
                size: number_restaurants_per_page,
                sort: [
                    {"reviews_count": {"order": "desc"}},
                ],
                query: {
                    bool: {
                        must: [
                            condition,
                            {
                                bool:{
                                    should: [
                                        {"term": {"hours_flag": 1}},
                                        {
                                            bool: {
                                                must: [
                                                    {"term": {"hours_flag": 0}},
                                                    {"range": {"opening_hr_24": {"lte": now}}},
                                                    {"range": {"closing_hr_24": {"gte": now}}}
                                                ]
                                            }
                                        },
                                        {
                                            bool: {
                                                must: [
                                                    {"term": {"hours_flag": 2}},
                                                    {
                                                        bool: {
                                                            should: [
                                                                {
                                                                    bool: {
                                                                        must: [
                                                                            {"range": {"opening_hr_24": {"gte": now}}},
                                                                            {"range": {"closing_hr_24": {"gte": now}}}
                                                                        ]
                                                                    }
                                                                },
                                                                {
                                                                    bool: {
                                                                        must: [
                                                                            {"range": {"opening_hr_24": {"lte": now}}},
                                                                            {"range": {"closing_hr_24": {"lte": now}}}
                                                                        ]
                                                                    }
                                                                }
                                                            ]
                                                        }
                                                    }
                                                ],
                                            }
                                        }
                                    ]
                                }
                            }
                        ],
                        "minimum_should_match": "30%",
                        "boost": 1.0
                    }
                }
            }
        }, function (error, response, status) {
            if (error) {
                console.log("search error: " + error)
            }
            else {
                var json_data = JSON.stringify(response.hits);
                console.log(response);
                copyRequest(json_data);
            }
        });
    }
};