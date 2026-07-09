const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', (request, response) => {
  Blog.find({}).then((blogs) => {
    response.json(blogs)
  })
})

blogsRouter.get('/api/blogs/:id', (request, response, next) => {
  Blog.findById(request.params.id)
    .then((blog) => {
      if (blog) {
        response.json(blog)
      } else {
        response.status(404).end()
      }
    })
    .catch((error) => next(error))
})

blogsRouter.post('/api/blogs', (request, response, next) => {
  const body = request.body

  if (!body) {
    return response.status(400).json({ error: 'fill all info' })
  }

  Blog.findOne({ author: body.author })
    .then((existingBlog) => {
      if (existingBlog) {
        return response.status(400).json({
          error: 'author must be unique'
        })
      }

      const blog = new Blog({
        title: body.title,
        author: body.author,
        url: body.url,
        likes: body.likes
      })

      return blog.save()
    })
    .then((savedBlog) => {
      if (savedBlog) {
        response.json(savedBlog)
      }
    })
    .catch((error) => next(error))
})

blogsRouter.put('/api/blogs/:id', (request, response, next) => {
  const { title, author, url, likes } = request.body

  Blog.findById(request.params.id)
    .then((blog) => {
      if (!blog) {
        return response.status(404).end()
      }

      ;((body.title = title),
        (body.author = author),
        (body.url = url),
        (body.likes = likes))

      return blog.save().then((updatedBlog) => {
        response.json(updatedBlog)
      })
    })
    .catch((error) => next(error))
})

blogsRouter.delete('/api/blogs/:id', (request, response, next) => {
  Blog.findByIdAndDelete(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch((error) => next(error))
})

module.exports = blogsRouter
