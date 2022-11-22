const { ethers } = require("hardhat");

async function main() {
  /*
  ethers.jsのContractFactoryは、新しいスマートコントラクトをデプロイするために使われる抽象化されたものです。
  つまり、このwhitelistContractはWhitelistコントラクトのインスタンス用のファクトリです。
  */
  const whitelistContract = await ethers.getContractFactory("Whitelist");

  // ここで、コントラクトをデプロイします。
  const deployedWhitelistContract = await whitelistContract.deploy(10);
  // 10は、ホワイトリストの最大許容アドレス数です。

  // デプロイが完了するのを待ちます
  await deployedWhitelistContract.deployed();

  // デプロイされたコントラクトのアドレスを表示する
  console.log("Whitelist Contract Address:", deployedWhitelistContract.address);
}

// main関数を呼び出して、エラーがあればキャッチする。
main().then(() => process.exit(0)).catch((error) => {
  console.error(error);
  process.exit(1);
});