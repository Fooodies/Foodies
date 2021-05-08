'use strict';

require('dotenv').config()
const express = require('express')
const server = express();

const pg = require('pg')
const superagent = require('superagent');
const methodOverride = require('method-override')
const client = new pg.Client(process.env.DATABASE_URL)
// const client = new pg.Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });


server.set('view engine','ejs')
server.use(methodOverride('_method'))
server.use(express.static('./public'))
server.use(express.urlencoded({extended:true})); 
// for storing the data inside the body, instead of the url or the form data

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`listening to port ${PORT}`)
})
server.get('/', mainPage)
server.get('/search', handleSearch)
server.post('/searchbyingredient', handleSearchByIngredient)
server.post('/randomsearch', randomSearch)
server.post('/details', showDetails)
server.post('/calories', caloriesSearch)
server.post('/cuisine',cuisineHandler)
// server.post('/nutritionvalue/:id', checkNutretionValue)
// Superagent Functionality


// 1) render the main page, with 10 random recipes
function mainPage (req,res) {
    res.render('index')
}

// handle the searches page itself
function handleSearch (req,res) {
    res.render('search')
}

// 2) handle search by ingredients
function handleSearchByIngredient (req,res) {
    let recipes = [];
    let ingredients = req.body.ingredients; //change it back to body
    console.log(ingredients)
    let key = process.env.apiKey;
    let url = `https://api.spoonacular.com/recipes/findByIngredients?apiKey=${key}&ingredients=${ingredients}`
    superagent.get(url)
    .then(data=> {
        data.body.forEach(element => {
            let newDish = new Dish(element)
            recipes.push(newDish);
        })
        res.render('showDishes',{dishes: recipes})
    })
    
}

// 3) handle random searches, when the user just wants to explore some recipes
function randomSearch (req,res) {
    let recipes = [];
    let key = process.env.apiKey;
    let url = `https://api.spoonacular.com/recipes/random?number=10&apiKey=${key}`;
    superagent.get(url)
    .then(data=>{
        data.body.recipes.forEach(element => {
            let newDish = new Dish(element)
            recipes.push(newDish);
        })
        res.render('showDishes', {dishes: recipes});
    })
}

// function superagentHandler () {}
// handle the calories route
function caloriesSearch (req,res) {
    let recipes = [];
    let min = req.body.min;
    let max = req.body.max;
    let key = process.env.apiKey;
    let url = `https://api.spoonacular.com/recipes/findByNutrients?apiKey=${key}&minCalories=${min}&maxCalories=${max}`
    superagent.get(url)
    .then(data => {
        data.body.forEach(element => {
            let newDish = new Dish(element)
            recipes.push(newDish);
        })
        res.render('showDishes', {dishes: recipes});
    })
}
// 4) handle if someone hit the details button
function showDetails (req,res) {
    let id = req.body.Resid;
    let key = process.env.apiKey;
    let url = `https://api.spoonacular.com/recipes/${id}/information?apiKey=${key}`
    superagent.get(url)
    .then(data => {
        let detailedRecipe = new Recipe (data.body)
        res.render('recipe', {recipe: detailedRecipe})
    })
}

// handle the cuisine route

function cuisineHandler (req,res) {
    let cuisine = req.body.cuisine;
    let key = process.env.apiKey;
    let recipes = [];
    let url = `https://api.spoonacular.com/recipes/complexSearch?apiKey=${key}&cuisine=${cuisine}`
    superagent.get(url)
    .then(data => {
        data.body.results.forEach(element => {
            let newDish = new Dish(element)
            recipes.push(newDish);
        })
        res.render('showDishes',{dishes: recipes})
    })
}

// check the nutrition value
function checkNutretionValue (req,res) {
    let id = req.params.id;
    let key = process.env.apiKey;
    let url = `https://api.spoonacular.com/recipes/${id}/nutritionWidget.json?apiKey=${key}`
    superagent.get(url)
    .then(data=>{
        let nutrition = new Nutrition(data.body)
    })
}


// Constructor functions
// 1) for rendering the dishes for all API requests
function Dish (element) {
    this.id = element.id;
    this.title = element.title;
    this.image = element.image;
}

// 2) for rendering details about a certain recipe
function Recipe (data) {
    this.id = data.id;
    this.title = data.title ? data.title : `Title not available`;
    this.image = data.image ? data.image : `https://foodtango.com.au/img/ui/noimage.png`;
    this.ingredients = data.extendedIngredients ? data.extendedIngredients.map(value => value.originalString) : `ingredients are not available for now`;
    this.time = data.readyInMinutes ? data.readyInMinutes : `Preparation time not available`;
    this.instructions = data.instructions ? data.instructions : `Sorry, but the instructions for this dish are not available`;
    this.servings = data.servings;
    this.summary = data.summary;
}

// 3) for the nutrition value
// function Nutrition (data) {
//     this.calories = data.calories;
//     this.carbs = data.carbs;
//     this.fat = data.fat;
//     this.protein = data.protein;
// }