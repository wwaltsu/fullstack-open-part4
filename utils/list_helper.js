// Load the full build.
const lodash = require('lodash')

const mostLikes = (blogs) => {
  const likesCount = lodash.map(blogs, (blog) => ({
    author: blog.author,
    likes: blog.likes
  }))

  const authorPairs = lodash.groupBy(likesCount, (blog) => blog.author)

  const authorLikes = lodash.mapValues(authorPairs, (blogs) =>
    lodash.sumBy(blogs, (blog) => blog.likes)
  )

  const authorMostLikes = lodash.maxBy(
    lodash.toPairs(authorLikes),
    (pair) => pair[1]
  )

  // Format result as an object
  return { author: authorMostLikes[0], likes: authorMostLikes[1] }
}

const mostBlogs = (blogs) => {
  // Count how many blogs each author has
  const authorCounts = lodash.countBy(blogs, (blog) => blog.author)

  // Convert object into array of [author, count] pairs
  const authorPairs = lodash.toPairs(authorCounts)

  // Find the author with the highest blog count
  const authorMaxBlogs = lodash.maxBy(authorPairs, (pair) => pair[1])

  // Format result as an object
  return { author: authorMaxBlogs[0], blogs: authorMaxBlogs[1] }
}

const favoriteBlog = (blogs) => {
  let favorite = blogs[0]

  blogs.forEach((blog) => {
    if (blog.likes > favorite.likes) {
      favorite = blog
    }
  })
  return favorite
}

const totalLikes = (blogs) => blogs.reduce((sum, blog) => sum + blog.likes, 0)

const dummy = (blogs) => {
  return 1
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}
