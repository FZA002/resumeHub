"use strict";
const path = require('path')
require("dotenv").config({ path: path.resolve(__dirname, 'credentials/.env') })

const databaseAndCollection = {db: "CMSC335_DB", collection: "resumes"}
const { MongoClient } = require('mongodb')
const uri = process.env.MONGO_CONNECTION_STRING
const client = new MongoClient(uri)

const express = require("express")
const app = express()
const bodyParser = require("body-parser")
app.use(bodyParser.urlencoded({extended:false}))
app.set("views", path.resolve(__dirname, "templates"))
app.set("view engine", "ejs")
app.use(express.static(__dirname + '/templates'));

app.get("/", (request, response) => {
    response.render("index");
})

app.get("/create", (request, response) => {
    response.render("create")
})

app.post("/create", (request, response) => {
    let {firstName, lastName, email, education, gpa, workExperience, skills} = request.body;

    let catImagesUrl = `https://api.thedogapi.com/v1/images/search`;
    let catImage = fetch(catImagesUrl).then(response => response.json()).then(json => json[0].url).then(function(result) {

    let catHTML = `<img src='${result}' alt='cat' wdith='250' height='250'>`
    
    let variables = {
        firstName: firstName,
        lastName: lastName,
        email: email,
        education: education,
        gpa: gpa,
        workExperience: workExperience,
        skills: skills,
        catImage: catHTML
    }

    client.db(databaseAndCollection.db).collection(databaseAndCollection.collection).insertOne(variables)
    .then(response.render("processResume", variables))
    }) 
})

app.get("/review", (request, response) => {
    response.render("review")
})

app.post("/review", async (request, response) => {
    let {firstName, lastName, email} = request.body
    let filter = {firstName: firstName, lastName, lastName, email: email}
    let resume = await client.db(databaseAndCollection.db)
                .collection(databaseAndCollection.collection)
                .findOne(filter)

    let variables = {
        firstName: resume.firstName, 
        lastName: resume.lastName, 
        email: resume.email,
        education: resume.education,
        gpa: resume.gpa,
        workExperience: resume.workExperience,
        skills: resume.skills
    }

    response.render("processReview", variables)
})

/* EXPRESS SERVER */
const PORT = 3000

async function main() {
    await client.connect()
    .then(app.listen(PORT, () => {
        console.log(`Web server started and running at: http://localhost:${PORT}`);
    }))
    .catch(err => {console.error(`Fatal error occurred: ${err}`); return false});
}

main()



