const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');

// The `/api/tags` endpoint

router.get('/', async (req, res) => {
  try {
    // finds all tags and include the product according to the tag id
    const tagData = await Tag.findAll({
      include: [{
        model:Product,
        through: ProductTag
      }]
  });
  res.status(200).json(tagData);
} catch (err) {
  console.error(err);
  res.status(500).json(err);
}
});

router.get('/:id', async (req, res) => {
  try{
    // gets all tags by the primary key
    const tagData = await Tag.findByPk(req.params.id, {
      include: [{
        model:Product,
        through: ProductTag
      }]
    });
    // if tags didn't work then the there is no tag with that id
    if(!tagData){
      res.status(404).json({message: "No Tag with that id"});
      return;
    }

    res.status(200).json(tagData);
  }catch (err){
    res.status(500).json(err);
  }
});

router.post('/', async (req, res) => {
//  It should look something like this
//  {
//     "tag_name": "test_tag"
//  }
  try {
    const newTag = await Tag.create(req.body);
    res.status(201).json(newTag);
  } catch (err) {
    res.status(400).json(err);
  }
});


router.put('/:id', async (req, res) => {
  try {
    const updatedTag = await Tag.update(req.body, {
      where: {
        id: req.params.id,
      },
    });
    if (updatedTag[0] === 0) {
      res.status(404).json({ message: 'No Tag with that id' });
      return;
    }
    res.status(200).json({ message: 'Tag updated successfully!' });
  } catch (err) {
    res.status(500).json(err);
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deletedTag = await Tag.destroy({
      where: {
        id: req.params.id,
      },
    });
    if (!deletedTag) {
      res.status(404).json({ message: 'No Tag with that id' });
      return;
    }
    res.status(200).json({ message: 'Tag deleted successfully!' });
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
