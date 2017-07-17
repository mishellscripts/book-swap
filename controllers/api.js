exports.getGoogleBooks = (req, res) => {
  res.render('api/google-books', {
    title: 'Google Books API'
  });
};
