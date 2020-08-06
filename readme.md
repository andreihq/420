# Requirements  
NodeJS  
  
# Install  
```npm install```  
  
# Configure  
Edit *CONFIG* object in *420.js* file:  
- ADDRESS: Your Account Address  
- PRIVATE_KEY: Your Account Private Key  
- INFURA_KEY: Your Infura API KEY (required for web3js)  
- START_TIME: Event start time  
- END_TIME: Event end time  
- BLOCK_MATCH: Match array for last 3 digits of block numbers. Tx might not get into next block, so you can try to spam it few blocks earlier.  
- GAS_PRICE: Do I need to explain this?  

# Run  
```node 420.js```  