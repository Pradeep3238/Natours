const Tour = require('../models/tourModel.js');
const APIFeatures = require('../utils/apiFeatures.js');


exports.aliasTour = (req, res, next) => {
  req.query.limit = '5'
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,rating,summary,description';
  next();
}


exports.getAllTours = async (req, res) => {

  try {

    //BUILDING the query
    //EXECUTE the query
    const features = new APIFeatures(Tour.find(), req.query).filter().sort().limitFields().paginate();

    const tours = await features.query; 

    res.status(200).json({
      status: 'success',
      results: tours.length,
      requestedAt: req.requestTime,
      data: {
        tours
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'failed',
      message: 'Could not fetch all the tours'
    })
  }
}




exports.getTour = async (req, res) => {

  try {
    const tour = await Tour.findById(req.params.id);
    //this is similar to Tour.find({_id:req.params.id})
    res.status(200).json({
      status: 'success',
      data: {
        tour
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'falied',
      message: err
    })
  }

}

exports.createTour = async (req, res) => {
  try {

    const newTour = await Tour.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour
      }
    })

  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: 'Invalid data sent'
    })
  }
}

exports.updateTour = async (req, res) => {
  try {

    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true, //to return the updated tour object
      runValidators: true //to revalidate the newly modified tour object
    });

    res.status(200).json({
      status: 'success',
      data: {
        tour
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'Failed',
      message: err
    })
  }
}

exports.deleteTour = async (req, res) => {
  try {

    await Tour.findByIdAndDelete(req.params.id, req.body)
    res.status(200).json({
      status: 'success',
      data: null
    });
  } catch (err) {
    res.status(400).json({
      status: 'failed',
      message: 'Could not delete the tour object with the given id'
    })
  }
}






exports.getTourStats = async (req, res) => {
  try {

    const stats = Tour.aggregate([
      {
        $match: { ratingsAverage: { $gte: 4.5 } }
      },
      {
        $group: {
          _id: null,
          numTours: { $sum: 1 }, //for each tour, theis filed will be added with 1
          numRatings: { $sum: '$ratingsQuantity' },
          avgRating: { $avg: '$ratingsAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' }
        }
      }
    ])

    res.status(200).json({
      status: 'success',
      data: {
        stats
      }
    });

  } catch (err) {
    res.status(400).json({
      status: 'failed',
      message: 'Could not fetch tour statistics' && err
    })
  }

}



exports.getMonthlyPlan=async (req,res) =>{
  try{
    const year = req.params.year * 1

    const plan = await Tour.aggregate([
      {
        $unwind: '$startDates' //to create seperate document for each tour with multiple dates
      },
      {
        $match: {
          startDates :{
            $gte : new Date(`${year}-01-01`),
            $lte : new Date(`${year}-12-31`)
          }
        } 
      },
      {
        $group:{
          _id: { $month : '$startDates'} ,//parses the month from the given date using $month operator
          numTourStarts : {$sum:1},
          tours : {$push : '$name'} //create the array of tours on the given date
        }
      },
      {
        $addFields : {month : '$_id'} //add a new field 
      },
      {
        $project :{
          _id : 0
        }
      },
      {
        $sort : {numTourStarts : -1}
      }
    ])

    res.status(200).json({
      status: 'success',
      data: {
        plan
      }
    });

  }catch(err){
    res.status(400).json({
      status: 'failed',
      message:  err
    })
  }
}