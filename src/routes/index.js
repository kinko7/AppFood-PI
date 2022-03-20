const {
    Router
} = require("express");
const {
    default: axios
} = require("axios");
const {
    Recipe,
    Diet,
    Recipe_Diet
} = require("../db");
const {
    Op,
    where
} = require("sequelize");
const {
    v4: uuidv4
} = require("uuid");
const e = require("express");
require("dotenv").config();
const {
    MY_API_KEY
} = process.env;
const router = Router();
const cors =  require("cors");

router.get("/", async (req, res ) => {
    res.send("Welcame api") 
})

router.get("/recipes", async (req, res, next) => {
    const infoApi = async () => {
        const getApi = await axios.get(`https://api.spoonacular.com/recipes/complexSearch?apiKey=${MY_API_KEY}&addRecipeInformation=true&number=${100}`);
        const apiData = await getApi.data.results.map(e => {
            return {
                id: e.id,
                title: e.title,
                image: e.image,
                Diets: e.diets,
                healthScore: e.healthScore,
                spoonacularScore: e.spoonacularScore,
                summary: e.summary.replace(/<[^>]*>?/g, ""),
                dishTypes: e.dishTypes,
                steps: e.analyzedInstructions.map((s) => s.steps.map((e) => e.step)),
            }
        });
        return apiData;
    }


    const infoDB = async () => {
        return await Recipe.findAll({
            include: {
                model: Diet,
                attributes: ['name'],
                through: {
                    attributes: []
                }
            }
        })
    };




    const allRecipes = async () => {
        const apiData = await infoApi();
        const apiDB = await infoDB();
        const infoTotal = apiData.concat(apiDB);
        return infoTotal;
    };
    const { title } = req.query;

    try {
        const totalRecipes = await allRecipes();

        if (title) {
            const nameRecipes = await totalRecipes.filter(e =>
                e.title.toLowerCase().includes(title.toLocaleLowerCase())
            )
            nameRecipes.length ?
                res.send(nameRecipes) :
                res.status(404).send({ error: 'no se ha encontrado la receta' })
        } else {
            return res.status(200).send(totalRecipes)
        }
    } catch (error) {
        next(error)
    }
});



router.get("/recipes/:id", async (req, res) => {
    const { id } = req.params;
    try {

        let db = await Recipe.findOne({
            where: {
                id: id,
            },
            include: {
                model: Diet,
            },
        });


        res.json(db);
    } catch {
        try {
            const apiRecipe = await axios.get(
                `https://api.spoonacular.com/recipes/${id}/information?apiKey=${MY_API_KEY}`
            );
            const resu = await apiRecipe.data;
            detailRecipe = {
                id: resu.id,
                summary: resu.summary.replace(/<[^>]*>?/g, ""),
                score: resu.score,
                image: resu.image,
                title: resu.title,
                healthScore: resu.healthScore,
                spoonacularScore: resu.spoonacularScore,
                dishTypes: resu.dishTypes,
                diets: resu.diets,
                steps: resu.analyzedInstructions
                    .map((s) => s.steps.map((e) => e.step))
                    .flat(1)
                    .join(" "),
            };

            return res.json(detailRecipe);
        } catch {
            return res.json("Invalid Id");
        }
    }
});


const typesDiet = [
    "gluten free",
    "dairy free",
    "lacto ovo vegetarian",
    "paleolithic",
    "fodmap friendly",
    "vegan",
    "primal",
    "pescetarian",
    "whole 30",
    "vegetarian",
    "paleo",
]


router.get('/types', async (req, res, next) => {
    try {


        const typesApi = typesDiet
        typesApi.forEach(el => {
            Diet.findOrCreate({
                where: {
                    name: el
                }
            })
        })
        const allDiets = await Diet.findAll()
        res.send(allDiets)
    } catch (error) {
        next(error);
    }
});
router.post('/recipe', async (req, res, next) => {
    let { name, summary, healthScore, healthLevel, steps, diets, image } = req.body;
    try {
        const newRecipe = await Recipe.create({
            id: uuidv4(),
            name,
            summary,
            healthScore,
            healthLevel,
            steps,
            image
        })
        let typeDB = await Diet.findAll({
            where: { name: diets },
        });
        await newRecipe.addDiet(typeDB);
        res.send(newRecipe);

    } catch (error) {
        next(error)
    }
});

module.exports = router;