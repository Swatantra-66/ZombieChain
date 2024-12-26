var cryptoZombies;
var userAccount;

function startApp() {
    var cryptoZombiesAddress = "YOUR_CONTRACT_ADDRESS";
    cryptoZombies = new web3js.eth.Contract(cryptoZombiesABI, cryptoZombiesAddress);

    var accountInterval = setInterval(function () {
        // Check if account has changed
        if (web3.eth.accounts[0] !== userAccount) {
            userAccount = web3.eth.accounts[0];
            // Calling function to update the UI with the new account
            getZombiesByOwner(userAccount)
                .then(displayZombies);
        }
    }, 100);

    cryptoZombies.events.Transfer({ filter: { _to: userAccount } })
        .on("data", function (event) {
            let data = event.returnValues;
            getZombiesByOwner(userAccount).then(displayZombies);

        }).on("error", console.error);

}



function displayZombies(ids) {
    $("#zombies").empty();
    for (const id of ids) {
        getZombieDetails(id)
            .then(function (zombie) {
                // Using ES6's "template literals" to inject variables into the HTML.
                // Append each one to our #zombies div
                $("#zombies").append(`<div class="zombie">
              <ul>
                <li>Name: ${zombie.name}</li>
                <li>DNA: ${zombie.dna}</li>
                <li>Level: ${zombie.level}</li>
                <li>Wins: ${zombie.winCount}</li>
                <li>Losses: ${zombie.lossCount}</li>
                <li>Ready Time: ${zombie.readyTime}</li>
              </ul>
            </div>`);
            });
    }
}

function createRandomZombie(name) {
    $("#txStatus").text("Creating new zombie on the blockchain. This may take a while...");
    return cryptoZombies.methods.createRandomZombie(name)
        .send({ from: userAccount })
        .on("receipt", function (receipt) {
            $("#txStatus").text("Successfully created " + name + "!");
            getZombiesByOwner(userAccount).then(displayZombies);
        })
        .on("error", function (error) {
            $("#txStatus").text(error);
        });
}

function feedOnKitty(zombieId, kittyId) {
    $("#txStatus").text("Eating a kitty. This may take a while...");
    return cryptoZombies.methods.feedOnKitty(zombieId, kittyId)
        .send({ from: userAccount })
        .on("receipt", function (receipt) {
            $("#txStatus").text("Ate a kitty and spawned a new Zombie!");
            getZombiesByOwner(userAccount).then(displayZombies);
        })
        .on("error", function (error) {
            $("#txStatus").text(error);
        });
}

function levelUp(zombieId) {
    $("#txStatus").text("Leveling up your zombie...");
    return cryptoZombies.methods.levelUp(zombieId)
        .send({ from: userAccount, value: web3.utils.toWei("0.001", "ether") })
        .on("receipt", function (receipt) {
            $("#txStatus").text("Power overwhelming! Zombie successfully leveled up");
        })
        .on("error", function (error) {
            $("#txStatus").text(error);
        });
}

function getZombieDetails(id) {
    return cryptoZombies.methods.zombies(id).call()
}

function zombieToOwner(id) {
    return cryptoZombies.methods.zombieToOwner(id).call()
}

function getZombiesByOwner(owner) {
    return cryptoZombies.methods.getZombiesByOwner(owner).call()
}

window.addEventListener('load', function () {

    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof web3 !== 'undefined') {
        // Using MetaMask's provider
        web3js = new Web3(web3.currentProvider);
    } else {
        // Handle the case where the user doesn't have Metamask installed
        // show them a message prompting them to install Metamask
    }
    startApp()

})