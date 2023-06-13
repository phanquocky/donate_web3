

import {useCallback, useEffect, useState } from "react";
import Web3 from 'web3';
import detectEthereumProvider from "@metamask/detect-provider";
import { loadContract } from "./utils/loadContract";

function App() {

  const [web3Api, setWeb3Api] = useState({
    provider: null,
    web3: null,
    contract: null
  });
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(0);

  useEffect(function(){
    const loadProvider = async function() {
      const provider = await detectEthereumProvider();
      const contract = await loadContract('Faucet', provider)

      // debugger
      if (provider) {
        // console.log('provider', provider)
        // provider.request({method: 'eth_requestAccounts'});
        // console.log('acount', accounts)
        setWeb3Api({
          web3: new Web3(provider),
          provider,
          contract
        })
      }else{
        console.error("please login to metamask")
      }
    }
    loadProvider();

  }, [])

  useEffect(function() {
    const getAccount = async function() {
      const accounts = await web3Api.web3.eth.getAccounts()
      console.log("list account" ,accounts)
      setAccount(accounts[0])
    }
    web3Api.web3 && getAccount();
  }, [web3Api.web3])

  useEffect(function() {
    const loadBalance = async function() {
      const {contract, web3} = web3Api;
      console.log(contract.address  )
      const balance = await web3.eth.getBalance(contract.address);
      console.log('balance', balance)
      setBalance(web3.utils.fromWei(balance, "ether"));
    }
    console.log('contract', web3Api.contract)
    web3Api.contract && loadBalance();
  }, [web3Api])

  const addFunds = useCallback(async ()=> {
    const {contract, web3} = web3Api;
    await contract.addFunds({
      from: account,
      value: web3.utils.toWei("1", "ether")
    });
  }, [web3Api, account])

  const withdraw = async ()=> {
    const {contract, web3} = web3Api;
    const withdrawAmount = web3.utils.toWei('0.5', 'ether');
    await contract.withdraw(withdrawAmount, {
      from: account
    })
  }

  return (
    <div className="container">
      <div className="container center size" style={{ fontSize: "100px" }}>
        <div className="center">
          Current balance: <strong>{balance} ETH</strong>
        </div>
        <div className="text-center">
          <button type="button" className="btn btn-primary mx-2" onClick={()=>{
            addFunds();
          }}><h3>Donate</h3></button>
          <button type="button" className="btn btn-danger mx-2" onClick={()=>{
            withdraw();
          }}><h3>WithDraw</h3></button>
          <button type="button" className="btn btn-success"
            onClick={()=>{
              web3Api.provider.request({method: 'eth_requestAccounts'});
            }}
          ><h3>Connect wallet</h3></button>
          <p style={{ fontSize: "32px" }}><strong>Address: </strong>{
            account ? account : "You don't login"
          }</p>
        </div>
      </div>
    </div>
  );
}

export default App;
