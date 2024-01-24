
class APIFeatures {

    constructor(query, queryString) {
        this.query = query
        this.queryString = queryString
    }

    filter() {
        //1A)FILTERING
        const queryObj = { ...this.queryString } // we're creating a deep copy of the query
        const excludedFields = ['page', 'sort', 'limit', 'fields']
        excludedFields.forEach(ele => delete queryObj[ele]); //excluding the fields from the query for better filtering as pagination isn't a filter


        //1B)ADVANCED FILTERING
        let queryStr = JSON.stringify(queryObj);//queryObj will contain only the filters
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`) //if we give as price>(gte)21 the this line is for adding $ before the operator gte

        //127.0.0.1: 3000 / api / v1 / tours ? duration = 5 & maxGroupSize[lte]=8

        this.query = this.query.find(JSON.parse(queryStr));

        return this
    }

    sort() {
        //2)SORTING (if sort attrinbute is specified)
        if (this.queryString.sort) {
            const sortBy = this.queryString.sort.split(',').join(' ');

            this.query = this.query.sort(sortBy)
            //if there is a tie in sorting, we can have a second arg based on which sorting can happen
            //thus in mongo we  give it as sort(price ratingsAverage)
            //we cant give whitespace in query, thus give comma

        } else {
            this.query = this.query.sort('-createdAt');//with minus sign, we sort in DESCENDING order
        }

        return this
    }

    limitFields() {
        //FIELD LIMITING (send selective fields to the client)
        if (this.queryString.fields) {
            const fields = this.queryString.fields.split(',').join(' ')
            this.query = this.query.select(fields)
        } else {
            this.query = this.query.select('-__v')//this fields is defaulty included by mongoose
        }
        return this
    }

    paginate() {
        //PAGINATION
        const page = this.queryString.page * 1 || 1;
        const limit = this.queryString.limit * 1 || 100;
        const skip = (page - 1) * limit;

        this.query = this.query.skip(skip).limit(limit);

        return this
    }
}

module.exports = APIFeatures