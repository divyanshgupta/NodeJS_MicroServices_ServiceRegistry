const express = require("express");
const ServiceRegistry = require("./lib/ServiceRegistry");
const service = express();

module.exports = (config) => {
  const log = config.log();
  const serviceRegistry = new ServiceRegistry(log);
  // Add a request logging middleware in development mode
  if (service.get("env") === "development") {
    service.use((req, res, next) => {
      log.debug(`${req.method}: ${req.url}`);
      return next();
    });
  }

  /*
     Services Routes
  */

  service.put(
    "/register/:servicename/:serviceversion/:serviceport",
    (req, resp) => {
      const { servicename, serviceversion, serviceport } = req.params;
      //IP Address some machines could have ip v6 version, wrapping of IPv6 address

      const serviceip = req.connection.remoteAddress.includes("::")
        ? `[${req.connection.remoteAddress}]`
        : req.connection.remoteAddress;

      const serviceKey = serviceRegistry.register(
        servicename,
        serviceversion,
        serviceip,
        serviceport
      );

      return resp.json({ result: serviceKey });
    }
  );
  service.delete(
    "/register/:servicename/:serviceversion/:serviceport",
    (req, resp) => {
      const { servicename, serviceversion, serviceport } = req.params;
      //IP Address some machines could have ip v6 version, wrapping of IPv6 address

      const serviceip = req.connection.remoteAddress.includes("::")
        ? `[${req.connection.remoteAddress}]`
        : req.connection.remoteAddress;

      const serviceKey = serviceRegistry.unregister(
        servicename,
        serviceversion,
        serviceip,
        serviceport
      );

      return resp.json({ result: serviceKey });
    }
  );
  service.get("/find/:servicename/:serviceversion", (req, resp, next) => {
    return next("Not Implemented");
  });

  // eslint-disable-next-line no-unused-vars
  service.use((error, req, res, next) => {
    res.status(error.status || 500);
    // Log out the error to the console
    log.error(error);
    return res.json({
      error: {
        message: error.message,
      },
    });
  });
  return service;
};
