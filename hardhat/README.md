# N3BI

Nation3 Basic Income (N3BI)

## Description

Basic Income for Nation3 Citizens (N3BI) is a service offered to holders of the Nation3 [NFT passport](https://github.com/nation3/foundations/blob/main/src/passport/Passport.sol).

## Install Dependencies

```
cd hardhat
npm install
```

## Build

```
npx hardhat clean
npx hardhat compile
```

## Unit Tests

Run unit tests:

```
npx hardhat test
```

### Code Coverage

[![codecov](https://codecov.io/gh/nation3/n3bi/branch/main/graph/badge.svg)](https://codecov.io/gh/nation3/n3bi)

Run code coverage:

```
npx hardhat coverage
```

Check if coverage threshold has been met:

```
npx istanbul check-coverage --lines 80
```

## Local Ethereum Node

Start a local Ethereum network node:

```
npx hardhat node
```

This will start Hardhat Network, and expose it as a JSON-RPC and Websocket server at http://127.0.0.1:8545/.

## Deploy to Local Ethereum Node

```
npx hardhat run scripts/deploy-n3bi.ts
```

## Linters

Run ESLint:

```
npx eslint '**/*.{js,ts}' --fix
```

Run Solhint:

```
npx solhint 'contracts/**/*.sol' --fix
```

## Prettier

Run Prettier:

```
npx prettier '**/*.{json,sol,md}' --write
```

## Deployments

### Goerli

https://github.com/nation3/foundations/blob/main/deployments/goerli.json

```
npx hardhat run .\scripts\deploy-n3bi.ts --network goerli
npx hardhat verify --network goerli <address> <arguments>
```

- [`N3BI.sol`](https://goerli.etherscan.io/address/0x449EFf083bbc92236134b45E8EA6C89035FEDd13#code)

### Sepolia

https://github.com/nation3/foundations/blob/main/deployments/sepolia.json

```
npx hardhat run .\scripts\deploy-n3bi.ts --network sepolia
npx hardhat verify --network sepolia <address> <arguments>
```

- [`N3BI.sol`](https://sepolia.etherscan.io/address/0x397201fe6CCA8eE9c3bF1a4b4DB27C6bEC47880C#code)

### Mainnet

https://github.com/nation3/foundations/blob/main/deployments/mainnet.json

```
npx hardhat run .\scripts\deploy-n3bi.ts --network mainnet
npx hardhat verify --network mainnet <address> <arguments>
```

- ...
