const zeroAddress = '0x0000000000000000000000000000000000000000'

interface DeploymentConfig {
  nationToken: string,
  nationPassportNFT: string,
  nationPassportNFTIssuer: string,
  nationPassportAgreementStatement: string,
  nationPassportAgreementURI: string,
  nationPassportRequiredBalance: string,
  nationPassportRevokeUnderBalance: string,
}

interface Config {
  nationToken: string,
  balancerDomain: string,
  nationPassportNFT: string,
  nationPassportNFTIssuer: string,
  nationPassportAgreementStatement: string,
  nationPassportAgreementURI: string,
  nationPassportRequiredBalance: number,
  nationPassportRevokeUnderBalance: number
}

const chain = process.env.NEXT_PUBLIC_CHAIN || "goerli";
const defaultConfig = require(`../../hardhat/contracts/deployments/${chain}.json`) as DeploymentConfig
const config: Config = {
  nationToken: defaultConfig.nationToken || zeroAddress,
  balancerDomain: chain === 'goerli' ? 'https://goerli.balancer.fi' : 'https://app.balancer.fi',
  nationPassportNFT: defaultConfig.nationPassportNFT || zeroAddress,
  nationPassportNFTIssuer: defaultConfig.nationPassportNFTIssuer || zeroAddress,
  nationPassportAgreementStatement: defaultConfig.nationPassportAgreementStatement || "",
  nationPassportAgreementURI: defaultConfig.nationPassportAgreementURI || "",
  nationPassportRequiredBalance: Number(defaultConfig.nationPassportRequiredBalance),
  nationPassportRevokeUnderBalance: Number(defaultConfig.nationPassportRevokeUnderBalance)
}
console.log(config)

export const {
  nationToken,
  balancerDomain,
  nationPassportNFT,
  nationPassportNFTIssuer,
  nationPassportAgreementStatement,
  nationPassportAgreementURI,
  nationPassportRequiredBalance,
  nationPassportRevokeUnderBalance
} = config
