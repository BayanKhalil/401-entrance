'use strict';

const express = require('express');
const cors = require('cors');
const pg = require('pg');
const methodOverride = require('method-override');
const superagent = require('superagent');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT;
const DB = process.env.DATABASE_URL;

const client = new pg.Client(DB);


app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('./public'));
app.use(methodOverride('_method'));
app.set('view engine', 'ejs');
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>



app.get('/get-characters',homeHandler);



app.post('/favorites',addHandler)
app.get('/favorites',add2Handler)

app.delete('/favorites/:id',deleteHandler)
app.get('/favorites/:id',getHandler)


app.post('/details/:id' ,updateHandler)
app.get('/details/:id' ,update2Handler)



app.delete('/details/:id' ,delete2Handler)
app.put('/details/:id' ,updateLocalyHandler)




function homeHandler(req,res){
    let url='https://psychonauts-api.herokuapp.com/api/characters?limit=10';
    superagent.get(url).then(x=>{
       
        let data=x.body.map(object=>new Char(object))
        console.log(data);
        res.render('index',{y:data,cond:0})
        let data2=x.body.map(x=>(x.psiPowers.map(object=>new Logo(object))))
        console.log(data2);
        res.render('index',{suby:data2 ,cond:1})

    })
}




function addHandler(req,res){
    const{name,gender,img}=req.body;
    let sql=`INSERT INTO characters (name,gender,img) VALUES ($1,$2,$3)`
    let safeValues=[name,gender,img];
    client.query(sql,safeValues).then(()=>{
        console.log('done');
        res.redirect('/favorites')
    })
}

function add2Handler(req,res){
    let sql=`SELECT *FROM characters`
    client.query(sql).then(x=>{
        let count=x.rows.length
        res.render('favorites',{data:x.rows,count:count})
    })
}
function deleteHandler(req,res){
    let id=req.params.id;
    let sql=`DELETE FROM characters WHERE id=${id}`
    client.query(sql).then(()=>{
        res.redirect('/favorites')
    })
}
function updateHandler(req,res){
    res.render('details')
}

function getHandler(req,res){
    let id=req.params.id;
    let sql=`SELECT *FROM characters WHERE id=${id}`
    client.query(sql).then(()=>{
        res.render('favorites')
    })
}

function update2Handler(req,res){
    let id=req.params.id;
    let sql=`SELECT *FROM characters WHERE id=${id}`
    client.query(sql).then(x=>{
        console.log(x.rows);
        res.render('details',{data:x.rows})
    })
}

function delete2Handler(req,res){
    let id=req.params.id;
    let sql=`DELETE FROM characters WHERE id=${id}`
    client.query(sql).then(()=>{
        res.redirect('/favorites')
    })
}

function updateLocalyHandler(req,res){
    let id=req.params.id;
    const{name,gender,img}=req.body;
    let sql=`UPDATE characters SET name=$1,gender=$2,img=$3 WHERE id=${id} `
    let safeValues=[name,gender,img];
    client.query(sql,safeValues).then(()=>{
       
        res.redirect(`/details/${id}`)
    })

}




function Char(charInfo){
    this.name=charInfo.name;
    this.gender=charInfo.gender;
    this.img=charInfo.img;
    // this.psiPowers.map(x=>x.img)=charInfo.psiPowers.img;

}

function Logo(imgInfo){
    this.img=imgInfo.img
    this.name=imgInfo.name
}







app.get('/', (req, res) => {
    res.send('everything is working!')
});

client.connect().then(() =>
    app.listen(PORT, () => console.log(`Listening on port: ${PORT}`))
);