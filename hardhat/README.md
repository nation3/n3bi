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

[![codecov](https://codecov.io/gh/nation3/n3bi/graphs/icicle.svg)](https://codecov.io/gh/nation3/n3bi)

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
npx hardhat run scripts/deploy-distributor.ts
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

### Sepolia (`v0.5.0`)

https://github.com/nation3/foundations/blob/main/deployments/sepolia.json

```
npx hardhat run --network sepolia ./scripts/deploy-distributor.ts
npx hardhat verify --network sepolia <address> <arguments>
```

- `BasicIncomeDistributor.sol`: [`0x1390714d3644169A2923d86e1047B04317434266`](https://sepolia.etherscan.io/address/0x1390714d3644169A2923d86e1047B04317434266)

### Mainnet (`v0.5.0`)

https://github.com/nation3/foundations/blob/main/deployments/mainnet.json

```
npx hardhat run ./scripts/deploy-n3bi.ts --network mainnet
npx hardhat verify --network mainnet <address> <arguments>
```

- ...
