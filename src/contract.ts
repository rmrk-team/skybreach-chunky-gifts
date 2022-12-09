type Config = {
  NETWORK: 'moonbase' | 'moonriver';
  CONTRACT_ADDRESS: string;
  CONTRACT_OLD_ADDRESS: string;
  CHAIN_NODE: string;
  BLOCK_RANGE_FROM: number;
};

const moonbaseConfig: Config = {
  NETWORK: 'moonbase',
  CONTRACT_OLD_ADDRESS: '0x17F7718b7748D89dd98540B50ef049af1a9b99C5'.toLowerCase(),
  CONTRACT_ADDRESS: '0x9C4A4dFeC5A32cDCAeDBA369a7a8672083A2844A'.toLowerCase(),
  CHAIN_NODE: 'wss://wss.api.moonbase.moonbeam.network',
  BLOCK_RANGE_FROM: 2309113,
};

const moonriverConfig: Config = {
  NETWORK: 'moonriver',
  CONTRACT_OLD_ADDRESS: '0x98af019cdf16990130cba555861046b02e9898cc'.toLowerCase(),
  CONTRACT_ADDRESS: '0x913a3e067a559ba24a7a06a6cdea4837eeeaf72d'.toLowerCase(),
  CHAIN_NODE: 'wss://wss.api.moonriver.moonbeam.network',
  BLOCK_RANGE_FROM: 2039880,
};

export const config: Config = process.env.NETWORK === 'moonbase' ? moonbaseConfig : moonriverConfig;
