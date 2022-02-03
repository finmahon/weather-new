const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const fs = require("fs");
// let jquery = fs.readFileSync("./bower_components/jquery/dist/jquery.js", "utf-8");
let out = [];



var addTemp = function (req, res, next) {
    JSDOM.fromURL("https://www.dlhweather.com/temperature/", {}).then(dom => {

        if (dom) {
            let posts = [];
            $ = require("jquery")(dom.window);
            // console.log('window222  ', window );
            // $('.entry-content table tr').each(function (index, item) {
            //     item = $(item); // make queryable in JQ
            //     posts.push(item.text().trim())
            // });


            $('.table-wrap table tr').each(function (index, item) {
                // item = $(item); // make queryable in JQ
                // posts.push(item.text().trim())
                if (item.getElementsByTagName('td').length > 0) {
                    out[index-1].temp = item.getElementsByTagName('td')[1].textContent.trim()
                }
            });
            // console.log('temptemptemp ',JSON.stringify(posts))   ;
            // console.log('ehey hey hey ',JSON.stringify(out))   ;
            res.json({ res: out });
        } else {
            console.log('error from dlHarbour ', errors)
            res.json({ error: 'feck ' });
        }

    }).catch(err => {
        console.log('error from dlHarbour temp data', err)
        next({ error: 'error fetching dlweather data' });
    });
}



function dlDataRoute() {
    var dlData = new express.Router();
    dlData.use(cors());
    dlData.use(bodyParser.urlencoded({
        extended: true
    }));
    dlData.use(bodyParser.json());



    dlData.get('/wind', function (req, res, next) {


        console.log(new Date(), 'In dlData data route POST / req.body=', req.body);
        out = [];

        // var jsdom = require('jsdom').jsdom;
        // var document = jsdom('<html></html>', {});
        // var window = document.defaultView;
        // var $ = require('jquery')(window);

        console.log(new Date(), 'In dlData POST / req.body=', req.body);

        JSDOM.fromURL("https://www.dlhweather.com/wind/", {})
            .then(dom => {

                if (dom) {
                    // let $ = dom.$ // Alias JQUery
                    let $ = require('jquery')(dom.window);
                    let posts = [];
                    // console.log('window111  ', window );
                    $('.table-wrap table tr').each(function (index, item) {
                        // item = $(item); // make queryable in JQ
                        // posts.push(item.text().trim())
                        if (item.getElementsByTagName('td').length > 0) {
                            out.push({
                                time: item.getElementsByTagName('td')[0].textContent.trim(),
                                wind: item.getElementsByTagName('td')[1].textContent.trim() + ' G' + item.getElementsByTagName('td')[3].textContent.trim(),
                                dirn: item.getElementsByTagName('td')[5].textContent.trim(),
                                temp: 99
                            });
                        }
                    });
                    // parseData(posts);
                    // console.log('ehey hey hey ',JSON.stringify(out));
                    addTemp(req, res, next);
                    // res.json({ res: out });


                    // res.json({ res: posts });
                } else {
                    console.log('error from dlHarbour ')
                    next({ error: 'error fetching dlweather data' });
                }

            })
            .catch(err => {
                console.log('error from dlHarbour data', err)
                next({ error: 'error fetching dlweather data' });
            });

    });



    // GET REST endpoint - query params may or may not be populated
    // dublinBuoy.get('/', function(req, res) {
    //   console.log(new Date(), 'In dublinBuoy route GET / req.query=', req.query);
    //   var world = req.query && req.query.hello ? req.query.hello : 'World';

    //   // see http://expressjs.com/4x/api.html#res.json
    //   res.json({msg: 'Hello from Dublin Buoy ' + world});
    // });

    // POST REST endpoint - note we use 'body-parser' middleware above to parse the request body in this route.
    // This can also be added in application.js
    // See: https://github.com/senchalabs/connect#middleware for a list of Express 4 middleware
    dlData.get('/current', function (req, res, next) {


        console.log(new Date(), 'In dlData current route POST / req.body=', req.body);
        out = [];
        JSDOM.fromURL("https://www.dlhweather.com/", {})
            .then(dom => {

                if (dom) {
                    let posts = [];
                    $ = require("jquery")(dom.window);
                    // $('.table-wrap table tr').each(function (index, item) {
                    //     item = $(item); // make queryable in JQ
                    //     posts.push(item.text().trim())
                    // });

                    $('.table-wrap table tr').each(function (index, item) {
                        // item = $(item); // make queryable in JQ
                        // posts.push(item.text().trim())
                        if (item.getElementsByTagName('td').length > 0) {
                            out[index].temp = item.getElementsByTagName('td')[1].textContent.trim()
                        }
                    });


                    // parseData(posts);
                    // addTemp(res);
                    res.json({ res: posts });
                } else {
                    console.log('error from dlHarbour current')
                    next({ error: 'error fetching dlweather data' });
                }
            })
            .catch(err => {
                console.log('error from dlHarbour current', err)
                next({ error: 'error fetching dlweather current' });
            });

        // see http://expressjs.com/4x/api.html#res.json

    });



    return dlData;
}



module.exports = dlDataRoute;
