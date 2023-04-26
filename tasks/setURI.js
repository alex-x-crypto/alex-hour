require("hardhat/config");

task("setURI", "Set the URI of the tokenId")
    .addParam("contract", "The `AlexHour` contract address")
    .addParam("tokenId", "The `tokenId` will be minted")
    .addParam("uri", "The `uri` of the token")
    .addParam("price", "The `price` in ether")
    .setAction(async (taskArgs, hre) => {
        const owner = await hre.ethers.getSigner(0);
        const AlexHour = await hre.ethers.getContractFactory("AlexHour");
        const hour = await AlexHour.attach(taskArgs.contract);
        const tokenId = taskArgs.tokenId;
        const uri = taskArgs.uri;
        let price = ethers.utils.parseEther(taskArgs.price);
        console.log("contract = ", taskArgs.contract);
        console.log("tokenId = ", taskArgs.tokenId);
        console.log("uri = ", taskArgs.uri);
        console.log("price = ", ethers.utils.formatEther(price));
        let feeData = await ethers.provider.getFeeData();
        let tx = await hour.connect(owner).setURI(tokenId, uri, {
            maxFeePerGas: feeData.maxFeePerGas,
            maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
        });
        let receipt = await tx.wait();
        console.log(receipt.transactionHash);
        feeData = await ethers.provider.getFeeData();
        tx = await hour.connect(owner).setPrice(tokenId, price, {
            maxFeePerGas: feeData.maxFeePerGas,
            maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
        });
        receipt = await tx.wait();
        console.log(receipt.transactionHash);
    });