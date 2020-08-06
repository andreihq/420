const Web3 = require("web3");
const EthereumTx = require('ethereumjs-tx').Transaction;

const CONFIG = {
  ADDRESS: "YOUR_ADDRESS",
  PRIVATE_KEY: "YOUR_RPIVATE_KEY",

  INFURA_KEY: "YOUR_INFURA_API",
  START_TIME: 1596687600000, // 06-08-2020 04:20 GMT+0
  END_TIME: 1596774000000, // 07-08-2020 04:20 GMT+0
  BLOCK_MATCH: ["418","419"], // We need to get into block that ends with '420', try sending tx after block '418' and '419'
  GAS_PRICE: 100 // GWEI
}

//let web3 = new Web3(new Web3.providers.HttpProvider(`https://mainnet.infura.io/v3/${CONFIG.INFURA_KEY}`));
let web3 = new Web3(new Web3.providers.WebsocketProvider(
  `wss://mainnet.infura.io/ws/v3/${CONFIG.INFURA_KEY}`,
  {
      clientConfig: {
          maxReceivedFrameSize: 100000000,
          maxReceivedMessageSize: 100000000,
      }
  }
));

const sendSigned = (txData, cb) => {
    const privateKey = Buffer.from(CONFIG.PRIVATE_KEY, 'hex');
    const transaction = new EthereumTx(txData);
    transaction.sign(privateKey);
    const serializedTx = transaction.serialize().toString('hex');
    web3.eth.sendSignedTransaction('0x' + serializedTx, cb);
}

(async () => {
  let txCount = await web3.eth.getTransactionCount(CONFIG.ADDRESS);

  let sub = web3.eth.subscribe('newBlockHeaders', (error, blockHeader) => {
    if (error) {
      console.error(`Unable to subscribe to new blocks: ${error}`);
      return;
    }

    if (blockHeader.number == null) {
      return;
    }

    // Ignore if event ended or didn't start
    let currentTime = new Date().getTime();
    if (currentTime < CONFIG.START_TIME && currentTime > CONFIG.END_TIME) {
      return;
    }

    // Get last 3 digits of block number
    let blockNumEnd = ('' + blockHeader.number).slice(-3);

    let blazeIt = CONFIG.BLOCK_MATCH.includes(blockNumEnd);
    console.log(`Block: ${blockHeader.number}\nNext Block: ${blockHeader.number+1}\nBlaze: ${blazeIt?"YES":"NO"}\n`);

    if (blazeIt) {
      // construct the transaction data
      const txData = {
        nonce: web3.utils.toHex(txCount),
        gasLimit: web3.utils.toHex(70000),
        gasPrice: web3.utils.toHex(CONFIG.GAS_PRICE * 1000000000),
        to: CONFIG.ADDRESS,
        from: CONFIG.ADDRESS,
        data: "0x0420"
      }
      // blaze it!
      sendSigned(txData, (err, result) => {
        if (err) {
          console.log(`Unable to send tx. Error: ${err}\n`)
        } else {
          console.log(`Tx blazed: ${result}\n`);
          txCount++;
        }
      });
    }
  })
  .on("connected", (subscriptionId) => {
    console.log(`Subscribing to new block: SUCCESS\nListening...\n`);
  })
  .on("data", (data) => {})
  .on("error", console.error);
})();