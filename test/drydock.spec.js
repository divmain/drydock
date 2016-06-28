import Drydock from '../src/node/index.js';

var assert = require('chai').assert;
var expect = require('chai').expect;

describe('DryDock', () => {
  let drydock;
  let drydock2;
  beforeEach(() => {
    drydock = new Drydock({port: 9797});

  });

  afterEach(() => {
    return Promise.all([
      new Promise(resolve => drydock.stop(resolve)),
      new Promise(resolve => {
        if (!drydock2) {
          resolve();
          return;
        }
        drydock2.stop(resolve);
      })]);
  });

  describe('starting instance', () => {
    it('should invoke callback when started', (done) => {
       drydock.start((error) => {
         expect(error).to.be.undefined;
         done();
       });
    });

    it('should invoke callback with error if port is in use', (done) => {
      drydock.start((error) => {
        expect(error).to.be.undefined;

        drydock2 = new Drydock({port: 9797});
        drydock2.start((error) => {
          expect(error).not.to.be.undefined;
          done();
        });
      });
    });
  });
});
