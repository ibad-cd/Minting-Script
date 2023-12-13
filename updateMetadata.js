// ## Script Overview:

// This script is dedicated to updating the metadata of NFTs, focusing particularly on their attributes.

// ## Usage

// Create a CSV file named "horsesData.csv" in the root directory containing columns for horse IDs, names, and animations.
// Additionally, set up another CSV file in a folder named "csvs" for storing horseIDs and mint address.
// to run this script open terminal and type node updateMetadata


const axios = require('axios');
const { parse } = require("csv-parse");
const fs = require("fs");
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const ApiUrl = "https://ownersclub-api.invinciblegg.com/"
const ApiUrlSol = "https://qa-ownersclub-sol.invinciblegg.com/"

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
                        }
                        else if (key === "name") {
                            console.log("horseID: ", id);
                            traitValue = horseNameDictionary[id].name;
                        } 
                        else if (key === "gender") {
                            traitValue = horseGender[traitValue]
                        } else if (key === "bloodline") {
                            traitValue = bloodlineMapping[traitValue]
                        } else if (key === "texture_id") {
                            key = "color"
                            traitValue = horseColorMappings[traitValue]
                        } else if (key === "speed_trait_1") {
                            traitValue = horseTraitsMapping[traitValue].name;
                        }
                        else if (key === "speed_trait_2") {
                            traitValue = horseTraitsMapping[traitValue].name;
                        } else if (key === "speed_trait_3") {
                            traitValue = horseTraitsMapping[traitValue].name;
                        } else if (key === "speed_trait_4") {
                            traitValue = horseTraitsMapping[traitValue].name;
                        } else if (key === "stamina_trait_1") {
                            traitValue = horseTraitsMapping[traitValue].name;
                        } else if (key === "stamina_trait_2") {
                            traitValue = horseTraitsMapping[traitValue].name;
                        } else if (key === "stamina_trait_3") {
                            traitValue = horseTraitsMapping[traitValue].name;
                        } else if (key === "stamina_trait_4") {
                            traitValue = horseTraitsMapping[traitValue].name;
                        } else if (key === "acceleration_trait_1") {
                            traitValue = horseTraitsMapping[traitValue].name;
                        } else if (key === "acceleration_trait_2") {
                            traitValue = horseTraitsMapping[traitValue].name;
                        } else if (key === "acceleration_trait_3") {
                            traitValue = horseTraitsMapping[traitValue].name;
                        } else if (key === "acceleration_trait_4") {
                            traitValue = horseTraitsMapping[traitValue].name;
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
                        value: horseAnimationMappings[horseNameDictionary[id].animation],
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

    const updateNftMetadata = async (newAttr, tokenAddress) => {
        try {
            console.log("Updating NFT Metadata...")

            const url = `${ApiUrlSol}updated_attributes_spNft`;
            const payload = {
                tokenAddress: tokenAddress,
                attributes: newAttr
            }
            const response = await axios.post(url, payload);
            console.log(response.data, "here:")
            if (response.data) {
                console.log("NFT Metadata Success...")
                return {
                    transactionHash: response.data.TransactionHash,
                }
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
            const tokenAddress = row[0];
            const horseId = row[1];

            const horseResponse = await getHorseDetails(horseId, horseData)
            if (!horseResponse) { console.log("Error in horse details response"); return }

            const nftMetadataResponse = await updateNftMetadata(horseResponse.attributes, tokenAddress)
            if (!nftMetadataResponse) { console.log("Error in nftMetadataResponse response"); return }

            // Gather data
            const dataToWrite = gatherData(horseId, tokenAddress, nftMetadataResponse.transactionHash);

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


// Function to gather data
function gatherData(horseId, tokenAddress, tx) {
    // Perform some operations to gather data
    const newData = [
        {
            horseId: horseId,
            tokenAddress: tokenAddress,
            tx: tx,
        },
    ];

    return newData;
}

// Function to write data to CSV file
function writeToCsv(data) {
    const csvFilePath = './csvs/newUpdateMetadataAudit.csv';

    // Check if the file exists
    const fileExists = fs.existsSync(csvFilePath);

    // Create a CSV writer object with the appropriate options
    const csvWriter = createCsvWriter({
        path: csvFilePath,
        header: [

            { id: 'horseId', title: 'Horse Id' },
            { id: 'tokenAddress', title: 'Mint Address' },
            { id: 'tx', title: 'Transaction Hash' },
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

const horseTraitsMapping = {
    "trait_small_size": {
        "name": "Small Size",
        //   "icon": Small
    },
    "trait_avg_size": {
        "name": "Average Size",
        //   "icon": Average
    },
    "trait_big_size": {
        "name": "Big Size",
        //   "icon": Big
    },
    "trait_colossus_size": {
        "name": "Colossal Size",
        //   "icon": Colossal
    },
    "trait_high_stride": {
        "name": "High Stride",
        //   "icon": HIghStrideRate
    },
    "trait_pony_strider": {
        "name": "Pony Stride",
        //   "icon": PonyStride
    },
    "trait_silky_stride": {
        "name": "Silky Stride",
        //   "icon": SilkyStride
    },
    "trait_long_strider": {
        "name": "Long Stride",
        //   "icon": LongStride
    },
    "trait_rip_quarters": {
        "name": "Ripped Quarters",
    },
    "trait_muscular": {
        "name": "Muscular",
    },
    "trait_athletic_build": {
        "name": "Athletic Build",
    },
    "trait_plenty_of_bone": {
        "name": "Plenty of Bone",
    },
    "trait_dirt_digger":{
        "name": "Dirt Digger",
    },
    "trait_turner":{
        "name": "Turner",
    },
    "trait_comf_runner":{
        "name": "Comfortable Runner",
    },
    "trait_miler":{
        "name": "Miler",
    },
    "trait_nice_and_hot":{
        "name": "Nice and Hot",
    },
    "trait_wet_winner":{
        "name": "Wet Winner",
    },
    "trait_del_motivation":{
        "name": "Del Motivation",
    },
    "trait_starter":{
        "name": "Starter",
    },
    "trait_jockeying":{
        "name": "Jockeying",
    },
    "trait_comp_driver":{
        "name": "Competitive Driver",
    },
    "trait_turf_lover":{
        "name": "Turf Lover",
    },
    "trait_quick_speed":{
        "name": "Quick Speed",
    },
    "trait_sprinter":{
        "name": "Sprinter",
    },
    "trait_marathoner":{
        "name": "Marathoner",
    },
    "trait_muddy_runner":{
        "name": "Muddy Runner",
    },
    "trait_cold_killer":{
        "name": "Cold Killer",
    },
    "trait_leader":{
        "name": "Leader",
    },
    "trait_hunter":{
        "name": "Hunter",
    },
    "trait_finisher":{
        "name": "Finisher",
    },
    "trait_learner":{
        "name": "Finisher",
    },
}

const horseAnimationMappings = {
    "TShake" : "Shake",
    "TKickback" : "Kickback",
    "TRearup" : "Rear Up",
    "TNodno" : "Nod No",
    "TNodyes" : "Nod Yes",
}