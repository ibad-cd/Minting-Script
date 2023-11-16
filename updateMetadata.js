// ## Script Overview:

// This script is dedicated to updating the metadata of NFTs, focusing particularly on their attributes.

// ## Usage

// Create a CSV file named "horsesData.csv" in the root directory containing columns for horse IDs, names, and animations.
// Additionally, set up another CSV file in a folder named "csvs" for storing horseIDs and mint address.


const axios = require('axios');
const { parse } = require("csv-parse");
const fs = require("fs");

const ApiUrl = "https://ownersclub-api.invinciblegg.com/"
const ApiUrlSol = "https://dev-ownersclub-sol.invinciblegg.com/"

async function main() {

    async function getHorseDetails(id, horseNameDictionary) {
        try {
            console.log("Fetching Horse Details...", id)
            const response = await axios.get(`${ApiUrl}horse_details?horse_id=${id}`);
            if (response.data.data.items[0]) {
                const { horse_name, price } = response.data.data.items[0]
                // console.log(JSON.stringify(response.data.data.items[0], null, 2));
                const nftData = response.data.data.items[0].horse_details
                const newAttr = Object.keys(nftData)
                    .filter((key) => horsesAttributesMappings.includes(key))
                    .map((key) => {
                        let traitValue = nftData[key];
                        if (key === "dam" || key === "sire") {
                            traitValue = traitValue.name;
                        } else if (key === "name") {
                            console.log("horseID: ", id);
                            traitValue = horseNameDictionary[id].name;
                        } else if (key === "gender") {
                            traitValue = horseGender[traitValue]
                        } else if (key === "bloodline") {
                            traitValue = bloodlineMapping[traitValue]
                        } else if (key === "texture_id") {
                            key = "color"
                            traitValue = horseColorMappings[traitValue]
                        } else if (key === "speed_trait_1") {
                            traitValue = nftData["speed_trait_1_pwr"];
                        } else if (key === "speed_trait_2") {
                            traitValue = nftData["norm_speed"] >= 60 ? nftData["speed_trait_2_pwr"] : "LOCKED";
                        } else if (key === "speed_trait_3") {
                            traitValue = nftData["norm_speed"] >= 70 ? nftData["speed_trait_3_pwr"] : "LOCKED";
                        } else if (key === "speed_trait_4") {
                            traitValue = nftData["norm_speed"] >= 80 ? nftData["speed_trait_4_pwr"] : "LOCKED";
                        } else if (key === "stamina_trait_1") {
                            traitValue = nftData["stamina_trait_1_pwr"];
                        } else if (key === "stamina_trait_2") {
                            traitValue = nftData["norm_stamina"] >= 60 ? nftData["stamina_trait_2_pwr"] : "LOCKED";
                        } else if (key === "stamina_trait_3") {
                            traitValue = nftData["norm_stamina"] >= 70 ? nftData["stamina_trait_3_pwr"] : "LOCKED";
                        } else if (key === "stamina_trait_4") {
                            traitValue = nftData["norm_stamina"] >= 80 ? nftData["stamina_trait_4_pwr"] : "LOCKED";
                        } else if (key === "acceleration_trait_1") {
                            traitValue = nftData["acceleration_trait_1_pwr"];
                        } else if (key === "acceleration_trait_2") {
                            traitValue = nftData["norm_acceleration"] >= 60 ? nftData["acceleration_trait_2_pwr"] : "LOCKED";
                        } else if (key === "acceleration_trait_3") {
                            traitValue = nftData["norm_acceleration"] >= 70 ? nftData["acceleration_trait_3_pwr"] : "LOCKED";
                        } else if (key === "acceleration_trait_4") {
                            traitValue = nftData["norm_acceleration"] >= 80 ? nftData["acceleration_trait_4_pwr"] : "LOCKED";
                        }
                        return {
                            trait_type: key,
                            value: traitValue,
                        };
                    });

                // Adding extra attributes.
                newAttr.push(
                    {
                        trait_type: "animation",
                        value: horseNameDictionary[id].animation,
                    },
                    {
                        trait_type: "lifewin",
                        value: 0,
                    }
                );
                console.log(newAttr);
                console.log("Horse attributes array...")
                return { name: horse_name, attributes: newAttr, horsePrice: price }
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

    const updateNftMetadata = async (newAttr) => {
        try {
            console.log("Updating NFT Metadata...")

            const url = `${ApiUrlSol}update_attributes`;
            const payload = {
                tokenAddress: mintAddress,
                attributes: newAttr
            }
            const response = await axios.post(url, payload);
            console.log(response.data)
            if (response.data) {
                console.log("NFT Metadata Success...")
                return true
            } else {
                console.log("NFT Metadata Failed...")
                return false
            }
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    async function importHorses(callback) {
        let horseNameDictionary = {};
        fs.createReadStream('./horsesData.csv')
            .pipe(parse({ delimiter: ",", from_line: 2 }))
            .on("data", function (row) {
                horseNameDictionary[row[0]] = { name: row[16], animation: row[12] };
            })
            .on("end", async function () {
                // console.log("Horse Name Dictionary Complete - " + horseNameDictionary);
                callback(horseNameDictionary);
            })
            .on("error", function (error) {
                console.log(error.message);
            });
    }

    async function processHorses(horseData) {
        // Read the new CSV file with horseId and 
        const csvPipe = fs.createReadStream('./csvs/old_nfts_to_update.csv').pipe(parse({ delimiter: ",", from_line: 2 }));
        csvPipe.on("data", async function (row) {
            csvPipe.pause();
            const horseId = row[0];
            const tokenAddress = row[1];

            const horseResponse = await getHorseDetails(horseId, horseData)
            if (!horseResponse) { console.log("Error in horse details response"); return }

            // const nftMetadataResponse = await updateNftMetadata(horseResponse.attributes, tokenAddress)
            // if (!nftMetadataResponse) { console.log("Error in nftMetadataResponse response"); return }

            // Gather data
            const dataToWrite = gatherData(mintTransferResponse.mintData, horseId);

            // Write data to CSV
            writeToCsv(dataToWrite);

            csvPipe.resume();
        })
    }

    importHorses(async (horseNameDictionary) => {
        await processHorses(horseNameDictionary);
    });

}

main();




const horseGender = {
    0: "Colt",
    1: "Filly"
}

const bloodlineMapping = {
    1: 'Apollo',
    2: 'Touchstone',
    3: 'Black Onyx',
}

const horseColorMappings = {
    59: "Brown",
    60: "Chestnut",
    61: "Dark Bay",
    62: "Dappled Grey",
    63: "Dappled Light Grey",
    64: "Bay",
    65: "Bloody Bay",
    66: "Black",
    67: "Brown",
    68: "Chestnut",
    69: "Dark Bay",
    70: "Dappled Grey",
    71: "Dappled Light Grey",
    72: "White",
};

const horsesAttributesMappings = [
    "_id",
    "texture_id",
    "name",
    "category",
    "orig_name",
    "output_front",
    "output_back",
    "body",
    "face",
    "leg",
    "hair",
    "animation",
    "xsize",
    "ysize",
    "frames",
    "fps",
    "silkcol1",
    "silkcol2",
    "silkpattern",
    "dam",
    "sire",
    "grade",
    "country",
    "breeder",
    "trainer",
    "description",
    "lifewin",
    "owner_id",
    "user_horse_id",
    "orig_ghuid",
    "gen",
    "bloodline",
    "min_speed",
    "norm_speed",
    "min_stamina",
    "norm_stamina",
    "min_acceleration",
    "norm_acceleration",
    "skill_first_out",
    "skill_front",
    "skill_rail",
    "skill_breezing",
    "skill_working",
    "skill_drafting",
    "skill_turning",
    "skill_dueling",
    "skill_overtaking",
    "skill_final_kick",
    "skill_closing",
    "skill_front",
    "speed_trait_1",
    "speed_trait_2",
    "speed_trait_3",
    "speed_trait_4",
    "stamina_trait_1",
    "stamina_trait_2",
    "stamina_trait_3",
    "stamina_trait_4",
    "acceleration_trait_1",
    "acceleration_trait_2",
    "acceleration_trait_3",
    "acceleration_trait_4",
    "trait_small_size",
    "trait_avg_size",
    "trait_big_size",
    "trait_colossus_size",
    "trait_high_stride",
    "trait_pony_strider",
    "trait_silky_stride",
    "trait_long_strider",
    "trait_rip_quarters",
    "trait_muscular",
    "trait_athletic_build",
    "trait_plenty_of_bone",
    "trait_turf_lover",
    "trait_dirt_digger",
    "trait_comp_driver",
    "trait_turner",
    "trait_comf_runner",
    "trait_quick_speed",
    "trait_sprinter",
    "trait_miler",
    "trait_marathoner",
    "trait_muddy_runner",
    "trait_nice_and_hot",
    "trait_cold_killer",
    "trait_wet_winner",
    "trait_leader",
    "trait_hunter",
    "trait_del_motivation",
    "trait_starter",
    "trait_jockeying",
    "trait_finisher",
    "trait_learner",
    "gender",
    "age",
    "rating",
];
