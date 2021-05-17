/* global addcomment */
'use strict';
const bodyParser = require("body-parser");
require('dotenv').config()
const express = require('express')
const server = express();
const pg = require('pg')
const superagent = require('superagent');
const methodOverride = require('method-override');
// const client = new pg.Client(process.env.DATABASE_URL)
server.use(express.json());
const client = new pg.Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });


server.set('view engine','ejs')
server.use(methodOverride('_method'))
server.use(express.static('./public'))
server.use(methodOverride('_method'))
server.use(express.urlencoded({extended:true})); 
// for storing the data inside the body, instead of the url or the form data

const PORT = process.env.PORT || 3000;

client.connect()
.then(()=>{
server.listen(PORT, () => {
    console.log(`listening to port ${PORT}`)
})
});

server.get('/', mainPage)
server.get('/search', handleSearch)
server.post('/searchbyingredient', handleSearchByIngredient)
server.post('/randomsearch', randomSearch)
server.post('/details', showDetails)
server.post('/calories', caloriesSearch)
server.post('/cuisine',cuisineHandler)
server.get('/addrecipe',addrecipe)
server.post('/community',community)
server.get('/community',displayCommunity)
server.post('/diet',dietHand)
server.post('/intolerances',intolerancesHand)
server.post('/type',typeHand)
server.post('/maxReadyTime',maxReadyTimeHand)
server.get('/aboutus', renderAboutUs)
server.post('/community/:id', addComments)
server.get('*', handleNotFound)

// server.post('/nutritionvalue/:id', checkNutretionValue)
// Superagent Functionality


// 1) render the main page, with 10 random recipes
function mainPage (req,res) {
    res.render('main')
}



function renderAboutUs (req,res) {
    res.render('aboutus')
}

// handle the searches page itself
function handleSearch (req,res) {
    res.render('search')
}

// handle not found page
function handleNotFound (req,res) {
    res.render('notfound')
}

// 2) handle search by ingredients
let ingredients='';
function handleSearchByIngredient(req,res){
    let recipes = [];
    let page=parseInt(req.body.page) || 1;
    const resultPerPage=10;
    let start=((page-1)*resultPerPage+1);
    //  ingredients = req.body.ingredients?req.body.ingredient:ingredients; //change it back to body
    if(req.body.ingredients) ingredients=req.body.ingredients;
    let key = process.env.apiKey;
    let url = `https://api.spoonacular.com/recipes/complexSearch?apiKey=${key}&query=${ingredients}&offset=${start}&number=9`
    superagent.get(url)
    .then(data=> {
        data.body.results.forEach(element => {
            let newDish = new Dish(element)
            recipes.push(newDish);
        })
        res.render('showDishes',{dishes: recipes, url:req.url,page:page+1})
    }) 
}

// 3) handle random searches, when the user just wants to explore some recipes
function randomSearch (req,res) {
    let recipes = [];
    let page=parseInt(req.body.page) || 1;
    const resultPerPage=10;
    let start=((page-1)*resultPerPage+1);
    let key = process.env.apiKey;
    let url = `https://api.spoonacular.com/recipes/random?number=9&apiKey=${key}&offset=${start}`;
    superagent.get(url)
    .then(data=>{
        data.body.recipes.forEach(element => {
            let newDish = new Dish(element)
            recipes.push(newDish);
        })
        res.render('showDishes', {dishes: recipes, url:req.url,page:page+1});
    })
}

// function superagentHandler () {}
// handle the calories route
let min=0;
let max=0;
function caloriesSearch (req,res) {
    let recipes = [];
    let page=parseInt(req.body.page) || 1;
    const resultPerPage=10;
    let start=((page-1)*resultPerPage+1);
     if(req.body.min & req.body.max){
         min=req.body.min;
         max=req.body.max;
     }
    let key = process.env.apiKey;
    let url = `https://api.spoonacular.com/recipes/findByNutrients?apiKey=${key}&minCalories=${min}&maxCalories=${max}&offset=${start}&number=9`
    superagent.get(url)
    .then(data => {
        data.body.forEach(element => {
                let newDish = new Dish(element)
                recipes.push(newDish);
            }) 
        res.render('showDishes', {dishes: recipes,url:req.url,page:page+1});
    })
}
// 4) handle if someone hit the details button
function showDetails (req,res) {
    let id = req.body.Resid;
    let key = process.env.apiKey;
    let url = `https://api.spoonacular.com/recipes/${id}/information?apiKey=${key}`
    superagent.get(url)
    .then(data => {
        let url2=`https://api.spoonacular.com/recipes/${id}/nutritionWidget.json?apiKey=${key}`;
        superagent.get(url2)
        .then((nutretion)=>{
        let detailedRecipe = new Recipe (data.body,nutretion.body)
        res.render('recipe', {recipe: detailedRecipe})
    })
})
}

// handle the cuisine route
let cuisine='';
function cuisineHandler (req,res) {
    let recipes = [];
    let page=parseInt(req.body.page) || 1;
    const resultPerPage=10;
    let start=((page-1)*resultPerPage+1);
    let key = process.env.apiKey;
    if( req.body.cuisine) cuisine=req.body.cuisine;
    console.log(start,key,cuisine);
    let url = `https://api.spoonacular.com/recipes/complexSearch?apiKey=${key}&cuisine=${cuisine}&offset=${start}&number=9`
    superagent.get(url)
    .then(data => {
        data.body.results.forEach(element => {
            let newDish = new Dish(element)
            recipes.push(newDish);
        })
        res.render('showDishes',{dishes: recipes, url:req.url,page:page+1})
    })
}

let diet='';
function dietHand(req,res){
    let recipes = [];
    let page=parseInt(req.body.page) || 1;
    const resultPerPage=10;
    let start=((page-1)*resultPerPage+1);
    let key = process.env.apiKey;
    if( req.body.diet) diet=req.body.diet;
    let url = `https://api.spoonacular.com/recipes/complexSearch?apiKey=${key}&diet=${diet}&offset=${start}&number=9`
    superagent.get(url)
    .then(data => {
        data.body.results.forEach(element => {
            let newDish = new Dish(element)
            recipes.push(newDish);
        })
        res.render('showDishes',{dishes: recipes, url:req.url,page:page+1})
    }) 
}

function addrecipe(req,res){
    res.render('addrecipe');
}

let  intolerances='';
function intolerancesHand(req,res){
    let recipes = [];
    let page=parseInt(req.body.page) || 1;
    const resultPerPage=10;
    let start=((page-1)*resultPerPage+51);
    let key = process.env.apiKey;
    if( req.body.intolerances) intolerances=req.body.intolerances;
    console.log( intolerances,page)
    let url = `https://api.spoonacular.com/recipes/complexSearch?apiKey=${key}&intolerances=${intolerances}&offset=${start}&number=9`
    console.log(url);
    superagent.get(url)
    .then(data => {
        data.body.results.forEach(element => {
            let newDish = new Dish(element)
            recipes.push(newDish);
        })
        res.render('showDishes',{dishes: recipes, url:req.url,page:page+1})
    }) 
}

let type='';
function typeHand(req,res){
    let recipes = [];
    let page=parseInt(req.body.page) || 1;
    const resultPerPage=10;
    let start=((page-1)*resultPerPage+1);
    let key = process.env.apiKey;
    if( req.body.type) type=req.body.type;
    let url = `https://api.spoonacular.com/recipes/complexSearch?apiKey=${key}&type=${type}&offset=${start}&number=9`
    superagent.get(url)
    .then(data => {
        data.body.results.forEach(element => {
            let newDish = new Dish(element)
            recipes.push(newDish);
        })
        res.render('showDishes',{dishes: recipes, url:req.url,page:page+1})
    }) 
}

let maxReadyTime=0;
function maxReadyTimeHand(req,res){
    let recipes = [];
    let page=parseInt(req.body.page) || 1;
    const resultPerPage=10;
    let start=((page-1)*resultPerPage+1);
    let key = process.env.apiKey;
    if( req.body.maxReadyTime) maxReadyTime=req.body.maxReadyTime;
    let url = `https://api.spoonacular.com/recipes/complexSearch?apiKey=${key}&maxReadyTime=${maxReadyTime}&offset=${start}&number=9`
    superagent.get(url)
    .then(data => {
        data.body.results.forEach(element => {
            let newDish = new Dish(element)
            recipes.push(newDish);
        })
        res.render('showDishes',{dishes: recipes, url:req.url,page:page+1})
    }) 
}

function community(req,res){
let sql=`insert into recipe (username,recipename,img_url,ingredient,time,serving,instuctions) values($1,$2,$3,$4,$5,$6,$7);`;
let {username,recipename,img_url, ingredient,time,serving,instuctions}=req.body;
let safeValues=[username,recipename,img_url, ingredient,time,serving,instuctions];
client.query(sql,safeValues)
.then(()=>{
res.redirect('/community');
})
}

function displayCommunity(req,res){
    let recipeArray = [];
    let commentsObject = {};
    let commentsTempArray = [];
    // let commentsName=[];
    let sql = `select * from recipe;`
    client.query(sql)
    .then(recipes=> {
        if(!recipes.rowCount){res.render('community',{recipeData:recipeArray, comments: {}})}
        else{
            
            recipes.rows.forEach((recipe, idx) => {
                let id = recipe.id;
                // console.log(id)
                recipeArray.push(recipe);
                let commentsSql = `select comments,name from commenttable where secid=$1;`
                let safeValues = [id]
                client.query(commentsSql,safeValues)
                .then(commentsa => {
                    if(!commentsa.rowCount){commentsObject[`${id}`] = []}
                    else{
                        // console.log(commentsa.rowCount)
                        commentsa.rows.forEach(commentRow => {
                            commentsTempArray.push(commentRow.name,commentRow.comments)
                        })
                        commentsObject[`${id}`] = commentsTempArray;
                        commentsTempArray = [];
                    }
                    // console.log(recipeArray)
                    // console.log(commentsObject)
                    if(idx === recipes.rows.length -1)
                    res.render('community',{recipeData: recipeArray, comments: commentsObject})
                })
            })

        }

    })


}
// let sql=`select username from recipe;`;
// client.query(sql)
// .then((results)=>{
//     console.log(results.rows) // [ { username: 'sdkjhg' }, { username: 'UJ163033' } ]
// res.render('community',{recipeData:results.rows});
// })

// Constructor functions
// 1) for rendering the dishes for all API requests
function Dish (element) {
    this.id = element.id;
    this.title = element.title ? element.title : `Title not available` ;
    this.image = element.image ? element.image : `https://foodtango.com.au/img/ui/noimage.png`;
}

// 2) for rendering details about a certain recipe
function Recipe (data,nutretion) {
    this.id = data.id;
    this.title = data.title ? data.title : `Title not available`;
    this.image = data.image ? data.image : `https://foodtango.com.au/img/ui/noimage.png`;
    this.ingredients = data.extendedIngredients ? data.extendedIngredients.map(value => value.originalString) : `ingredients are not available for now`;
    this.time = data.readyInMinutes ? data.readyInMinutes : `Preparation time not available`;
    this.instructions = data.instructions ? data.instructions : `Sorry, but the instructions for this dish are not available`;
    this.servings = data.servings;
    this.summary = data.summary;
    this.calories=nutretion.calories;
    this.carbs=nutretion.carbs;
    this.fat=nutretion.fat;
    this.protein=nutretion.protein;
    // Recipe.reciepeArr.push(this);
}
function addComments (req,res){
    let name= req.body.name;
    let comment = req.body.comment;
    let secid = req.params.id;
    let sql = `insert into commenttable (name,comments,secid) values ($1,$2,$3) RETURNING *;`;
    let safeValues = [name,comment,secid]
    client.query(sql,safeValues)
    .then(data=>{
        res.redirect()
    })
}
