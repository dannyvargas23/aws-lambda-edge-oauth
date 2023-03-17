const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");

const s3 = new S3Client();
const cache = {};

function getConfig(configFileName, callback) {
  //configuring parameters
  const params = {
    Bucket: 'sevaro-auth0-dev',
    Key: configFileName
  };

const getObjCommand = new GetObjectCommand(params);
  s3.send(getObjCommand, async function (err, data) {
    if (err) {
      callback(err, null);
    }
    else {
      const config = JSON.parse(await data?.Body?.transformToString());
      callback(null, config);
    }
  });
}

function getConfigCached(request, callback) {
  const configFileName = `${request.headers.host[0].value}.json`;
  const entry = cache[configFileName];
  if (entry && ((Date.now() - entry.time) < (5 * 60 * 1000))) // if entry is less than 5 minutes old
  {
    return callback(null, entry);
  }

  getConfig(configFileName, (err, result) => {
    if (!err) {
      result.time = Date.now();
      cache[configFileName] = result;
    }
    callback(err, result);
  });
}

module.exports = getConfigCached;
