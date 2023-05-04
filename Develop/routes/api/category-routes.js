const router = require('express').Router();
const { Category, Product } = require('../../models');

// The `/api/categories` endpoint

// get all products
router.get('/', async (req, res) => {
  try {
    const categories = await Category.findAll({
      include: [{ model: Product}], // may have to include model: ProductTag if i want
    });
    res.status(200).json(categories);
  } catch (err) {
    res.status(500).json(err);
  };
});

  // find one category by its `id` value
router.get('/:id', async (req, res) => {
  try {
    const specificCategory = await Category.findByPk(req.params.id, {
      include: [{ model: Product}], // may have to include model: ProductTag if i want
    });
    if(!specificCategory){
      res.status(404).json({ message: 'Category not found' });
      return;
    };
    res.status(200).json(specificCategory);
  } catch (err) {
    res.status(500).json(err);
  };
});

  // create a new category
router.post('/', async (req, res) => {
  try {
    const categoryData = await Category.create(req.body);
    res.status(201).json(categoryData);
  } catch (err) {
    res.status(400).json(err);
  };
});

  // update a category by its `id` value
router.put('/:id', async (req, res) => {
  try {
    const category = await Category.update(req.body, {
      where: { id: req.params.id },
    });
    if (!category[0]) {
      res.status(404).json({ message: 'Category not found' });
      return;
    };
    res.status(200).json({ message: 'Category updated' });
  } catch (err) {
    res.status(500).json(err);
  };
});

  // delete a category by its `id` value
router.delete('/:id', async (req, res) => {
  try {
    const category = await Category.destroy({
      where: { id: req.params.id },
    });
    if (!category) {
      res.status(404).json({ message: 'Category not found' });
      return;
    };
    res.status(200).json({ message: 'Category deleted' });
  } catch (err) {
    res.status(500).json(err);
  };
});

module.exports = router;
