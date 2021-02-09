let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app');
let Browser = require('zombie');

var assert = require('assert');
chai.use(chaiHttp);


describe('Openings api', function() {

    before(function() {
        //this.server = http.createServer(app).listen(3000);
        this.browser = new Browser({ site: 'http://localhost:3000' });
    });
    
    // load the contact page before each test
    beforeEach(function(done) {
        this.browser.visit('/catalog/openings', done);
    });

    it('should show openings', function() {
        assert.ok(this.browser.success);

        });
})



