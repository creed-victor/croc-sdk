import { contractAddresses, ERC20_ABI, NODE_URL } from '..';
import { Signer, Contract, ethers, BigNumber } from 'ethers';

export async function approveToken(tokenAddress: string, signer: Signer) {
  const dex = contractAddresses["CROC_SWAP_ADDR"];
  
  const tokenContract = new Contract(tokenAddress, ERC20_ABI, signer);
  
  const qty = ethers.BigNumber.from("1000000000000000000000");
  const tx = await tokenContract.approve(dex, qty);
  
  return tx;
}

export function getBaseTokenAddress(token1: string, token2: string): string {
  let baseTokenAddress = "";

  if (!!token1 && !!token2) {
    const token1BigNum = BigNumber.from(token1);
    const token2BigNum = BigNumber.from(token2);
    // if token1 - token2 < 0, then token1 is the "base" and token2 is the "quote" token
    baseTokenAddress = token1BigNum.lt(token2BigNum) ? token1 : token2;
  }
  return baseTokenAddress;
}

export function getQuoteTokenAddress(token1: string, token2: string): string {
  let quoteTokenAddress = "";

  if (!!token1 && !!token2) {
    const token1BigNum = BigNumber.from(token1);
    const token2BigNum = BigNumber.from(token2);
    // if token1 - token2 < 0, then token1 is the "base" and token2 is the "quote" token
    quoteTokenAddress = token1BigNum.gt(token2BigNum) ? token1 : token2;
  }
  return quoteTokenAddress;
}

export async function getTokenAllowance(
  tokenAddress: string,
  account: string,
  signer: Signer):Promise<BigNumber> {
  const dex = contractAddresses["CROC_SWAP_ADDR"];
  const tokenContract = new Contract(tokenAddress, ERC20_ABI, signer);
  
  const allowance = await tokenContract.allowance(account, dex);
  return allowance;
}
  
export async function getTokenDecimals(tokenAddress: string): Promise<number> {
  if (tokenAddress === contractAddresses.ZERO_ADDR) {
    return 18;
  }
  const provider = new ethers.providers.JsonRpcProvider(NODE_URL);
  const tokenContract = new Contract(tokenAddress, ERC20_ABI, provider);
  const decimals = await tokenContract.decimals();
  return decimals;
}
  
export async function getTokenBalanceDisplay(
  tokenAddress: string,
  account: string,
  signer: Signer): Promise<string> {
  const tokenDecimals = getTokenDecimals(tokenAddress)
  const balance = getTokenBalance(tokenAddress, account, signer)
  return toDisplayQty(await balance, await tokenDecimals)
}

export async function getTokenBalance(
  tokenAddress: string,
  account: string,
  signer: Signer): Promise<BigNumber> {

  if (tokenAddress === contractAddresses.ZERO_ADDR) {
    let nativeBalance = BigNumber.from(0);
    try {
      nativeBalance = await signer.getBalance(account);
    } catch (error) {
      console.log(error);
    }
    return nativeBalance;

  } else {
    const tokenContract = new Contract(tokenAddress, ERC20_ABI, signer);
    return await tokenContract.balanceOf(account);
  }
}

export function fromDisplayQty (qty: string, tokenDecimals: number): BigNumber {
  const bigQtyScaled = ethers.utils.parseUnits(qty, tokenDecimals);
  return bigQtyScaled;
}

export function toDisplayQty (qty: string | BigNumber, tokenDecimals: number): string {
  const bigQtyUnscaled = ethers.utils.formatUnits(qty, tokenDecimals);
  return bigQtyUnscaled;
}