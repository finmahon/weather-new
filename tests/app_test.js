var server   = require('../server'),
    chai     = require('chai'),
    chaiHTTP = require('chai-http'),
    should   = chai.should();

chai.use(chaiHTTP);

reqServer = process.env.HTTP_TEST_SERVER || server

describe('Basic routes tests', function() {

    it('GET health to / should return 200', function(done){
        chai.request(reqServer)
        .get('/health')
        .end(function(err, res) {
            console.log('res ', res.body)
            res.should.have.status(200);
            done();
        })

    })

    // it('GET to /pagecount should return 200', function(done){
    //     chai.request(reqServer)
    //     .get('/pagecount')
    //     .end(function(err, res) {
    //         res.should.have.status(200);
    //         done();
    //     })

    // })
})
