import Head from "next/head";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import web3modal from "web3modal";
import { providers, Contract, utils } from "ethers";
import { abi, address } from "../contract";
import Data from "../components/data";

export default function Home() {
    const [walletConnected, setWalletConnected] = useState(false);
    const [preSaleStarted, setPreSaleStarted] = useState(false);
    const [presaleEnded, setpreSaleEnded] = useState(false);
    const [isOwner, setIsOwner] = useState(false);
    const [tokensMinted, setTokensMinted] = useState("0");
    const [tokensOwned, setTokensOwned] = useState(0);
    const [userTokenIds, setuserTokenids] = useState([]);
    const [NftData, setNftData] = useState([]);
    const [displayMetaData, setDisplaydata] = useState(false);
    const [tokenIdRef, settokenIdRef] = useState(false);
    const [nftownedRef, setNftOwnedRef] = useState(false);
    const [fetchNftRef, setfetchNftRef] = useState(false);
    const metadatRef = useRef([]);
    const web3modalRef = useRef();

    const connectWallet = async () => {
        try {
            await getProvider();
            setWalletConnected(true);
            checkpresaleStarted();
            checkpreSaleEnded();
            getNotokensMinted();
            await gettokensowned();
        } catch (err) {
            console.log(err);
        }
    };

    const getProvider = async (needSigner = false) => {
        const instance = await web3modalRef.current.connect();
        const provider = new providers.Web3Provider(instance);
        const { chainId } = await provider.getNetwork();
        if (chainId !== 5) {
            window.alert("change network to goerli");
            throw new Error("change to ropsten network");
        }
        if (needSigner) {
            const signer = provider.getSigner();
            return signer;
        }
        return provider;
    };

    const checkpresaleStarted = async () => {
        try {
            const provider = await getProvider();
            const nft_contract = new Contract(address, abi, provider);
            const status = await nft_contract.preSaleStarted();
            setPreSaleStarted(status);
            if (!status) {
                checkOwner();
            }
        } catch (err) {
            console.log(err);
        }
    };

    const checkpreSaleEnded = async () => {
        try {
            const provider = await getProvider();
            const nft_contract = new Contract(address, abi, provider);
            const time = await nft_contract.preSaleEnded();
            const ended = time.lt(Math.floor(Date.now() / 1000));
            if (ended) {
                setpreSaleEnded(true);
            } else {
                setpreSaleEnded(false);
            }
        } catch (err) {
            console.log(err);
        }
    };

    const checkOwner = async () => {
        try {
            const provider = await getProvider();
            const nft_contract = new Contract(address, abi, provider);
            const signer = await getProvider(true);
            const _address = await signer.getAddress();
            const owner = await nft_contract.owner();
            if (_address.toLowerCase() === owner.toLowerCase()) {
                setIsOwner(true);
            }
        } catch (err) {
            console.log(err);
        }
    };

    const getNotokensMinted = async () => {
        try {
            const provider = await getProvider();
            const nft_contract = new Contract(address, abi, provider);
            const _tokensMinted = await nft_contract.tokenIds();
            setTokensMinted(_tokensMinted.toString());
        } catch (err) {
            console.log(err);
        }
    };

    const startpreSale = async () => {
        try {
            const signer = await getProvider(true);
            const nft_contract = new Contract(address, abi, signer);
            const tx = await nft_contract.startPreSale();
            await tx.wait();
        } catch (err) {
            console.log(err);
        }
    };

    const preSaleMint = async () => {
        try {
            const signer = await getProvider(true);
            const nft_contract = new Contract(address, abi, signer);
            const tx = await nft_contract.presaleMint({
                value: utils.parseEther("0.01"),
            });
            await tx.wait();
            getNotokensMinted();
            setDisplaydata(false);
            await gettokensowned();
            window.alert("nft minted into your account");
        } catch (err) {
            console.log(err);
        }
    };

    const publicMint = async () => {
        try {
            const signer = await getProvider(true);
            const nft_contract = new Contract(address, abi, signer);
            const tx = await nft_contract.publicMint({
                value: utils.parseEther("0.01"),
            });
            await tx.wait();
            getNotokensMinted();
            setDisplaydata(false);
            await gettokensowned();
            window.alert("nft minted into your account");
        } catch (err) {
            console.log(err);
        }
    };

    const gettokensowned = async () => {
        try {
            const provider = await getProvider();
            const signer = await getProvider(true);
            const nft_contract = new Contract(address, abi, provider);
            const userAddress = await signer.getAddress();
            const balance = await nft_contract.balanceOf(userAddress);
            setTokensOwned(parseInt(balance.toString()));
            return balance;
        } catch (err) {
            console.log(err);
        }
    };

    const getTokenIdsowned = async (balance) => {
        try {
            const provider = await getProvider();
            const signer = await getProvider(true);
            const nft_contract = new Contract(address, abi, provider);
            const userAddress = await signer.getAddress();
            let temp = [];
            for (let i = 0; i < balance; i++) {
                let userTokenid = await nft_contract.tokenOfOwnerByIndex(
                    userAddress,
                    i
                );
                temp.push(userTokenid.toString());
            }
            setuserTokenids(temp);
            return true;
        } catch (err) {
            console.log(err);
        }
    };

    const getNFTowned = async () => {
        try {
            const provider = await getProvider();
            const nft_contract = new Contract(address, abi, provider);
            let data = [];
            userTokenIds.forEach(async (tokenid) => {
                const _data = await nft_contract.tokenURI(tokenid);
                data.push(_data);
            });
            setNftData(data);
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        if (!walletConnected) {
            web3modalRef.current = new web3modal({
                network: "ropsten",
                providerOptions: {},
                disableInjectedProvider: false,
            });

            connectWallet();
            setInterval(() => {
                getNotokensMinted();
                if (!preSaleStarted) {
                    checkpresaleStarted();
                } else if (!presaleEnded) {
                    checkpreSaleEnded();
                }
            }, 5000);
        }
    }, [walletConnected]);

    useEffect(() => {
        if (!tokenIdRef) {
            settokenIdRef(true);
        } else {
            getTokenIdsowned(tokensOwned);
        }
    }, [tokensOwned]);

    useEffect(() => {
        if (!nftownedRef) {
            setNftOwnedRef(true);
        } else {
            getNFTowned();
        }
    }, [userTokenIds]);

    useEffect(() => {
        if (!fetchNftRef) {
            setfetchNftRef(true);
        } else {
            metadatRef.current = [];
            setTimeout(() => {
                NftData.forEach((url) => {
                    fetch(url)
                        .then((res) => res.json())
                        .then((data) => {
                            metadatRef.current.push(data);
                        })
                        .catch((err) => console.log(err));
                });
            }, 1000);
        }
    }, [NftData]);

    const render = () => {
        if (!walletConnected) {
            return (
                <button
                    className="px-4 py-3 mt-6 bg-gradient-to-r from-blue-400 to-pink-600 rounded shadow-lg shadow-pink-600/50 hover:from-pink-400 hover:to-blue-600 hover:shadow-blue-400/50"
                    onClick={connectWallet}
                >
                    connect
                </button>
            );
        }
        if (!preSaleStarted && isOwner) {
            return (
                <button
                    className="px-4 py-3 mt-6 bg-gradient-to-r from-blue-400 to-pink-600 rounded shadow-lg shadow-pink-600/50 hover:from-pink-400 hover:to-blue-600 hover:shadow-blue-400/50"
                    onClick={startpreSale}
                >
                    start Presale
                </button>
            );
        }
        if (!preSaleStarted) {
            return (
                <button className="px-4 py-3 mt-6 bg-gradient-to-r from-blue-400 to-pink-600 rounded shadow-lg shadow-pink-600/50 hover:from-pink-400 hover:to-blue-600 hover:shadow-blue-400/50">
                    preSale not started
                </button>
            );
        }
        if (preSaleStarted && !presaleEnded) {
            return (
                <button
                    className="px-4 py-3 mt-6 bg-gradient-to-r from-blue-400 to-pink-600 rounded shadow-lg shadow-pink-600/50 hover:from-pink-400 hover:to-blue-600 hover:shadow-blue-400/50"
                    onClick={preSaleMint}
                >
                    presale mint
                </button>
            );
        }
        if (preSaleStarted && presaleEnded) {
            return (
                <button
                    className="px-4 py-3 mt-6 bg-gradient-to-r from-blue-400 to-pink-600 rounded shadow-lg shadow-pink-600/50 hover:from-pink-400 hover:to-blue-600 hover:shadow-blue-400/50"
                    onClick={publicMint}
                >
                    public mint
                </button>
            );
        }
    };

    return (
        <div>
            <div className="bg-[#131835] flex flex-col-reverse md:flex-row justify-around min-h-screen min-w-screen md:pt-24 pt-10  justify-items-center">
                <Head>
                    <title>Crypto Rain</title>
                    <meta
                        name="description"
                        content="NFT Collection for developers"
                    />
                </Head>
                <div className="text-white mx-auto mt-10 px-10 pb-5">
                    <p className="font-serif lg:text-4xl font-medium text-3xl mb-6 ">
                        Welcome to Crypto Rain
                    </p>
                    <div className="font-sans font-light text-lg">
                        <p>Nft Collection for developers in crypto</p>
                        <h1>Tokens Minted: {tokensMinted}/20</h1>
                        <h1>Tokens owned by you :{tokensOwned}</h1>
                    </div>
                    <div className="font-medium">
                        {render()}
                        <button
                            className="px-4 py-3 mt-20 block bg-gradient-to-r from-blue-400 to-pink-600 rounded shadow-lg shadow-pink-600/50 hover:from-pink-400 hover:to-blue-600 hover:shadow-blue-400/50"
                            onClick={() => {
                                setDisplaydata(!displayMetaData);
                            }}
                        >
                            Show NFT's owned &#8595;
                        </button>
                    </div>
                </div>

                <div className="mx-auto">
                    <Image
                        src="/home/home.png"
                        alt="home image"
                        width={670}
                        height={390}
                        className="rounded-2xl"
                    />
                </div>
            </div>
            <div className="bg-[#131835] text-white grid grid-cols-2 md:grid-cols-3 gap-4 justify-items-center">
                {" "}
                {displayMetaData && metadatRef.current && (
                    <Data
                        metadata={metadatRef.current}
                        hook={displayMetaData}
                    />
                )}
            </div>
        </div>
    );
}
