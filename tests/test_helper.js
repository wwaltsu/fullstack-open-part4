const Blog = require('../models/blog')

const initialBlogs = [
  {
    title: 'Football',
    author: 'Jon',
    url: 'https://example.com',
    likes: 10
  },
  {
    title: 'Baseball',
    author: 'Doe',
    url: 'https://abc.com',
    likes: 12
  }
]
const nonExistingId = async () => {
  const blog = new Blog({ content: 'willremovethissoon' })
  await blog.save()
  await blog.deleteOne()

  return blog._id.toString()
}

const blogsInDb = async () => {
  const blogs = await blog.find({})
  return blogs.map((blog) => blog.toJSON())
}

module.exports = {
  initialBlogs,
  nonExistingId,
  blogsInDb
}
