
const abi =[
	{
		"constant": false,
		"inputs": [
			{
				"name": "filename",
				"type": "string"
			},
			{
				"name": "tag",
				"type": "string"
			}
		],
		"name": "addFileTag",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "filename",
				"type": "string"
			}
		],
		"name": "getFileTag",
		"outputs": [
			{
				"name": "",
				"type": "string"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "getManager",
		"outputs": [
			{
				"name": "",
				"type": "address"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "manager",
		"outputs": [
			{
				"name": "",
				"type": "address"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	}
]

for (let i in abi) {
	delete abi[i]["payable"]
	delete abi[i]["stateMutability"]
}
module.exports = abi