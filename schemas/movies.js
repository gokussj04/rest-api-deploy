const z = require("zod");


const movieSchema = z.object({
    title: z.string({
        invalid_type_error: "El titulo tiene que ser string",
        required_error: "El titulo es requerido"
    }),
    year: z.number().int().positive().min(1900).max(2024),
    director: z.string(),
    duration: z.number().int().positive(),
    rate: z.number().min(0).max(10).default(0),
    poster: z.string().url({
        message: "El poster tiene que ser una URL valida"
    }),
    genre: z.array(
        z.enum(['Crime', 'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Thriller', 'Sci-Fi'])
    )
})


function validateMovie(object) {
    return movieSchema.safeParse(object)
}

function validateParcialMovie(object) {
    return movieSchema.partial().safeParse(object);
}



module.exports = {
    validateMovie,
    validateParcialMovie
}





