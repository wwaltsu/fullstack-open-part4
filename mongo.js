require('dotenv').config()
const mongoose = require('mongoose')
const Blog = require('./models/blog')

mongoose.connect(process.env.MONGODB_URI)

const blog = new Blog({
  title: 'Testing Express',
  author: 'Walter',
  url: 'https://example.com',
  likes: 10
})

blog.save().then(() => {
  console.log('blog saved')
  mongoose.connection.close()
})
