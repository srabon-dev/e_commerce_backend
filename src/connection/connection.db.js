const mongoose = require('mongoose');

const connectionDb = async ()=>{
    try{
        await mongoose.connect(`mongodb+srv://srabondev:7a5iOnH4aMTFRc5D@cluster0.yesfk.mongodb.net/srabonDB?retryWrites=true&w=majority&appName=Cluster0`);
        console.log(`DB connection successful! at ${new Date().toLocaleString()}`);
    }catch(e){
        console.error('DB Connection Error:', e);
        process.exit(1);
    }
}

module.exports = connectionDb;