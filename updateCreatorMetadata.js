// ## Script Overview:

// This script focuses on updating the creator address of NFTs that exist off-chain but are linked to the blockchain. It's designed specifically to rectify the creator address for 490 horses that currently have an incorrect creator address associated with them.

// ## Usage

// Prepare a CSV file named "pnfts_to_update" within the "csvs" folder. This file will contain the necessary data, specifically the 'nftAddress', which the script will extract to execute the updates.



const axios = require('axios');
const fs = require('fs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const { parse } = require("csv-parse");

async function main() {

    // const ApiUrlSol = "https://ownersclub-sol.invinciblegg.com/"
    // const ApiUrlSol = "http://localhost:7773/"


    async function updateNftCreatorApi(nftAddress) {
        try {
            console.log("Updating creator start...")

            const requestBody = {
                tokenAddress: nftAddress
            }

            const response = await axios.post(`${ApiUrlSol}update_creator`, requestBody);
            if (response.data) {
                console.log("Updating creator success...")
                console.log(response.data)
                return {
                    updatedData: response.data
                }
            } else {
                console.log("Updating creator failure")
                return false
            }
        } catch (error) {
            console.log("Error: ", error)
            return false
        }
    }


    async function updateNftCreator() {

        // let counter = 0;
        // Read the new CSV file with wallet address 
        const csvPipe = fs.createReadStream('./csvs/pnfts_to_update.csv').pipe(parse({ delimiter: ",", from_line: 2 }));
        csvPipe.on("data", async function (row) {
            csvPipe.pause();
            // console.log("csvPipe started");
            // counter = counter + 1;
            const nftAddress = row[0];

            // console.log("WalletAddress: ", walletAddress, " | Counter: ", counter)

            const updateCreatorResponse = await updateNftCreatorApi(nftAddress);
            if (!updateCreatorResponse) {
                console.log("Error in update creator response");
                return;
            }
            // console.log("API CAll success");

            // Gather data
            const dataToWrite = gatherData(updateCreatorResponse.updatedData.nftAddress, updateCreatorResponse.updatedData.status);

            // Write data to CSV
            writeToCsv(dataToWrite);

            // if (counter === 5) {
            //     console.log("=> Waiting....");
            //     setTimeout(() => {
            //         counter = 0;
            //         console.log("=> In time out");
            //         csvPipe.resume();
            //     }, 5000);
            // }
            // else csvPipe.resume()

            csvPipe.resume()

        })
    }

    updateNftCreator()

}

main();

// Function to gather data
function gatherData(nftAddress, status) {
    // Perform some operations to gather data
    const newData = [
        {
            time: Date.now(),
            tokenAddress: nftAddress,
            status: status,
        },
    ];

    return newData;
}

// Function to write data to CSV file
function writeToCsv(data) {
    const csvFilePath = 'updatedNfTCreators.csv';

    // Check if the file exists
    const fileExists = fs.existsSync(csvFilePath);

    // Create a CSV writer object with the appropriate options
    const csvWriter = createCsvWriter({
        path: csvFilePath,
        header: [
            { id: 'time', title: 'Time' },
            { id: 'tokenAddress', title: 'Mint Address' },
            { id: 'status', title: 'Status' },
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
