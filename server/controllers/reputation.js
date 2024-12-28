import * as tf from '@tensorflow/tfjs-node';
import User from '../models/auth.js'
import mongoose, { isValidObjectId } from 'mongoose'
import fetch from 'node-fetch'
const _model = async () => {
    const model = await tf.loadLayersModel('https://storage.googleapis.com/tfjs-models/tfjs/sentiment_cnn_v1/model.json');
    return model;
}
const _metadata  = async() =>{
    const data = await fetch("https://storage.googleapis.com/tfjs-models/tfjs/sentiment_cnn_v1/metadata.json")
    return data.json()
}
const predictSentiment  = async(text) =>{
    const metadata = await _metadata();
    const model = await _model();
    const trimmed = text.trim().toLowerCase().replace(/(\.|\,|\!)/g, '').split(' ');
    const inputBuffer = tf.buffer([1, metadata.max_len], "float32");
    trimmed.forEach((word, i) => inputBuffer.set(metadata.word_index[word] + metadata.index_from, 0, i));
    const input = inputBuffer.toTensor();
    const predictOut = model.predict(input);
    return predictOut.dataSync()[0];
}
export const updateReputations = async (userId, reply) => {
    const user = await User.findById(userId);
    console.log('updateReputations');
    const pred = await predictSentiment(reply);
    console.log(pred);
    if (pred > 0.6)
        await User.findByIdAndUpdate(userId, { $inc: { reputations: 5 } });
    else {
        await User.findByIdAndUpdate(userId,{ $inc: { reputations :-1 } })
    }
    console.log('after update');
    return
}
