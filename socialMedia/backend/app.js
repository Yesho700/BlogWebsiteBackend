//MongoDB
//username : admin
//password : Xhjww6KWBxvYdwOE

import express from 'express';
import mongoose from 'mongoose';
import blogrouter from './routes/blog-routes';
import router from './routes/user-routes';
 

const app = express();

app.use(express.json());

app.use('/api/user', router);

app.use('/api/blog', blogrouter);

mongoose.connect(
    'mongodb+srv://admin:Xhjww6KWBxvYdwOE@cluster0.4if7juy.mongodb.net/Blog?retryWrites=true&w=majority'
    ).then(
        ()=>app.listen(3000)).then(
            ()=>console.log(
                `Connected To DataBase and Listening to localhost 3000`
                ).catch((err)=>console.log(err)));

            
