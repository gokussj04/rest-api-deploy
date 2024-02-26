const express = require("express");
const movies = require("./movies.json");
const crypto = require("node:crypto");
const cors = require("cors");
const { validateMovie, validateParcialMovie } = require("./schemas/movies");
const PORT = process.env.PORT ?? 1234;

const app = express();
app.disable('x-powered-by');


app.use(express.json());
app.use(cors({
    origin: (origin, callback) => {
        const ACCEPTED_ORIGINS = [
            'http://localhost:8080',
            'http://localhost:1234',
            'http://movies.com',
            'http://midu.dev'
        ]


        if (ACCEPTED_ORIGINS.includes(origin)) {
            return callback(null, true);
        }

        if (!origin) {
            return callback(null, true)
        }


        return callback(new Error('Not allowed by CORS'))
    }
}));

// métodos normales: GET/HEAD/POST
// métodos complejos: PUT/PATCH/DELETE

// CORS PRE-Flight
// OPTIONS



app.get("/", (req, res) => {
  res.send("<h1>Pagina principal</h1>");
});

// Todos los recursos que sean MOVIES se indetifican con /movies
app.get('/movies', (req, res) => {

    // res.header('Access-Control-Allow-Origin', 'http://localhost:8080');

    const { genre } = req.query;


    if (genre) {
        const filteredMovies = movies.filter(movie=>{
           return movie.genre.some( g => g.toLowerCase() === genre.toLowerCase() );
        });


        return res.json( filteredMovies );
    }



    res.json(movies);
})

app.post('/movies', (req, res) => {

    const result = validateMovie( req.body );

    if ( result.error ) {
        return res.status(400).json({ 
            error: JSON.parse(result.error.message) 
        });
    }

    const newMovie = {
        id: crypto.randomUUID(), // uuid v4
        ...result.data
    }

    // Esto no sería REST, porque estamos guardando
    // el estado de la aplicación en memoria
    movies.push(newMovie);

    res.status(201).json(newMovie) // se puede devolver el recurso para actualizar la caché del cliente
});

app.delete('/movies/:id', (req, res)=>{
    // res.header('Access-Control-Allow-Origin', 'http://localhost:8080');
    const { id } = req.params

    const movieIndex = movies.findIndex(movie => movie.id === id)

    if (!movieIndex) return res.status(404).json({ message: 'Movie not found' });

    movies.splice(movieIndex, 1);
    return res.json({ message: 'Movie deleted' });
})




app.get('/movies/:id', (req, res) => { // path-to-regexp
    const { id } = req.params
    const movie = movies.find(movie => movie.id === id)
    if (movie) return res.json( movie );

    res.status(404).json({ message: 'Movie not found' });

})

app.patch('/movies/:id', (req, res) => {
    
    const result = validateParcialMovie( req.body );
    if ( result.error ) {
        return res.status(400).json({ 
            error: JSON.parse(result.error.message) 
        })
    }
    
    const { id } = req.params
    const movieIndex = movies.findIndex( movie => movie.id === id )
    if(movieIndex === -1) return res.status(404).json({ message: 'Movie not found' });

    const movieActualizada = { 
        ...movies[movieIndex], 
        ...result.data 
    }
    movies[movieIndex] = movieActualizada;

    return res.json(movieActualizada);
});


// app.options('/movies/:id', (req, res)=>{
//     res.header( "Access-Control-Allow-Origin", "http://localhost:8080" )
//     res.header( "Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE")
//     res.send();
// });

app.use((req,res) => {
    res.status(404).send('<h1>404</h1>');
});

app.listen(PORT, () => {
  console.log("SERVER LISTENING");
  console.log(`http://localhost:${PORT}`);
});
