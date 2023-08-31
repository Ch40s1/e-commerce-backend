const router = require('express').Router();
const { Category, Product } = require('../../models');

// The `/api/categories` endpoint

router.get('/', async (req, res) => {
  try {
    const categories = await Category.findAll({
      include: [{ model: Product }],
    });
    // console.log(categories);
    res.status(200).json(categories);
  } catch (err) {
    console.error(err); // Log the error
    res.status(500).json(err);
  }
});

router.get('/:id', async (req, res) => {
  try {
    // holds the data for the id. look for it by the primary key
    const category = await Category.findByPk(req.params.id, {
      include: Product,
    });

    if (!category) {
      res.status(404).json({ message: 'No category with that id!' });
      return;
    }

    res.status(200).json(category);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.post('/', (req, res) => {
  // creates a new value and add it to the database
  Category.create(req.body)
  .then((categoryData) => {

    res.status(200).json(categoryData);

  })
  .catch((err) => {
    console.log(err);
    res.status(400).json(err);
  });
});


router.put('/:id', async (req, res) => {
  // try and catch method
  try {
    // creates a variable that holds the updated data
    const updatedCategory = await Category.update(
      req.body,
      {
        // id matches the /api/categories/:id
        where: {
          id: req.params.id,
        },
      }
    );
      // if the beinning value of the array is still the same then nothing happened
    if (updatedCategory[0] === 0) {
      // respond with 404
      res.status(404).json({ message: 'No category with that id!' });
      return;
    }
    // othewise give back a 200
    res.status(200).json({ message: 'Category updated successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

router.delete('/:id', async (req, res) => {
  try {
    // variable holds the deleted data
    const deletedCategory = await Category.destroy({
      where: {
        id: req.params.id,
      },
    });
    // if it did not succeed then there is no category with that id
    if (!deletedCategory) {
      res.status(404).json({ message: 'No category with that id!' });
      return;
    }
    // respond with a 200 is seccessfull
    res.status(200).json({ message: 'Category deleted successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

module.exports = router;
