const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', async (request, response) => {
  Blog.find({}).then((blogs) => {
    response.json(blogs)
  })
})

blogsRouter.get('/:id', async (request, response, next) => {
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

blogsRouter.post('/', async (request, response, next) => {
  const body = request.body

  if (!body.title) {
    console.log('Missing title')
    return response.status(400).json({ error: 'blog is missing title' })
  }
  if (!body.url) {
    return response.status(400).json({ error: 'blog is missing url' })
  }
  if (!body.author) {
    return response.status(400).json({ error: 'blog is missing author' })
  }
  Blog.findOne({ author: body.author }).then((existingBlog) => {
    if (existingBlog) {
      return response.status(400).json({
        error: 'author must be unique'
      })
    }

    const blog = new Blog({
      title: body.title,
      author: body.author,
      url: body.url,
      likes: body.likes || 0
    })
    blog
      .save()
      .then((savedBlog) => {
        response.status(201).json(savedBlog)
      })
      .catch((error) => next(error))
  })
})

blogsRouter.put('/:id', async (request, response, next) => {
  const { title, author, url, likes } = request.body

  Blog.findById(request.params.id)
    .then((blog) => {
      if (!blog) {
        return response.status(404).end()
      }

      blog.title = title
      blog.author = author
      blog.url = url
      blog.likes = likes

      return blog.save().then((updatedBlog) => {
        response.json(updatedBlog)
      })
    })
    .catch((error) => next(error))
})

blogsRouter.delete('/:id', async (request, response, next) => {
  Blog.findByIdAndDelete(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch((error) => next(error))
})

module.exports = blogsRouter
