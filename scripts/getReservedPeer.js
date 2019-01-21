const fs = require('fs');
const assert = require('assert');
const process = require('process');
const { URL } = require('url');
var os = require("os");

main();

async function main() {
  assert(process.argv.length > 2, "provide the index of the node that was last to start");
  const maxAttempts = 5;
  var node_index = process.argv[2].toString();
  const num_regex = /^[0-9]$/;
  assert(num_regex.test(node_index));
  console.log("Registering node " + node_index + " as reserved peer");
  const cmd = `curl --data '{"method":"parity_enode","params":[],"id":1,"jsonrpc":"2.0"}' -H "Content-Type: application/json" -X POST localhost:854`
        + node_index
        + ` 2>/dev/null`;
  console.log(`> ` + cmd);
  for (let i = 1; i <= maxAttempts; i++) {
    try {
      const enodeURL = new URL(await getEnodeURL(cmd));
      enodeURL.host = '127.0.0.1';
      console.log("enode URL: " + enodeURL);
      fs.appendFileSync("parity-data/reserved-peers", enodeURL + os.EOL);
      break;
    } catch(e) {
      if (i <= maxAttempts) {
        await sleep(5000);
      } else {
        console.log(e.message);
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
          result = resp.result;
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
