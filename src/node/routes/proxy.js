import request from "request";


export default function (drydock) {
  drydock.server.route({
    method: "*",
    path: "/{path*}",
    handler (req, reply) {
      const { method, headers, payload, url: { hostname, href } } = req;

      if (!hostname) {
        // eslint-disable-next-line no-console
        console.log(`Unable to fulfill HTTP request: ${href}`);
        reply("Unknown failer.").code(500);
        return;
      }

      request({
        url: href,
        method,
        headers,
        body: payload,
        encoding: null
      }, (err, response) => {
        if (err) {
          // eslint-disable-next-line no-console
          console.log(`Unable to fulfill HTTP request: ${err.stack}`);
          reply("Unknown failure.").code(500);
          return;
        }

        const { statusCode, body, headers: responseHeaders } = response;
        let r = reply(body).code(statusCode);
        Object.keys(responseHeaders).forEach(header => {
          r = r.header(header, responseHeaders[header]);
        });
      });
    }
  });
}
