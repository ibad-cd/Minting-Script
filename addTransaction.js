
const axios = require('axios');

// const adminAddress = "CLcCqtTAwb2m2yFyLBxuLrqTDdsAZhAtTiCovwehvt7H"
const adminAddress = "F2YgKD7rDYSntzPTohofUrWHZj2uEqrhDY9tpYs52FBz"



const transactionHash = ""
const mintAddress = ""
const ownerId = ""
const horseId = ""
let amount = ""
let horseName = ""

const programId = ""



const ApiUrl = "https://dev-ownersclub-api.invinciblegg.com/"

async function main() {

    async function getHorseDetails(id) {
        try {
            console.log("Fetching Horse Details...")
            const response = await axios.get(`${ApiUrl}horse_details?horse_id=${id}`);
            if (response.data.data.items[0]) {
                const { horse_name, price } = response.data.data.items[0]
                amount = price
                horseName = horse_name
                return true
            }
            else {
                console.log("Error in fetching horse")
                return false
            }
        } catch (error) {
            console.log(error)
            return false
        }
    }


    async function addTransaction() {
        try {
            console.log("Adding transaction...")
            const payload = {
                transaction_hash: transactionHash,
                mint_address: mintAddress,
                owner_id: ownerId,
                horse_id: horseId,
                store_front_id: 1,
                amount: amount,
                horse_name: horseName,
            };

            const response = await axios.post(`${ApiUrl}add_transactions`, requestBody);
            if (response.data.status) {
                console.log("Adding transaction success...")
                console.log(response.data.data);
                return true
            } else {
                console.log("Error in setting horse clips")
                return false
            }

        } catch (error) {
            console.log(error)
            return false
        }
    }

    async function claimNft() {
        try {
            console.log("Claiming Start...")
            const requestBody = {
                user_id: ownerId,
                mint_address: mintAddress,
                program_id: programId,
                horse_id: horseId,
            };

            const response = await axios.post(`${ApiUrl}claim_cnfts`, requestBody);
            if (response.data.status) {
                console.log("Claiming cnft success...")
                console.log(response.data.data);
                return true
            } else {
                console.log("Error in claiming cnfts")
                return false
            }

        } catch (error) {
            console.log(error)
            return false
        }
    }


    const horseResponse = await getHorseDetails(horseId)
    if (!horseResponse) { console.log("Error in horse details response"); return }

    const addTransactionResponse = await addTransaction()
    if (!addTransactionResponse) { console.log("Error in adding transaction response"); return }

    const claimNftResponse = await claimNft()
    if (!claimNftResponse) { console.log("Error in claiming nft response"); return }

}

main();



