const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// The `/api/products` endpoint

// get all products
router.get('/', async (req, res) => {
  try{
    const productData = await Product.findAll({
      include: [ Category, {
        model: Tag,
        through: ProductTag
      }]
    });
    res.status(200).json(productData);
  }catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

// get one product
router.get('/:id', async (req, res) => {
  try {
    const productData = await Product.findByPk(req.params.id, {
      include: [ Category, {
        model: Tag,
        through: ProductTag
      }]
    });

    if (!productData) {
      res.status(404).json({ message: 'No product with that id!' });
      return;
    }

    res.status(200).json(productData);
  } catch (err) {
    res.status(500).json(err);
  }
});

// create new product
router.post('/', (req, res) => {
  // {
  //   "product_name": "Post Example",
  //   "price": 150.00,
  //   "stock": 5,
  //   "tagIds": [1, 3, 5],
  //   "categoryId": 2
  // }
  let createdProduct; // To store the created product

  Product.create({
    product_name: req.body.product_name,
    price: req.body.price,
    stock: req.body.stock,
    // Set the category ID
    category_id: req.body.categoryId
  })
    .then((product) => {
       // Store the created product
      createdProduct = product;
      // if there are product tags, create pairings to bulk create in the ProductTag model
      if (req.body.tagIds.length) {
        const productTagIdArr = req.body.tagIds.map((tag_id) => {
          return {
            product_id: product.id,
            tag_id,
          };
        });
        return ProductTag.bulkCreate(productTagIdArr);
      }
    })
    .then(() => {
      // After creating tags, fetch the product with its associated data
      return Product.findOne({
        where: { id: createdProduct.id },
        include: [
          { model: Category, as: 'category' }, // Include category
          { model: Tag, through: ProductTag, as: 'tags' }, // Include tags
        ]
      });
    })
    .then((productWithTagsAndCategory) => {
      res.status(200).json(productWithTagsAndCategory);
    })
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
});


// update product
router.put('/:id', async (req, res) => {
  // {
  //   "product_name": "Updated Product",
  //   "price": 150.00,
  //   "stock": 5,
  //   "tagIds": [1, 3, 5],
  //   "categoryId": 2
  // }
  try {
    const updatedProduct = await Product.update(req.body, {
      where: {
        id: req.params.id,
      },
    });

    if (updatedProduct[0] === 0) {
      res.status(404).json({ message: 'No product found with this id' });
      return;
    }

    if (req.body.tagIds && req.body.tagIds.length) {
      const productTags = await ProductTag.findAll({
        where: { product_id: req.params.id }
      });

      const existingTagIds = productTags.map(({ tag_id }) => tag_id);
      const newTagIds = req.body.tagIds.filter(tag_id => !existingTagIds.includes(tag_id));
      const tagsToRemove = productTags.filter(({ tag_id }) => !req.body.tagIds.includes(tag_id));

      await ProductTag.destroy({
        where: {
          id: tagsToRemove.map(({ id }) => id)
        }
      });

      const newProductTags = newTagIds.map(tag_id => ({
        product_id: req.params.id,
        tag_id
      }));

      await ProductTag.bulkCreate(newProductTags);
    }

    // Update category ID if provided
    if (req.body.categoryId !== undefined) {
      await Product.update(
        { category_id: req.body.categoryId },
        {
          where: {
            id: req.params.id,
          },
        }
      );
    }

    // Fetch updated product with associated data
    const updatedProductWithAssociations = await Product.findOne({
      where: { id: req.params.id },
      include: [
        { model: Category, as: 'category' },
        { model: Tag, through: ProductTag, as: 'tags' },
      ]
    });

    res.status(200).json(updatedProductWithAssociations);
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
});


router.delete('/:id', async (req, res) => {
  try {
    // Delete a product by its `id` value
    const deletedProduct = await Product.destroy({
      where: {
        id: req.params.id,
      },
    });
    if (!deletedProduct) {
      res.status(404).json({ message: 'No product found with this id' });
      return;
    }
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json(err);
  }
});


module.exports = router;
