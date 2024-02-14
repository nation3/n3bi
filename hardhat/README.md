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

### Sepolia

https://github.com/nation3/foundations/blob/main/deployments/sepolia.json

```
npx hardhat run ./scripts/deploy-n3bi.ts --network sepolia
npx hardhat verify --network sepolia <address> <arguments>
```

- `N3BI.sol`: [`0x7f50F6330A43b5C53475336d8Ddc3a0B43A3f5d0`](https://sepolia.etherscan.io/address/0x7f50F6330A43b5C53475336d8Ddc3a0B43A3f5d0)

### Mainnet

https://github.com/nation3/foundations/blob/main/deployments/mainnet.json

```
npx hardhat run ./scripts/deploy-n3bi.ts --network mainnet
npx hardhat verify --network mainnet <address> <arguments>
```

- ...
