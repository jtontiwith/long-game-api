"use strict";
exports.DATABASE_URL = process.env.DATABASE_URL || global.DATABASE_URL || "mongodb://localhost/longGameDB";
exports.TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL || "mongodb://localhost/longGameTestDB";
exports.PORT = process.env.PORT || 8080;



//mongodb://lgAdmin:LgadminlG1234@ds141621.mlab.com:41621/long-game-db

//mongo ds141621.mlab.com:41621/long-game-db -u lgAdmin -p LgadminlG1234

