//using a simple command line application to load the data from a file and send it to the database

const dotenv = require('dotenv');
const mongoose = require('mongoose');
const fs = require('fs');
const Tour = require('../../models/tourModel');
dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE_URL.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose.connect(DB, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useFindAndModify: false
}).then(() => console.log('DB connection established'))

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours-simple.json`));
//parse the array to array of javascript objects

const import_data = async (req,res) =>{

    try{

        await Tour.create(tours)
        console.log("Data imported successfully")

    }catch(err){
        console.log(err)
    }
    process.exit();
}

const delete_All = async (req, res) => {

    try {

        await Tour.deleteMany()
        console.log("Data deleted successfully")

    } catch (err) {
        console.log(err)
    }
    process.exit(); //ending the app when the operation is done or error

}

if(process.argv[2]==='--import_data') {
    import_data();
}else if(process.argv[2]==='--delete_All') {
    delete_All();
}