const express = require('express')
const app = express()
const apidata = require('./apidata/api')
const cors  = require('cors')

app.use(cors({
    origin: 'http://localhost:3000' 
}));


app.get('/api/data',(req,res)=>{
    res.json(apidata);
})

app.listen(5000,()=>{
    console.log('server running');
})