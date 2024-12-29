const mongodb = require('mongoose');

const connectionDb = async ()=>{
    try{
        await mongodb.connect(process.env.ConnectionUrl);
        console.log(`DB connection successful! at ${new Date().toLocaleString()}`);
    }catch(e){
        console.error('DB Connection Error:', e);
        process.exit(1);
    }
}

module.exports = connectionDb;