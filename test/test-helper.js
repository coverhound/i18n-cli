const path = require('path');

global.appPath = path.join(__dirname, '../src');
global.fixturesPath = path.join(__dirname, 'fixtures');
global.sinon = require('sinon');
global.expect = require('chai').expect;
