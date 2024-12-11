const readline = require("readline");
const fs = require("fs");

const { MongoClient } = require("mongodb");
const url = "mongodb+srv://username:username@cluster0.areej.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(url);

async function readFile() {
    return new Promise((resolve, reject) => {
        const company_data = readline.createInterface({
            input: fs.createReadStream("companies.csv")
        });

        const lines = [];
        company_data.on("line", (line) => {
            cells = line.split(",");
            // Skip the first (header) line
            if (cells[0] == "Company") return;

            console.log(line);

            const document = {
                "name": cells[0],
                "ticker": cells[1],
                "price": cells[2]
            };

            lines.push(document);
        });
        company_data.on("close", () => resolve(lines));
        company_data.on("error", (err) => reject(err));
    });
}

async function processFile() {
    try {
        await client.connect();

        const database = client.db("Stock");
        const collection = database.collection("PublicCompanies");

        const lines = await readFile();

        await collection.insertMany(lines);
    } catch (err) {
        console.log(err);
    } finally {
        await client.close();
    }
};

processFile().catch(console.dir);
