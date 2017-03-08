import Drydock from '../src/node/index.js';
import request from 'request';

var assert = require('chai').assert;
var expect = require('chai').expect;

describe('DryDock', () => {

  describe('Starting an instance', () => {
    let drydock, drydock2;

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

  describe('Case Insensitive Routes', () => {
    const path = 'puppies';
    let drydock;

    afterEach((done) => {
      new Promise(resolve => drydock.stop(resolve));
      done();
    });

    describe('when no configuration is given', () => {
      beforeEach(() => {
        drydock = new Drydock({ port: 9797 });
        drydock.htmlRoute({
          name: `GET:${path}`,
          method: 'GET',
          path: `/${path}`,
          handlers: {
            success: {
              description: 'OK',
              handler(args = {}) { return route.execute(args, this, method, path); }
            }
          }
        });
      });

      it('should not allow for case insensitive routes', (done) => {
        drydock.start(() => {});
        request(`http://127.0.0.1:9797/${path.toUpperCase()}`, function (error, response) {
          expect(response.statusCode).to.eql(404);
          done();
        });
      });
    });

    describe('when configuration is given to allow for case insensitive routes', () => {
      beforeEach((done) => {
        drydock = new Drydock({ port: 9797, caseInsensitive: true });
        drydock.htmlRoute({
          name: `GET:${path}`,
          method: 'GET',
          path: `/${path}`,
          handlers: {
            success: {
              description: 'OK',
              handler: () => {}
            }
          }
        });
        done();
      });

      it('allows for case insensitive routes', (done) => {
        drydock.start(() => {});
        request(`http://127.0.0.1:9797/${path.toUpperCase()}`, function (error, response, body) {
          expect(response.statusCode).to.eql(200);
          done();
        });
      });
    });
  });

  describe('Specifying Status Codes', () => {
    let drydock;

    beforeEach(() => {
      drydock = new Drydock({ port: 9797 });

      drydock.htmlRoute({
        name: 'default',
        method: 'GET',
        path: '/200',
        handlers: {
          success: {
            description: 'default',
            handler: () => {}
          }
        }
      });
    });

    afterEach((done) => {
      new Promise(resolve => drydock.stop(resolve));
      done();
    });

    it('returns status code 200 by default', (done) => {
      drydock.start(() => {});
      request(`http://127.0.0.1:9797/200`, function (error, response, body) {
        expect(response.statusCode).to.eql(200);
        done();
      });
    });

    describe('when a status code is specified', () => {
      const CODE = 201;
      beforeEach(() => {
        drydock = new Drydock({ port: 9797 });

        drydock.htmlRoute({
          name: `${CODE}`,
          method: 'GET',
          path: `/${CODE}`,
          headers: { code: CODE },
          handlers: {
            success: {
              description: `${CODE}`,
              handler: () => {}
            }
          }
        });
      });

      it('returns specified status code', (done) => {
        drydock.start(() => {});
        request(`http://127.0.0.1:9797/${CODE}`, function (error, response, body) {
          expect(response.statusCode).to.eql(CODE);
          done();
        });
      });
    });
  });
});
