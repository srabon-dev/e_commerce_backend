require('dotenv').config();
const app = require('./app');
const connectionDb = require('./src/connection/connection.db');

async function main(){
    try{
        const PORT = process.env.PORT || 3001;

        await connectionDb();

        app.listen(PORT,()=>{
            console.log(`Server is Running http://localhost:${PORT}`);
        });
    }catch(e){
        console.log(`Main Server Error ${e}`);
    }
}

main();
