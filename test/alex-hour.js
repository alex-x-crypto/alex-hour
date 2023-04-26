const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("AlexHour", function () {
    async function deployContractFixture() {
        const [owner] = await ethers.getSigners();
        const Hour = await ethers.getContractFactory("AlexHour");
        const hour = await Hour.deploy("");
        await hour.deployed();

        return { hour, owner };
    }
    it("Should init with right owner", async function () {
        const { hour, owner } = await loadFixture(deployContractFixture);
        const ownerAddress = await hour.owner();
        expect(ownerAddress).to.equal(owner.address);
    });
    it("Should mint correctly", async function () {
        const { hour, owner } = await loadFixture(deployContractFixture);
        const tokenId = 0;
        const amount = 300;
        const price = ethers.utils.parseEther("0.1");
        const uri = "https://alexhour.com/1";
        await expect(
            hour.connect(owner).mint(owner.address, tokenId, amount)
        ).to.be.revertedWith("AlexHour: token does not exist");
        const common = await ethers.getSigner(1);
        await expect(
            hour.connect(common).mint(owner.address, tokenId, amount)
        ).to.be.revertedWith("Ownable: caller is not the owner");
        await hour.setURI(tokenId, uri);
        await hour.setPrice(tokenId, price);
        await hour.mint(owner.address, tokenId, amount);
        expect(await hour.balanceOf(owner.address, tokenId)).to.equal(amount);
        expect(await hour.uri(tokenId)).to.equal(uri);
        expect(await hour.price(tokenId)).to.equal(price);
    });
    it("Should transfer correctly", async function () {
        const { hour, owner } = await loadFixture(deployContractFixture);
        const tokenId = 0;
        const price = ethers.utils.parseEther("0.1");
        const uri = "https://alexhour.com/1";
        await hour.setURI(tokenId, uri);
        await hour.setPrice(tokenId, price);
        const common = await ethers.getSigner(1);
        await hour.mint(owner.address, tokenId, 300);
        await expect(
            hour.connect(common).safeTransferFrom(owner.address, common.address, tokenId, 100, "0x")
        ).to.be.revertedWith("ERC1155: caller is not token owner or approved");
        await hour.safeTransferFrom(owner.address, common.address, tokenId, 100, "0x");
        expect(await hour.balanceOf(common.address, tokenId)).to.equal(100);
        expect(await hour.balanceOf(owner.address, tokenId)).to.equal(200);
        await hour.connect(common).safeTransferFrom(common.address, owner.address, tokenId, 5, "0x");
        expect(await hour.balanceOf(common.address, tokenId)).to.equal(95);
        expect(await hour.balanceOf(owner.address, tokenId)).to.equal(205);
    });
    it("Should purchase correctly", async function () {
        const { hour, owner } = await loadFixture(deployContractFixture);
        const tokenId = 1;
        const price = ethers.utils.parseEther("0.1");
        const uri = "https://alexhour.com/1";
        await hour.setURI(tokenId, uri);
        await hour.setPrice(tokenId, price);
        const common = await ethers.getSigner(1);
        await expect(
            hour.connect(common).purchase(tokenId, 10)
        ).to.be.revertedWith("AlexHour: insufficient payment");
        const amount = 10;
        await hour.connect(common).purchase(tokenId, amount, { value: price.mul(amount) });
        expect(await hour.balanceOf(common.address, tokenId)).to.equal(amount);
        expect(await ethers.provider.getBalance(hour.address)).to.equal(price.mul(amount));
        await expect(
            hour.connect(common).withdraw()
        ).to.be.revertedWith("Ownable: caller is not the owner");
        await hour.withdraw();
        expect(await ethers.provider.getBalance(hour.address)).to.equal(0);
    });
});
