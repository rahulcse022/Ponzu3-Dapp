import { MdOutlineSwapVert} from 'react-icons/md';
import Swal from "sweetalert2";
import HashLoader from "react-spinners/HashLoader";
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useAccount, useDisconnect } from 'wagmi'
import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum'
import { Web3Modal } from '@web3modal/react'
import { useWeb3Modal } from '@web3modal/react'
import { configureChains, createConfig, WagmiConfig } from 'wagmi'
import { polygonMumbai, mainnet, polygon } from 'wagmi/chains'
import './App.css';
import connectContract, {contract} from './connectContract';
const chains = [polygonMumbai, mainnet, polygon]
const projectId = 'e5ee2dc4de76240fc63dcea932f9ad42'
const { publicClient } = configureChains(chains, [w3mProvider({ projectId })])
const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: w3mConnectors({ projectId, version: 1, chains }),
  publicClient
})
const ethereumClient = new EthereumClient(wagmiConfig, chains)

function App() {
  connectContract();
  const { address, isConnected,isConnecting, isDisconnected } = useAccount()
  const { isOpen, open, close, setDefaultChain } = useWeb3Modal()
  const [value1, setValue1] = useState();
  const [value2, setValue2] = useState();
  const [token, setToken] = useState();
  const [totalEth, setTotalEth] = useState(0);
  const [chainId, setChainId] = useState();
  const [txnLoading, setTxnLoading] = useState(false);

  async function totalETH() {
    if(totalEth===0)
    {
         try {
         const eth = await contract.totalETH();
         setTotalEth(eth.toNumber());
         console.log("total ether : ", eth.toNumber());
    } catch (error) {
         console.log("error : ", error);
    }}
  }
  useEffect(()=>{
    totalETH();
  },[])

  useEffect(() => {
    const { ethereum } = window;
    const checkChain = async() =>{
         const chainId = await ethereum.request({ method: 'eth_chainId' });
         setChainId(chainId);
         if(chainId!=="0x13881"){
              Swal.fire({
                   icon: "error",
                   title: "Wrong Network",
                   text: "Please connect to Mumbai Testnet",
              });
              
         }
    }
    checkChain();
    window.ethereum.on('chainChanged', (chainId) => {
         checkChain();
    });
},[address])

  async function getToken(){
    try {
      
        const token =  await contract.Eth_To_Token((totalEth),(ethers.utils.parseEther(value1)));
        
        setToken(token/10**18);
    }catch (error) {
         console.log("error : ", error);
    }

  }
  getToken();
   //handle input
  function handleValue1(event){
    const newValue = event.target.value;
    setValue1(newValue);
    setValue2(token);
  }
  // function handleValue2(event){
  //   const newValue = event.target.value;
  //   setValue2(newValue);
  //   setValue1(String(newValue/rate));
  // }

  async function swap(){
    setTxnLoading(true);
    if(chainId!=="0x13881"){
      setTxnLoading(false);
      Swal.fire({
           icon: "error",
           title: "Wrong Network",
           text: "Please connect to Mumbai Testnet",
      });
    }
    else{
      try {
        const tx = await contract.swap({value: ethers.utils.parseEther(value1)});
        await tx.wait();
        setTxnLoading(false);
        Swal.fire({
          icon: "success",
          title: "Transaction Sucessful",
          text: `You got ${value2} PONZU3`,
          footer: `<a href="https://mumbai.polygonscan.com/tx/${tx.hash}" target="_blank">Check the transaction hash on Ethersan</a>`,
        });
        console.log("tx : ", tx);
      } catch (error) {
        setTxnLoading(false);
        console.log("error : ", error);
      }
    }
  }

  return (
    <div className="App">
      <div>
     
      <WagmiConfig config={wagmiConfig}>
      <div className="bg-bg-img bg-cover min-h-screen bg-no-repeat px-5 py-5 mix-blend-overlay">
      <div className="flex justify-between items-center flex-wrap gap-5 px-5  ">
        <div>
          <img
            src={process.env.PUBLIC_URL + "/images/images/logo.png"}
            className="max-w-[160px] w-full"
          />
        </div>
        <div>
          <button className="bg-yellow px-[3rem] py-2 border-orange rounded-lg border-4 ">
            <h1 className="text-xl font-bold" onClick={()=>open()} >{isConnected?`${address.substring(
                                     0,
                                     4
                                )}....${address.substring(
                                     address.length - 4,
                                     address.length
                                )}`:"Metamask"}</h1>
          </button>
        </div>
      </div>
      <div className="max-w-[400px] w-full mx-auto">
        <h1 className="text-center font-bold text-4xl text-white mt-5 capitalize ">
          Eth Pool:
        </h1>
        <h1 className="text-center font-bold text-7xl text-white py-5 leading-8">
          0
        </h1>
        <div className="justify-center flex flex-col mb-5 relative">
          <div className=" flex jsutify-between border-4 px-4  border-purple relative rounded-lg  w-full bg-white focus-0 mb-3  mx-auto py-1">
          <input
            type="text"
            value={value1}
            placeholder='0'
            onChange={(event) =>
              handleValue1(event)
            }
           className='max-w-[400px] w-full'
          />
 <p className='border border-4 rounded-lg border-purple px-1 font-bold min-w-[70px] text-center'>Eth</p>
          </div>
         

         
          <div className="absolute top-[24%] left-[44%] z-50  bg-white">
           <MdOutlineSwapVert size={40} className="border-4 border-black  rounded-lg"/>
          </div>

          <div className=" flex jsutify-between border-4 px-4  border-purple relative rounded-lg  w-full bg-white focus-0 mb-3  mx-auto py-1">
          <input
            type="text"
            value={value2}
            placeholder='0'
           className='max-w-[400px] w-full'
          />
 <p className='border border-4 rounded-lg border-purple px-1  font-bold'>PONZU3</p>
          </div>
         
        </div>

        <div className="text-center">
          {txnLoading ?<div className='flex justify-center'><HashLoader
            color="#49FF88"
            loading = {txnLoading}
          /></div>:
          <button className="bg-green px-[4rem]  border-darkgreen  border-4 font-bold text-2xl py-2 rounded-lg" onClick={swap}> SWAP</button>
          }
          </div>
        <p className="text-white  text-center py-4 text-3xl">
          Your PONZU3 is balance of 0.0 is now worth{" "}
          <span className="text-green font-bold">0.0 Eth </span>
        </p>
      </div>
    </div>
        
          
        </WagmiConfig>

        <Web3Modal 
          projectId={projectId} ethereumClient={ethereumClient} 
        />
        
      </div>
    </div>
  );
}

export default App;
