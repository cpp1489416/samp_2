pragma solidity ^0.4.17;

contract TagFile{
    address public manager;
    mapping(string => string) files;

    function TagFile () public {
        manager = msg.sender;
    }

    function getManager() public view returns(address){
        return manager;
    }

    //get files
    function getFileTag(string filename) public view returns(string){
        return files[filename];
    }
    function addFileTag(string filename, string tag) public {
        files[filename] = tag;
    }

}
