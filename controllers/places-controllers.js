const uuid = require('uuid/v4');
const { validationResult } = require('express-validator');

const HttpError = require('../models/http-error');
const getCoordsForAddress = require('../util/location');
const Place = require('../models/place');

let DUMMY_PLACES = [
  {
    id: 'p1',
    title: 'Empire State Building',
    description: 'One of the most famous sky scrapers in the world!',
    location: {
      lat: 40.7484474,
      lng: -73.9871516
    },
    address: '20 W 34th St, New York, NY 10001',
    creator: 'u1'
  }
];

const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid; // { pid: 'p1' }
  let place;
  try{
   place = await Place.findById(placeId)
  }catch(erro){
    const error = HttpError("something went wrong" , 500)
    return next(error)
  }

  if (!place) {
    return next( new HttpError('Could not find a place for the provided id.', 404) );
  }

  res.json({ place : place.toObject({getters:true}) }); // => { place } => { place: place }
};

// function getPlaceById() { ... }
// const getPlaceById = function() { ... }

const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;
  let places;
  try{ places = await Place.find({creator:userId});}
  catch (er) { 
    const error = HttpError("failed",500)
    return next(error)
  }

  if (!places || places.length === 0) {
    return next(
      new HttpError('Could not find places for the provided user id.', 404)
    );
  }

  res.json({ places : places.map((place) => place.toObject({getters:true})) });
};

const createPlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    );
  }

  const { title, description, address, creator } = req.body;

  // let coordinates;
  // try {
  //   coordinates = await getCoordsForAddress(address);
  // } catch (error) {
  //   return next(error);
  // }

  // const title = req.body.title;
  const createdPlace = new Place({
    title,
    description,
    address,
    // location:coordinates,
    image: 'https://media.timeout.com/images/101705309/image.jpg',
    creator
  })

  try{
  await createdPlace.save()
  }
  catch (error){
    const err = HttpError('Creating place failed , please try again ',500)
    return next(err)
  }

  res.status(201).json({ place: createdPlace });
};

const updatePlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new HttpError('Invalid inputs passed, please check your data.', 422);
  }

  const { title, description } = req.body;
  const placeId = req.params.pid;
  let place 
  try{
  place = await Place.findById(placeId)
  place.title = title;
  place.description = description;
  }
  catch(error){
    return next(new HttpError("something went wrong , could not found placeid",500))
  }

  try{
      await place.save()
    }
    catch(error){
      return next(new HttpError("something went wrong , could not update ",500))
    }

  res.status(200).json({ place: place.toObject({getters:true}) });
};

const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid;
  let place;
  try{
  place = await Place.findById(placeId);
  }
  catch (error) {
    return next( new HttpError('Could not find a place for that id.', 404));
  }

  try{
        await place.remove()
  }
  catch (error) {
    return next( new HttpError('Could not find a place for that id.', 404));
  }

  res.status(200).json({ message: 'Deleted place.' });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
