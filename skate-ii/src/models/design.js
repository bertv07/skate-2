import mongoose from 'mongoose';

const designSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  style: {
    type: String,
    required: true
  }
});

const Design = mongoose.model('Design', designSchema);

export default Design;  // Usar "export default"
