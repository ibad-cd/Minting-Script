// ## Script Overview:

// This script facilitates the minting of NFTs into an admin wallet. It involves several steps:
// Fetching NFT details from an API.
// Mapping old horse names to new ones using data from a CSV file, aiding in the setup of attributes and NFT clips.
// Gathering horse IDs from another CSV file, which are essential for the minting process.
// Maintaining an audit log in a separate CSV file to track successful minting, saving horse IDs and mint addresses.

// ## Usage

// Create a CSV file named "horsesData.csv" in the root directory containing columns for horse IDs, names, and animations.
// Additionally, set up another CSV file in a folder named "csvs" specifically for storing horseIDs. This file will serve as the source from which the script retrieves the horseIDs.

const axios = require('axios');
const fs = require('fs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const { parse } = require("csv-parse");

async function main() {

    const ApiUrl = "https://ownersclub-api.invinciblegg.com/"
    const ApiUrlSol = "https://ownersclub-sol.invinciblegg.com/"

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
                // console.log(newAttr);
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

    async function setHorseClips(horseId, name) {
        try {
            console.log("Setting Horse Clips...")
            const requestBody = {
                horse_id: horseId,
                horse_name: name,
            }
            const response = await axios.post(`${ApiUrl}horse_clips`, requestBody);
            if (response.data.status) {
                console.log("Setting Horse Success...")
                // console.log(response.data.data);
                return {
                    PNG: response.data.data.PNG,
                    MP4: response.data.data.MP4
                }
            } else {
                console.log("Error in setting horse clips")
                return false
            }

        } catch (error) {
            console.log(error)
            return false
        }
    }

    async function mintNFT(horseData, horseClips) {
        try {
            console.log("Minting start...")
            const requestBody = {
                jsonFile: JSON.stringify({
                    name: horseData.name,
                    image: horseClips.PNG,
                    attributes: horseData.attributes,
                    properties: {
                        creators: [
                            {
                                address: "CLcCqtTAwb2m2yFyLBxuLrqTDdsAZhAtTiCovwehvt7H",
                                verified: true,
                                share: 100,
                            },
                        ],
                        files: [
                            {
                                uri: horseClips.MP4,
                                type: "video/mp4",
                            },
                        ],
                        category: "video",
                    },
                    animation_url: horseClips.MP4,
                })
            }
            const response = await axios.post(`${ApiUrlSol}mint_nft`, requestBody);
            if (response.data) {
                console.log("Minting success...")
                console.log(response.data)
                return {
                    mintData: response.data
                }
            } else {
                console.log("Minting failure")
                return false
            }
        } catch (error) {
            console.log("Error: ", error)
            return false
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
        const csvPipe = fs.createReadStream('./horses_to_mint.csv').pipe(parse({ delimiter: ",", from_line: 2 }));
        csvPipe.on("data", async function (row) {
            csvPipe.pause();
            const horseId = row[0];

            const horseResponse = await getHorseDetails(horseId, horseData);
            if (!horseResponse) {
                console.log("Error in horse details response");
                return;
            }

            const horseClipsResponse = await setHorseClips(horseId, horseResponse.name);
            if (!horseClipsResponse) {
                console.log("Error in horse clips response");
                return;
            }

            const mintTransferResponse = await mintNFT(horseResponse, horseClipsResponse);
            if (!mintTransferResponse) {
                console.log("Error in mint & transfer response");
                return;
            }

            // Gather data
            const dataToWrite = gatherData(mintTransferResponse.mintData, horseId);

            // Write data to CSV
            writeToCsv(dataToWrite);

            csvPipe.resume();
        })
    }

    importHorses(async (horseNameDictionary) => {
        // console.log(horseNameDictionary);
        await processHorses(horseNameDictionary);
    });

}

main();

// Function to gather data
function gatherData(mintData, horseId) {
    // Perform some operations to gather data
    const newData = [
        {
            time: Date.now(),
            horseId: horseId,
            tokenAddress: mintData.mintAddress,
        },
    ];

    return newData;
}

// Function to write data to CSV file
function writeToCsv(data) {
    const csvFilePath = 'mintAudit.csv';

    // Check if the file exists
    const fileExists = fs.existsSync(csvFilePath);

    // Create a CSV writer object with the appropriate options
    const csvWriter = createCsvWriter({
        path: csvFilePath,
        header: [
            { id: 'time', title: 'Time' },
            { id: 'horseId', title: 'Horse ID' },
            { id: 'tokenAddress', title: 'Mint Address' },
        ],
        append: fileExists, // Set 'append' to true if the file exists
    });

    // If the file doesn't exist, create it with a header
    if (!fileExists) {
        csvWriter.writeRecords([]) // Write an empty record to create the header
            .then(() => console.log('CSV file created successfully'))
            .catch((err) => console.error('Error creating CSV file:', err));
    }

    // Append new data to the CSV file
    csvWriter.writeRecords(data)
        .then(() => console.log('Data appended to CSV file successfully'))
        .catch((err) => console.error('Error appending data to CSV file:', err));
}


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

//metadata mappings
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
