
const axios = require('axios');
const { parse } = require("csv-parse");
const fs = require("fs");
// const adminAddress = "CLcCqtTAwb2m2yFyLBxuLrqTDdsAZhAtTiCovwehvt7H"
const adminAddress = "F2YgKD7rDYSntzPTohofUrWHZj2uEqrhDY9tpYs52FBz"



const transactionHash = ""
const mintAddress = "GUJaVvNAEobjqcsKpAjazHBDZnX9H7GGHEEsAcSxRDNJ"
const ownerId = ""
const horseId = "10139"
let amount = ""
let horseName = ""
const programId = ""

let horseNameDictionary = {}

const ApiUrl = "https://ownersclub-api.invinciblegg.com/"
const ApiUrlSol = "https://ownersclub-sol.invinciblegg.com/"

async function main() {

    async function getHorseDetails(id) {
        try {
            console.log("Fetching Horse Details...")
            const response = await axios.get(`${ApiUrl}horse_details?horse_id=${id}`);
            if (response.data.data.items[0]) {
                const { horse_name, price } = response.data.data.items[0]
                console.log(JSON.stringify(response.data.data.items[0], null, 2));
                const nftData = response.data.data.items[0].horse_details

                // const newAttributes = [
                //     {
                //         trait_type: "dam",
                //         value: nftData["dam"].name,
                //     },
                //     {
                //         trait_type: "norm_speed",
                //         value: (nftData["norm_speed"] >= 60) ? nftData["speed_trait_2_pwr"] : "LOCKED"
                //     },


                // ]


                const newAttr = Object.keys(nftData)
                    .filter((key) => horsesAttributesMappings.includes(key))
                    .map((key) => {
                        let traitValue = nftData[key];
                        if (key === "dam" || key === "sire") {
                            traitValue = traitValue.name;
                        } else if (key === "name") {
                            traitValue = horseNameDictionary[horseId].name;
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
                        value: horseNameDictionary[horseId].animation,
                    },
                    {
                        trait_type: "lifewin",
                        value: 0,
                    }
                );


                console.log(newAttr)
                // Compare newAttr with the compareAttributesObject
                // console.log("Find missing attributes");
                // for (compObj of compareAttributesArr) {
                //     const exist = newAttr.filter((newAttrObj) => compObj.trait_type === newAttrObj.trait_type).length > 0
                //     if (!exist) {
                //         console.log(compObj);
                //     }
                // }


                // console.log("Horse attributes array...")
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




    async function importHorses() {
        fs.createReadStream('./master_nft_output-series-A1.csv')
            .pipe(parse({ delimiter: ",", from_line: 2 }))
            .on("data", function (row) {
                horseNameDictionary[row[0]] = { name: row[16], animation: row[12] };
            })
            .on("end", async function () {
                console.log("Horse Name Dictionary - " + horseNameDictionary);
            })
            .on("error", function (error) {
                console.log(error.message);
            });
    }

    importHorses();
    const horseResponse = await getHorseDetails(horseId)
    if (!horseResponse) { console.log("Error in horse details response"); return }

    const nftMetadataResponse = await updateNftMetadata(horseResponse.attributes)
    if (!nftMetadataResponse) { console.log("Error in nftMetadataResponse response"); return }


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


compareAttributesArr = [
    {
        "trait_type": "id",
        "value": "471"
    },
    {
        "trait_type": "category",
        "value": "Normal"
    },
    {
        "trait_type": "name",
        "value": "Jacket"
    },
    {
        "trait_type": "orig_name",
        "value": "OC-001-0001"
    },
    {
        "trait_type": "output_front",
        "value": "471.mp4"
    },
    {
        "trait_type": "output_back",
        "value": "471b.mp4"
    },
    {
        "trait_type": "body",
        "value": "1_Horse_Bay_Albedo.png"
    },
    {
        "trait_type": "face",
        "value": "Horse_Head_Star_1_Albedo.png"
    },
    {
        "trait_type": "leg",
        "value": "Horse_Legs_1_Albedo.png"
    },
    {
        "trait_type": "hair",
        "value": "1_Hair_Event_Bay_Albedo_02.png"
    },
    {
        "trait_type": "animation",
        "value": "TStomp"
    },
    {
        "trait_type": "xsize",
        "value": "592"
    },
    {
        "trait_type": "ysize",
        "value": "834"
    },
    {
        "trait_type": "frames",
        "value": "96"
    },
    {
        "trait_type": "fps",
        "value": "12"
    },
    {
        "trait_type": "silkcol1",
        "value": "FF00FF"
    },
    {
        "trait_type": "silkcol2",
        "value": "00FF00"
    },
    {
        "trait_type": "silkpattern",
        "value": "Grade2-Frame.png"
    },
    {
        "trait_type": "dam",
        "value": "Love The Chase"
    },
    {
        "trait_type": "sire",
        "value": "Alpha Bet"
    },
    {
        "trait_type": "grade",
        "value": "1"
    },
    {
        "trait_type": "country",
        "value": "1"
    },
    {
        "trait_type": "breeder",
        "value": "Perry Martin & Steve Coburn"
    },
    {
        "trait_type": "trainer",
        "value": "Art Sherman"
    },
    {
        "trait_type": "description",
        "value": "This horse is for sale."
    },
    {
        "trait_type": "lifewin",
        "value": "17"
    },
    {
        "trait_type": "gender",
        "value": "filly"
    },
    {
        "trait_type": "age",
        "value": "10"
    },
    {
        "trait_type": "rating",
        "value": "90"
    },
    {
        "trait_type": "owner_id",
        "value": "00000"
    },
    {
        "trait_type": "user_horse_id",
        "value": "00000"
    },
    {
        "trait_type": "orig_ghuid",
        "value": "00000"
    },
    {
        "trait_type": "gen",
        "value": "1"
    },
    {
        "trait_type": "bloodline",
        "value": "1"
    },
    {
        "trait_type": "min_speed",
        "value": "85"
    },
    {
        "trait_type": "norm_speed",
        "value": "85"
    },
    {
        "trait_type": "min_stamina",
        "value": "85"
    },
    {
        "trait_type": "norm_stamina",
        "value": "85"
    },
    {
        "trait_type": "min_acceleration",
        "value": "85"
    },
    {
        "trait_type": "norm_acceleration",
        "value": "85"
    },
    {
        "trait_type": "skill_first_out",
        "value": "85"
    },
    {
        "trait_type": "skill_front",
        "value": "85"
    },
    {
        "trait_type": "skill_rail",
        "value": "85"
    },
    {
        "trait_type": "skill_breezing",
        "value": "85"
    },
    {
        "trait_type": "skill_working",
        "value": "85"
    },
    {
        "trait_type": "skill_drafting",
        "value": "85"
    },
    {
        "trait_type": "skill_turning",
        "value": "85"
    },
    {
        "trait_type": "skill_dueling",
        "value": "85"
    },
    {
        "trait_type": "skill_overtaking",
        "value": "85"
    },
    {
        "trait_type": "skill_final_kick",
        "value": "85"
    },
    {
        "trait_type": "skill_closing",
        "value": "85"
    },
    {
        "trait_type": "skill_front",
        "value": "85"
    },
    {
        "trait_type": "speed_trait_1",
        "value": "skill_xx"
    },
    {
        "trait_type": "speed_trait_2",
        "value": "skill_xx"
    },
    {
        "trait_type": "speed_trait_3",
        "value": "skill_xx"
    },
    {
        "trait_type": "speed_trait_4",
        "value": "skill_xx"
    },
    {
        "trait_type": "stamina_trait_1",
        "value": "skill_xx"
    },
    {
        "trait_type": "stamina_trait_2",
        "value": "skill_xx"
    },
    {
        "trait_type": "stamina_trait_3",
        "value": "skill_xx"
    },
    {
        "trait_type": "stamina_trait_4",
        "value": "skill_xx"
    },
    {
        "trait_type": "acceleration_trait_1",
        "value": "skill_xx"
    },
    {
        "trait_type": "acceleration_trait_2",
        "value": "skill_xx"
    },
    {
        "trait_type": "acceleration_trait_3",
        "value": "skill_xx"
    },
    {
        "trait_type": "acceleration_trait_4",
        "value": "skill_xx"
    },
    {
        "trait_type": "trait_small_size",
        "value": "00"
    },
    {
        "trait_type": "trait_avg_size",
        "value": "00"
    },
    {
        "trait_type": "trait_big_size",
        "value": "00"
    },
    {
        "trait_type": "trait_colossus_size",
        "value": "00"
    },
    {
        "trait_type": "trait_high_stride",
        "value": "00"
    },
    {
        "trait_type": "trait_pony_strider",
        "value": "00"
    },
    {
        "trait_type": "trait_silky_stride",
        "value": "00"
    },
    {
        "trait_type": "trait_long_strider",
        "value": "00"
    },
    {
        "trait_type": "trait_rip_quarters",
        "value": "00"
    },
    {
        "trait_type": "trait_muscular",
        "value": "00"
    },
    {
        "trait_type": "trait_athletic_build",
        "value": "00"
    },
    {
        "trait_type": "trait_plenty_of_bone",
        "value": "00"
    },
    {
        "trait_type": "trait_turf_lover",
        "value": "00"
    },
    {
        "trait_type": "trait_dirt_digger",
        "value": "00"
    },
    {
        "trait_type": "trait_comp_driver",
        "value": "00"
    },
    {
        "trait_type": "trait_turner",
        "value": "00"
    },
    {
        "trait_type": "trait_comf_runner",
        "value": "00"
    },
    {
        "trait_type": "trait_quick_speed",
        "value": "00"
    },
    {
        "trait_type": "trait_sprinter",
        "value": "00"
    },
    {
        "trait_type": "trait_miler",
        "value": "00"
    },
    {
        "trait_type": "trait_marathoner",
        "value": "00"
    },
    {
        "trait_type": "trait_muddy_runner",
        "value": "00"
    },
    {
        "trait_type": "trait_nice_and_hot",
        "value": "00"
    },
    {
        "trait_type": "trait_cold_killer",
        "value": "00"
    },
    {
        "trait_type": "trait_wet_winner",
        "value": "00"
    },
    {
        "trait_type": "trait_leader",
        "value": "00"
    },
    {
        "trait_type": "trait_hunter",
        "value": "00"
    },
    {
        "trait_type": "trait_del_motivation",
        "value": "00"
    },
    {
        "trait_type": "trait_starter",
        "value": "00"
    },
    {
        "trait_type": "trait_jockeying",
        "value": "00"
    },
    {
        "trait_type": "trait_finisher",
        "value": "00"
    },
    {
        "trait_type": "trait_learner",
        "value": "00"
    }
]