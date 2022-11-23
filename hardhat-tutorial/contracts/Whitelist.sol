//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

contract Whitelist {
    // ホワイトリストに登録できるアドレスの最大数
    uint8 public maxWhitelistedAddresses;

    //whitelistedAddressesのマッピングを作成する。
    // ホワイトリストに登録されているアドレスはtrueに設定され、それ以外のアドレスはデフォルトでfalseに設定されています。
    mapping(address => bool) public whitelistedAddresses;

    // numAddressesWhitelistedは、ホワイトリストに登録されたアドレスの数を追跡するために使用されます。
    // 注：この変数名は、検証の一部となるため、変更しないでください。
    uint8 public numAddressesWhitelisted;

    // ホワイトリストアドレスの最大数の設定
    // ユーザーがデプロイ時に値を入れる
    constructor(uint8 _maxWhitelistedAddresses) {
        maxWhitelistedAddresses = _maxWhitelistedAddresses;
    }

    /* addAddressToWhitelist - この関数は、送信者のアドレスをホワイトリストに追加する。 */
    function addAddressToWhitelist() public {
        // ユーザーがすでにホワイトリストに登録されているかどうかをチェックする
        require(!whitelistedAddresses[msg.sender], "Sender has already been whitelisted");
        // numAddressesWhitelisted < maxWhitelistedAddresses であるかどうかを調べ、もしそうでなければエラーを投げる。
        require(numAddressesWhitelisted < maxWhitelistedAddresses, "More addresses cant be added, limit reached");
        // 関数を呼び出したアドレスを whitelistedAddress 配列に追加
        whitelistedAddresses[msg.sender] = true;
        // ホワイトリストのアドレス数を増やす
        numAddressesWhitelisted += 1;
    }
}