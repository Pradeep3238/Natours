const  mongoose  = require("mongoose");
const slugify = require("slugify");
const validator = require("validator");

const tourSchema = new mongoose.Schema({
    name:{
        type : String,
        required: [true, 'A tour must have a name '],
        unique: true,
        trim : true,
        minlength: [5, 'name must be less than 15 characters'],
        maxlength : [15, 'name must be less than 15 characters'],
        validators: [validator.isAlpha, 'name must contain alphabets only'] 
    },
    slug : String,
    duration:{
        type : Number,
        required: [true, 'A tour must have a duration'],
    },
    maxGroupSize:{
        type : Number,
        required: [true, 'A tour must have a maximum group size']
    },
    difficulty:{
        type : String,
        required: [true, 'A tour must have a difficulty'],
        enum: {
            values : ['easy','medium','difficult'],
            message : 'A tour difficulty must be either hard or medium or easy',
        }
    },
    ratingsAverage:{
        type : Number,
        default : 4.5
    },
    ratingsQuantity:{
        type : Number,
        default : 0
    },
    price:{
        type : Number,
        required: [true, 'A tour must have a price']
    },
    priceDiscount:{
        type : Number,
        validate : {
            //this keyword points on the current
            validators : function(val){
                return val < this.price
            },
            message : 'discount {{VALUE}} must be less than the actual  price'
        }
    },
    summary:{
        type : String,
        required : [true, 'A tour must have a description'],
        trim : true //removed redundant WHITE spaces in the start and end of the string
    },
    descritpion:{
        type:String,
        trim : true
    },
    imageCover:{
        type : String,
        required : [true, 'A tour must have a cover image']
    },
    images:[ String ],
    createdAt:{
        type : Date,
        default: Date.now(),
        select: false //defaultly hide this fiend from client as it is needed only for internal calculations
    },
    secretTour:{
        type : Boolean,
        default : false
    },
    startDates:[ Date ]
},
{
    toJSON : {virtuals : true},
    toObject : {virtuals : true}
})

tourSchema.virtual('durationWeeks').get(function(){
    return this.duration / 7
})

//DOCUMENT MIDDLEWARE - Runs whenver a document is created save() and create()

//before creation
tourSchema.pre('save',function(next){
    this.slug = slugify(this.name, {lower : true});
    next();
})

// //after creation - the document that is just created will be available in the post middleware
// tourSchema.post('save',function(doc,next){
//     console.log(doc)
//     next();
// })

//QUERY MIDDLEWARE find(), findOne(), findAndDelete()....etc...
//runs before find query
tourSchema.pre(/^find/,function(next){
    this.find = this.find({ secretTour : {$ne : true}})
    this.start = Date.now(); 
    next()
})

//runs after find query
tourSchema.post(/^find/, function (docs,next) {
    console.log(`Query: took ${Date.now() - this.start} ms`)
    next();
})


//AGGREGATION MIDDLEWARE
tourSchema.pre('aggregate', function (){
    this.pipeline().unshift({$match: { secretTour : {$ne : true}}})
})

const Tours = mongoose.model('Tour', tourSchema)

module.exports = Tours;