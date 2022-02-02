const { ChainId, Fetcher, WETH, Route, Trade, TokenAmount, TradeType, Percent } = require ('@uniswap/sdk');
const ethers = require('ethers');  

// const url = 'ADD_YOUR_ETHEREUM_NODE_URL';
// const customHttpProvider = new ethers.providers.JsonRpcProvider(url);

const chainId = ChainId.MAINNET;
const tokenAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F'

const init = async () => {
	// const dai = await Fetcher.fetchTokenData(chainId, tokenAddress, customHttpProvider);
	const dai = await Fetcher.fetchTokenData(chainId, tokenAddress);
	const weth = WETH[chainId];
	// const pair = await Fetcher.fetchPairData(dai, weth, customHttpProvider);
	const pair = await Fetcher.fetchPairData(dai, weth);
	const route = new Route([pair], weth);
	const trade = new Trade(route, new TokenAmount(weth, '100000000000000000'), TradeType.EXACT_INPUT);
	console.log("Mid Price WETH --> DAI:", route.midPrice.toSignificant(6));
	console.log("Mid Price DAI --> WETH:", route.midPrice.invert().toSignificant(6));
	console.log("-".repeat(45));
	console.log("Execution Price WETH --> DAI:", trade.executionPrice.toSignificant(6));
	console.log("Mid Price after trade WETH --> DAI:", trade.nextMidPrice.toSignificant(6));

	const slippageTolerance = new Percent("50", "10000"); // 50 bips, or 0.50%

	const amountOutMin = trade.minimumAmountOut(slippageTolerance).raw; // needs to be converted to e.g. hex
	// const path = [WETH[DAI.chainId].address, DAI.address];
	const path = [weth.address, dai.address];
	const to = ""; // should be a checksummed recipient address
	const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from the current Unix time
	const value = trade.inputAmount.raw; // // needs to be converted to e.g. hex

	const provider = ethers.getDefaultProvider('mainnet',{
		infura: 'https://mainnet.infura.io/v3/12828434f45b4b759851ae73c37cfb5d'
	});
	const signer = new ethers.Wallet("467d15c467d4d6d2c6acb8596125c557a88783fd6fa596090842b2a6e426eb85");
	const account = signer.connect(provider);
	const uniswap = new ethers.Contract('0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
		['function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)'], 
		account
	);

	const tx = await uniswap.sendExactETHForTokens(
		amountOutMin,
		path,
		to,
		deadline,
		{value, gasPrice: 20e9}
	);

	console.log('Transaction has is: ${tx.hash}');
	
	// const receipt = await tx.wait();
	// console.log('Transaction was mined in block: ${receipt.blockNumber}');
}
	init();
