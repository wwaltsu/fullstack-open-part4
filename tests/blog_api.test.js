const blogs = require('../utils/list_helper')
const assert = require('node:assert')
const { test, after, beforeEach, describe } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const helper = require('./test_helper')
const Blog = require('../models/blog')
const { find, update } = require('lodash')
const bcrypt = require('bcrypt')
const User = require('../models/user')
const api = supertest(app)

// ### blog tests ###

describe('if there are initially some blogs saved', () => {
  beforeEach(async () => {
    await Blog.deleteMany({})
    await Blog.insertMany(helper.initialBlogs)
  })

  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')

    assert.strictEqual(response.body.length, helper.initialBlogs.length)
  })

  describe('adding a new blog', () => {
    test('a valid blog can be added ', async () => {
      const newBlog = {
        title: 'A clever fox',
        author: 'Franklin',
        url: 'https://asd.com'
      }

      await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)

      const titles = blogsAtEnd.map((r) => r.title)

      // added a blog with no initial likes
      const addedBlog = blogsAtEnd.find((blog) => blog.title === 'A clever fox')
      assert.strictEqual(addedBlog.likes, 0)
    })
  })

  describe('adding a new blog without author ', () => {
    test('a valid blog can be added ', async () => {
      const newBlog = {
        title: 'Finding dream',
        url: 'findDream.com',
        likes: 13
      }

      const response = await api.post('/api/blogs').send(newBlog).expect(400)
      const responseError = JSON.parse(response.text)

      assert.strictEqual(responseError.error, 'blog is missing author')
    })
  })

  describe('adding a new blog without title ', () => {
    test('a valid blog can be added ', async () => {
      const newBlog = {
        author: 'Jaakko',
        url: 'findDream.com',
        likes: 13
      }

      const response = await api.post('/api/blogs').send(newBlog).expect(400)
      const responseError = JSON.parse(response.text)

      assert.strictEqual(responseError.error, 'blog is missing title')
    })
  })

  describe('adding a new blog without url ', () => {
    test('missing url causes blog not to be posted', async () => {
      const newBlog = {
        title: 'Build a dream home',
        author: 'Jaakko',
        likes: 13
      }

      const response = await api.post('/api/blogs').send(newBlog).expect(400)
      const responseError = JSON.parse(response.text)

      assert.strictEqual(responseError.error, 'blog is missing url')
    })
  })

  test('blog has entry of id', async () => {
    const response = await api.get('/api/blogs')
    const hasId = Object.keys(response.body[0]).includes('id')
    assert.strictEqual(hasId, true)
  })

  describe('updating an added blog', () => {
    test('a valid blog can be added ', async () => {
      const blogsAtStart = await helper.blogsInDb()
      console.log('🚀 ~ blogsAtStart:', blogsAtStart)
      const blogToBeUpdated = blogsAtStart[0]

      const changedBlog = {
        title: 'A sad elephant',
        author: 'Franklin',
        url: 'https://bcd.com',
        likes: 15
      }

      await api
        .put(`/api/blogs/${blogToBeUpdated.id}`)
        .send(changedBlog)
        .expect(200)
        .expect('Content-Type', /application\/json/)

      const blogsAtEnd = await helper.blogsInDb()
      const updatedBlog = blogsAtEnd.find(
        (blog) => blog.id === blogToBeUpdated.id
      )
      console.log('🚀 ~ updatedBlog:', updatedBlog)

      const expectedBlog = {
        title: changedBlog.title,
        author: changedBlog.author,
        url: changedBlog.url,
        likes: changedBlog.likes,
        id: blogToBeUpdated.id
      }

      assert.deepEqual(updatedBlog, expectedBlog)
    })
  })

  describe('deletion of a blog', () => {
    test('succeeds with status code 204 if id is valid', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const blogToDelete = blogsAtStart[0]

      await api.delete(`/api/blogs/${blogToDelete.id}`).expect(204)

      const blogsAtEnd = await helper.blogsInDb()

      const ids = blogsAtEnd.map((n) => n.id)
      assert(!ids.includes(blogToDelete.id))

      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1)
    })
  })
  // ### user tests ###

  describe('when there is initially one user at db', () => {
    beforeEach(async () => {
      await User.deleteMany({})

      const passwordHash = await bcrypt.hash('sekret', 10)
      const user = new User({ username: 'root', passwordHash })

      await user.save()
    })

    test('creation succeeds with a fresh username', async () => {
      const usersAtStart = await helper.usersInDb()

      const newUser = {
        username: 'mluukkai',
        name: 'Matti Luukkainen',
        password: 'salainen'
      }

      await api
        .post('/api/users')
        .send(newUser)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const usersAtEnd = await helper.usersInDb()
      assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)

      const usernames = usersAtEnd.map((u) => u.username)
      assert(usernames.includes(newUser.username))
    })

    test('creation fails with proper statuscode and message if username already taken', async () => {
      const usersAtStart = await helper.usersInDb()

      const newUser = {
        username: 'root',
        name: 'Superuser',
        password: 'salainen'
      }

      const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      const usersAtEnd = await helper.usersInDb()
      assert(result.body.error.includes('expected `username` to be unique'))

      assert.strictEqual(usersAtEnd.length, usersAtStart.length)
    })
  })

  after(async () => {
    await mongoose.connection.close()
  })
})
