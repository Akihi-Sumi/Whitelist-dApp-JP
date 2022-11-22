import Head from "next/head";
import styles from "../styles/Home.module.css";
import Web3Modal from "web3modal";
import { providers, Contract } from "ethers";
import { useEffect, useRef, useState } from "react";
import { WHITELIST_CONTRACT_ADDRESS, abi } from "../constants";

export default function Home() {
  // walletConnectedは、ユーザーのウォレットが接続されているかどうかを追跡します。
  const [walletConnected, setWalletConnected] = useState(false);
  // joinedWhitelist は、現在のメタマスクアドレスがホワイトリストに参加しているかどうかを記録する。
  const [joinedWhitelist, setJoinedWhitelist] = useState(false);
  // loadingは、トランザクションが採掘されるのを待っているときにtrueに設定される
  const [loading, setLoading] = useState(false);
  // numberOfWhitelistedは、ホワイトリストに登録されたアドレスの数を追跡します。
  const [numberOfWhitelisted, setNumberOfWhitelisted] = useState(0);
  // Web3 Modal（Metamaskへの接続に使用）への参照を作成し、ページが開いている間、その参照を持続させます
  const web3ModalRef = useRef();

  /**
   * メタマスクの署名機能を持つ、あるいは持たない Ethereum RPC を表す Provider オブジェクトあるいは Signer オブジェクトを返します。
   *
   * ブロックチェーンと対話するためには、`プロバイダ`が必要である - トランザクションを読む、残高を読む、状態を読むなど。
   *
   * 「Signer」は、ブロックチェーンに「書き込み」トランザクションを行う必要がある場合に使用される特別なタイプのプロバイダーで、送信されるトランザクションを承認するために、接続されたアカウントがデジタル署名を行う必要があることを含みます。 MetamaskはSigner APIを公開し、Signer関数を用いてWebサイトがユーザーに署名を要求することを可能にします。
   *
   * @param {*} needSigner - 署名者が必要な場合はtrue、そうでない場合はfalseを指定します。
   */
  const getProviderOrSigner = async (needSigner = false) => {
    // Metamaskに接続
    // web3Modal` を参照として保存しているので、基礎となるオブジェクトにアクセスするために `current` 値にアクセスする必要があります。
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

    // ユーザーがGoerliネットワークに接続されていない場合、その旨を伝え、エラーを投げる
    const { chainId } = await web3Provider.getNetwork();
    if (chainId !== 5) {
      window.alert("Change the network to Goerli");
      throw new Error("Change network to Goerli");
    }

    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  };

  /**
   * addAddressToWhitelist: 現在接続しているアドレスをホワイトリストに追加する
   */
  const addAddressToWhitelist = async () => {
    try {
      // 「書き込み」トランザクションであるため、ここでSignerが必要である。
      const signer = await getProviderOrSigner(true);
      // Signerを持つContractのインスタンスを新規に作成し、更新メソッドを可能にする
      const whitelistContract = new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        signer
      );
      // コントラクトからaddAddressToWhitelistを呼び出す
      const tx = await whitelistContract.addAddressToWhitelist();
      setLoading(true);
      // マイニングされるのを待つ
      await tx.wait();
      setLoading(false);
      // ホワイトリストの更新されたアドレス数を取得する
      await getNumberOfWhitelisted();
      setJoinedWhitelist(true);
    } catch (err) {
      console.error(err);
    }
  };

  /**
   * getNumberOfWhitelisted: ホワイトリストに登録されているアドレスの数を取得します。
   */
  const getNumberOfWhitelisted = async () => {
    try {
      // web3Modalからプロバイダを取得します。この例ではMetaMaskです。
      // ブロックチェーンから状態を読み取るだけなので、ここではSignerは必要ない
      const provider = await getProviderOrSigner();
      // Providerを使用してContractに接続するため、Contractへのアクセスは読み取り専用になります。
      const whitelistContract = new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        provider
      );
      // コントラクトからnumAddressesWhitelistedを呼び出す。
      const _numberOfWhitelisted =
        await whitelistContract.numAddressesWhitelisted();
      setNumberOfWhitelisted(_numberOfWhitelisted);
    } catch (err) {
      console.error(err);
    }
  };

  /**
   * checkIfAddressInWhitelist: アドレスがホワイトリストに登録されているかどうかを確認する
   */
  const checkIfAddressInWhitelist = async () => {
    try {
      // ユーザーのアドレスを取得するために、後で signerが必要になります
      // SignerはProviderの特別な種類に過ぎないため、読み取りトランザクションであってもです。
      // その場で使えます
      const signer = await getProviderOrSigner(true);
      const whitelistContract = new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        signer
      );
      // MetaMaskに接続されている署名者に関連するアドレスを取得します。
      const address = await signer.getAddress();
      // コントラクトから whitelistedAddresses を呼び出す。
      const _joinedWhitelist = await whitelistContract.whitelistedAddresses(
        address
      );
      setJoinedWhitelist(_joinedWhitelist);
    } catch (err) {
      console.error(err);
    }
  };

  /*
    connectWallet: MetaMaskウォレットを接続します。
  */
  const connectWallet = async () => {
    try {
      // web3Modalからプロバイダを取得します。この例ではMetaMaskです。
      // 初めて使うときは、ウォレットを接続するよう促される
      await getProviderOrSigner();
      setWalletConnected(true);

      checkIfAddressInWhitelist();
      getNumberOfWhitelisted();
    } catch (err) {
      console.error(err);
    }
  };

  /*
    renderButton: dAppの状態に応じたボタンを返す
  */
  const renderButton = () => {
    if (walletConnected) {
      if (joinedWhitelist) {
        return (
          <div className={styles.description}>
            Thanks for joining the Whitelist!
          </div>
        );
      } else if (loading) {
        return <button className={styles.button}>Loading...</button>;
      } else {
        return (
          <button onClick={addAddressToWhitelist} className={styles.button}>
            Join the Whitelist
          </button>
        );
      }
    } else {
      return (
        <button onClick={connectWallet} className={styles.button}>
          Connect your wallet
        </button>
      );
    }
  };

  // useEffectsは、ウェブサイトの状態の変化に反応するために使用されます。
  // 関数呼び出しの最後にある配列は、どのような状態の変化がこの効果を引き起こすかを表します。
  // この場合、`walletConnected`の値が変更されるたびに、このエフェクトが呼び出されます。
  useEffect(() => {
    // ウォレットが接続されていない場合、Web3Modalのインスタンスを新規に作成し、MetaMaskウォレットを接続します。
    if (!walletConnected) {
      // Web3Modal クラスを `current` 値に設定して、参照オブジェクトに割り当てます。
      // このページが開いている間、`current` 値はずっと保持されます。
      web3ModalRef.current = new Web3Modal({
        network: "goerli",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();
    }
  }, [walletConnected]);

  return (
    <div>
      <Head>
        <title>Whitelist Dapp</title>
        <meta name="description" content="Whitelist-Dapp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to Crypto Devs!</h1>
          <div className={styles.description}>
            Its an NFT collection for developers in Crypto.
          </div>
          <div className={styles.description}>
            {numberOfWhitelisted} have already joined the Whitelist
          </div>
          {renderButton()}
        </div>
        <div>
          <img className={styles.image} src="./crypto-devs.svg" />
        </div>
      </div>

      <footer className={styles.footer}>
        Made with &#10084; by Crypto Devs
      </footer>
    </div>
  );
}