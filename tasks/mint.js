require("hardhat/config");

task("mint", "Mint some tokens")
    .addParam("contract", "The `AlexHour` contract address")
    .addParam("tokenId", "The `tokenId` will be minted")
    .addParam("amount", "The `amount` will be minted")
    .setAction(async (taskArgs, hre) => {
        const owner = await hre.ethers.getSigner(0);
        const AlexHour = await hre.ethers.getContractFactory("AlexHour");
        const hour = await AlexHour.attach(taskArgs.contract);
        const tokenId = taskArgs.tokenId;
        const amount = taskArgs.amount;
        console.log("contract = ", taskArgs.contract);
        console.log("tokenId = ", taskArgs.tokenId);
        console.log("amount = ", taskArgs.amount);
        let feeData = await ethers.provider.getFeeData();
        const tx = await hour.connect(owner).mint(owner.address, tokenId, amount, {
            maxFeePerGas: feeData.maxFeePerGas,
            maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
        });
        let receipt = await tx.wait();
        console.log(receipt.transactionHash);
    });