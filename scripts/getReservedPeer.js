'use strict';
const fs = require('fs');
const { URL } = require('url');
const process = require('process');
var os = require("os");

main();

async function main() {
  const maxAttempts = 500;
  var node_index = process.argv[2].toString();
  console.log("Registering node " + node_index + " as reserved peer");
  const cmd = `curl -Ss --connect-timeout 5 --data '{"method":"parity_enode","params":[],"id":1,"jsonrpc":"2.0"}' -H "Content-Type: application/json" -X POST 127.0.0.1:854${node_index}`;
  console.log(`> ` + cmd);
  for (let i = 1; i <= maxAttempts ; i++) {
    try {
      const enodeURL = await getEnodeURL(cmd);
      console.log("enode URL: " + enodeURL);
      if (process.env.DO_APPEND)
        fs.appendFileSync("parity-data/reserved-peers", enodeURL + os.EOL);
      break;
    } catch(e) {
      if (i < maxAttempts) {
        await sleep(50);
      } else {
        console.error(e);
        process.exitCode = 1;
      }
    }
  }
}

function getEnodeURL(cmd) {
  return new Promise((resolve, reject) => {
    var exec = require('child_process').exec;
    exec(cmd, function (error, stdout, stderr) {
      if (error !== null) {
        reject(error);
      }
      let resp;
      try {
        resp = JSON.parse(stdout);
      } catch(e) {
        reject(e);
      }
      let result;
      try {
        if (resp.result) {
          result = new URL(resp.result);
          result.host = '127.0.0.1';
          result = result.href;
        } else {
          throw new Error('result is undefined');
        }
      } catch (e) {
        reject(e);
      }
      resolve(result);
    });
  })
}

function sleep(millis) {
  return new Promise(resolve => setTimeout(resolve, millis));
}
