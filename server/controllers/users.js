import User from '../models/auth.js'
import mongoose from 'mongoose'
import extend from 'lodash/extend.js'
import errorHandler from './../helpers/dbErrorHandler.js'
import formidable from 'formidable'
import fs from 'fs'
// import profileImage from '../../client/src/assets/profile-pic.png'

export const getAllUsers = async (req, res) => {
    try {
        const allUsers = await User.find()
        const allUserDetails = []
        allUsers.forEach(users => {
            allUserDetails.push({...users._doc})
        });
        // console.log(allUserDetails)
        res.status(200).send(allUserDetails)
    } catch (error) {
        console.log('controllers, users getAllUsers',error);
    }
}

export const updateProfile = async (req, res) => {
    const _id = req.params.id
    const { name, about, tags } = req.body
    if (!mongoose.Types.ObjectId.isValid(_id)) {
        return res.status(404).send('question unavailable')
    }
    try {
        const updatedProfile = await User.findByIdAndUpdate(_id,{$set:{'name':name,'about':about,'tags':tags}},{new:true})
        res.status(200).send(updatedProfile)
    } catch (error) {
        console.log('controllers, users updateProfile',error);
    }
}

const create = async (req, res) => {
    const user = new User(req.body)
    try {
      await user.save()
      return res.status(200).json({
        message: "Successfully signed up!"
      })
    } catch (err) {
      return res.status(400).json({
        error: errorHandler.getErrorMessage(err)
      })
    }
  }
  
  /**
   * Load user and append to req.
   */
  const userByID = async (req, res, next, id) => {
    try {
      let user = await User.findById(id).populate('following', '_id name')
      .populate('followers', '_id name')
      .exec()
      if (!user)
        return res.status('400').json({
          error: "User not found"
        })
      req.profile = user
      next()
    } catch (err) {
      return res.status('400').json({
        error: "Could not retrieve user"
      })
    }
  }
  
  const read = (req, res) => {
    req.profile.hashed_password = undefined
    req.profile.salt = undefined
    return res.json(req.profile)
  }
  
  const list = async (req, res) => {
    try {
      let users = await User.find().select('name email updated created')
      res.json(users)
    } catch (err) {
      return res.status(400).json({
        error: errorHandler.getErrorMessage(err)
      })
    }
  }
  
  const update = (req, res) => {
    let form = new formidable.IncomingForm()
    form.keepExtensions = true
    form.parse(req, async (err, fields, files) => {
      if (err) {
        return res.status(400).json({
          error: "Photo could not be uploaded"
        })
      }
      let user = req.profile
      user = extend(user, fields)
      user.updated = Date.now()
      if(files.photo){
        user.photo.data = fs.readFileSync(files.photo.path)
        user.photo.contentType = files.photo.type
      }
      try {
        await user.save()
        user.hashed_password = undefined
        user.salt = undefined
        res.json(user)
      } catch (err) {
        return res.status(400).json({
          error: errorHandler.getErrorMessage(err)
        })
      }
    })
  }
  
  const remove = async (req, res) => {
    try {
      let user = req.profile
      let deletedUser = await user.remove()
      deletedUser.hashed_password = undefined
      deletedUser.salt = undefined
      res.json(deletedUser)
    } catch (err) {
      return res.status(400).json({
        error: errorHandler.getErrorMessage(err)
      })
    }
  }
  
  const photo = (req, res, next) => {
    // if(req.profile.photo.data){
    //   res.set("Content-Type", req.profile.photo.contentType)
    //   return res.send(req.profile.photo.data)
    // }
    return res.sendFile(process.cwd()+'../../client/src/assets/profile-pic.png')
    // next()
    // return res.status(200)
  }
  
const defaultPhoto = (req, res) => {
    // return res.status(200)
    return res.sendFile(process.cwd()+'../../client/src/assets/profile-pic.png')
  }
  
  const addFollowing = async (req, res, next) => {
    try{
      await User.findByIdAndUpdate(req.body.userId, {$push: {following: req.body.followId}}) 
      next()
    }catch(err){
      return res.status(400).json({
        error: errorHandler.getErrorMessage(err)
      })
    }
  }
  
  const addFollower = async (req, res) => {
    try{
      let result = await User.findByIdAndUpdate(req.body.followId, {$push: {followers: req.body.userId}}, {new: true})
                              .populate('following', '_id name')
                              .populate('followers', '_id name')
                              .exec()
        result.hashed_password = undefined
        result.salt = undefined
        res.json(result)
      }catch(err) {
        return res.status(400).json({
          error: errorHandler.getErrorMessage(err)
        })
      }  
  }
  
  const removeFollowing = async (req, res, next) => {
    try{
      await User.findByIdAndUpdate(req.body.userId, {$pull: {following: req.body.unfollowId}}) 
      next()
    }catch(err) {
      return res.status(400).json({
        error: errorHandler.getErrorMessage(err)
      })
    }
  }
  const removeFollower = async (req, res) => {
    try{
      let result = await User.findByIdAndUpdate(req.body.unfollowId, {$pull: {followers: req.body.userId}}, {new: true})
                              .populate('following', '_id name')
                              .populate('followers', '_id name')
                              .exec() 
      result.hashed_password = undefined
      result.salt = undefined
      res.json(result)
    }catch(err){
        return res.status(400).json({
          error: errorHandler.getErrorMessage(err)
        })
    }
  }
  
  const findPeople = async (req, res) => {
    let following = req.profile.following
    following.push(req.profile._id)
    try {
      let users = await User.find({ _id: { $nin : following } }).select('name')
      res.json(users)
    }catch(err){
      return res.status(400).json({
        error: errorHandler.getErrorMessage(err)
      })
    }
  }
  
  export {
    create,
    userByID,
    read,
    list,
    remove,
    update,
    photo,
    defaultPhoto,
    addFollowing,
    addFollower,
    removeFollowing,
    removeFollower,
    findPeople
  }
  